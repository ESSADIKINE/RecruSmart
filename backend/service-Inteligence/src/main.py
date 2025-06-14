import asyncio
import logging
from fastapi import FastAPI, BackgroundTasks, Header
from aio_pika import connect_robust, ExchangeType
from .offer_consumer import process_scoring_request
from .pdf_extractor import parse_cv
from .config import (
    RABBITMQ_HOST, 
    RABBITMQ_EXCHANGE, 
    RABBITMQ_ROUTING_KEY,
    CANDIDATS_POPULATE_CV_URL
)
import aiohttp
import json
import struct

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Service Intelligence")

# Variables globales pour RabbitMQ
rabbitmq_connection = None
rabbitmq_channel = None
rabbitmq_exchange = None
rabbitmq_queue = None

# Set pour stocker les candidats déjà traités
processed_candidates = set()

def decode_java_serialized(data: bytes) -> dict:
    """Décode un message sérialisé en Java"""
    try:
        # Vérifier si c'est un message Java sérialisé
        if data.startswith(b'\xac\xed\x00\x05'):
            # Extraire les paires clé-valeur
            result = {}
            pos = 0x70  # Position après l'en-tête de base
            
            # Lire le nombre de paires (2 bytes après TC_BLOCKDATA)
            if pos + 3 > len(data):
                return {}
            
            # Vérifier TC_BLOCKDATA
            if data[pos] != 0x77:  # TC_BLOCKDATA
                return {}
            pos += 1
            
            # Lire la longueur du bloc
            block_len = data[pos]
            pos += 1
            
            # Lire le nombre de paires (2 bytes)
            if pos + 2 > len(data):
                return {}
            
            num_pairs = struct.unpack('>H', data[pos:pos+2])[0]
            pos += 2
            
            # Lire chaque paire clé-valeur
            for _ in range(num_pairs):
                try:
                    # Lire la longueur de la clé
                    if pos + 2 > len(data):
                        break
                    key_len = struct.unpack('>H', data[pos:pos+2])[0]
                    pos += 2
                    
                    # Lire la clé
                    if pos + key_len > len(data):
                        break
                    key = data[pos:pos+key_len].decode('utf-8')
                    pos += key_len
                    
                    # Lire la longueur de la valeur
                    if pos + 2 > len(data):
                        break
                    val_len = struct.unpack('>H', data[pos:pos+2])[0]
                    pos += 2
                    
                    # Lire la valeur
                    if pos + val_len > len(data):
                        break
                    value = data[pos:pos+val_len].decode('utf-8')
                    pos += val_len
                    
                    result[key] = value
                except Exception as e:
                    logger.error(f"Erreur lors du décodage d'une paire clé-valeur: {str(e)}")
                    break
            
            return result
        else:
            # Essayer de décoder comme JSON
            try:
                return json.loads(data.decode('utf-8'))
            except json.JSONDecodeError:
                return {}
    except Exception as e:
        logger.error(f"Erreur lors du décodage du message: {str(e)}")
        return {}

async def process_cv_message(message):
    """Traite les messages de CV reçus"""
    try:
        # Décoder le message (Java ou JSON)
        data = decode_java_serialized(message.body)
        logger.info(f"Message décodé: {data}")
        
        # Vérifier si le message est vide
        if not data:
            logger.warning("Message vide reçu, ignoré")
            return
            
        candidat_id = data.get("candidatId")
        cv_url = data.get("cvUrl")
        token = data.get("token")  # Récupérer le token du message
        
        if not candidat_id or not cv_url:
            logger.error(f"Message incomplet: {data}")
            return

        # Vérifier si le candidat a déjà été traité
        if candidat_id in processed_candidates:
            logger.info(f"Candidat {candidat_id} déjà traité, message ignoré")
            return

        # Vérifier si le token est présent
        if not token:
            logger.error("Token manquant dans le message")
            return

        # Extraire les données du CV
        result = parse_cv(cv_url)
        
        # Préparer les données pour l'API
        payload = {
            "id": candidat_id,
            "email": data.get("email"),
            "experiences": result.get("experiences", {}),
            "competences": result.get("competences", {}),
            "langues": result.get("langues", {}),
            "educations": result.get("educations", {})
        }

        # Envoyer les données au service Candidat avec le token reçu
        async with aiohttp.ClientSession() as session:
            async with session.post(
                CANDIDATS_POPULATE_CV_URL,
                json=payload,
                headers={"Authorization": token}  # Utiliser le token reçu
            ) as response:
                if response.status == 200:
                    logger.info(f"CV traité avec succès pour le candidat {candidat_id}")
                    processed_candidates.add(candidat_id)
                else:
                    logger.error(f"Erreur lors du traitement du CV: {await response.text()}")

    except Exception as e:
        logger.error(f"Erreur lors du traitement du message: {str(e)}")

async def process_scoring_message(message):
    """Traite les messages de scoring reçus"""
    try:
        data = json.loads(message.body.decode())
        offre_id = data.get("offreId")
        token = data.get("token")
        if offre_id and token:
            await process_scoring_request(offre_id, token)
    except Exception as e:
        logger.error(f"Erreur lors du traitement du message de scoring: {str(e)}")

async def setup_rabbitmq():
    """Configure la connexion RabbitMQ"""
    global rabbitmq_connection, rabbitmq_channel, rabbitmq_exchange, rabbitmq_queue
    
    try:
        # Connexion à RabbitMQ
        rabbitmq_connection = await connect_robust(f"amqp://{RABBITMQ_HOST}")
        rabbitmq_channel = await rabbitmq_connection.channel()
        
        # Déclarer l'échange
        rabbitmq_exchange = await rabbitmq_channel.declare_exchange(
            RABBITMQ_EXCHANGE,
            ExchangeType.TOPIC,
            durable=True
        )
        
        # Déclarer la queue pour les CV
        rabbitmq_queue = await rabbitmq_channel.declare_queue(
            "intelligence.cv.queue",
            durable=True,  # Durable pour persister les messages
            auto_delete=False,  # Ne pas supprimer la queue
            exclusive=False  # Non exclusive pour permettre plusieurs connexions
        )
        
        # Lier la queue à l'échange
        await rabbitmq_queue.bind(
            rabbitmq_exchange,
            routing_key=RABBITMQ_ROUTING_KEY
        )
        
        # Lier la queue pour le scoring
        scoring_queue = await rabbitmq_channel.declare_queue(
            "intelligence.scoring.queue",
            durable=True,
            auto_delete=False,
            exclusive=False
        )
        await scoring_queue.bind(
            rabbitmq_exchange,
            routing_key="Recruitment.Scoring.Demande"
        )
        
        # Démarrer les consommateurs
        await rabbitmq_queue.consume(process_cv_message)
        await scoring_queue.consume(process_scoring_message)
        
        logger.info("RabbitMQ configuré avec succès")
        
    except Exception as e:
        logger.error(f"Erreur lors de la configuration de RabbitMQ: {str(e)}")
        raise

@app.on_event("startup")
async def startup_event():
    """Événement de démarrage de l'application"""
    await setup_rabbitmq()

@app.on_event("shutdown")
async def shutdown_event():
    """Événement d'arrêt de l'application"""
    if rabbitmq_connection:
        await rabbitmq_connection.close()

@app.post("/score/{offre_id}")
async def score_offre(offre_id: str, background_tasks: BackgroundTasks, authorization: str = Header(...)):
    """Endpoint pour déclencher le scoring d'une offre"""
    token = authorization.replace("Bearer ", "")
    background_tasks.add_task(process_scoring_request, offre_id, token)
    return {"message": "Scoring démarré en arrière-plan"} 