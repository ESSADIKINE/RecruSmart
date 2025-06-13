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

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Service Intelligence")

# Variables globales pour RabbitMQ
rabbitmq_connection = None
rabbitmq_channel = None
rabbitmq_exchange = None
rabbitmq_queue = None

async def process_cv_message(message):
    """Traite les messages de CV reçus"""
    try:
        data = json.loads(message.body.decode())
        candidat_id = data.get("candidatId")
        cv_url = data.get("cvUrl")
        token = data.get("token")
        
        if not candidat_id or not cv_url:
            logger.error(f"Message incomplet: {data}")
            return

        # Si pas de token dans le message, on utilise un token par défaut pour le service
        if not token:
            token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NGI1OWI2NTRhZmFjOTJjYzg0OTM0MSIsImVtYWlsIjoicmVjcnV0ZXVyMUBnbWFpbC5jb20iLCJyb2xlIjoiUkVDUlVURVVSIiwiaWF0IjoxNzQ5ODI0MzU3LCJleHAiOjE3NDk5MTA3NTd9.VEBp-Kc7lDSj73K_F40MhllqzKdpjAZG4PJewXtd5CY"
            logger.info(f"Utilisation du token par défaut pour le candidat {candidat_id}")

        # Extraire les données du CV
        result = parse_cv(cv_url)
        
        # Préparer les données pour l'API
        payload = {
            "id": candidat_id,
            "experiences": result.get("experiences", {}),
            "competences": result.get("competences", {}),
            "langues": result.get("langues", {}),
            "educations": result.get("educations", {}),
            "anneesExperience": result.get("annees_experience", 0)
        }

        # Envoyer les données au service Candidat
        async with aiohttp.ClientSession() as session:
            async with session.post(
                CANDIDATS_POPULATE_CV_URL,
                json=payload,
                headers={"Authorization": f"Bearer {token}"}
            ) as response:
                if response.status == 200:
                    logger.info(f"CV traité avec succès pour le candidat {candidat_id}")
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
            durable=True
        )
        
        # Lier la queue à l'échange
        await rabbitmq_queue.bind(
            rabbitmq_exchange,
            routing_key=RABBITMQ_ROUTING_KEY
        )
        
        # Lier la queue pour le scoring
        scoring_queue = await rabbitmq_channel.declare_queue(
            "intelligence.scoring.queue",
            durable=True
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

@app.get("/health")
async def health_check():
    """Endpoint de santé"""
    return {"status": "healthy"}

@app.post("/score/{offre_id}")
async def score_offre(offre_id: str, background_tasks: BackgroundTasks, authorization: str = Header(...)):
    """Endpoint pour déclencher le scoring d'une offre"""
    token = authorization.replace("Bearer ", "")
    background_tasks.add_task(process_scoring_request, offre_id, token)
    return {"message": "Scoring démarré en arrière-plan"} 