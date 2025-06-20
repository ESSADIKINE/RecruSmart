import asyncio
import logging
import os
import consul
from fastapi import FastAPI, BackgroundTasks, Header, HTTPException
from aio_pika import connect_robust, ExchangeType
from .offer_consumer import process_scoring_message, start_consumer
from .pdf_extractor import parse_cv
from .config import (
    RABBITMQ_HOST, 
    RABBITMQ_EXCHANGE, 
    RABBITMQ_ROUTING_KEY,
    CANDIDATS_POPULATE_CV_URL
)
import aiohttp
import json
from typing import Optional

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Service Intelligence")

class RabbitMQManager:
    def __init__(self):
        self.connection = None
        self.channel = None
        self.exchange = None
        self.queue = None
        self.is_connected = False

    async def connect(self):
        try:
            self.connection = await connect_robust(f"amqp://{RABBITMQ_HOST}")
            self.channel = await self.connection.channel()
            
            # Déclarer l'échange
            self.exchange = await self.channel.declare_exchange(
                RABBITMQ_EXCHANGE,
                ExchangeType.TOPIC,
                durable=True
            )
            
            # Déclarer la queue pour les CV
            self.queue = await self.channel.declare_queue(
                "intelligence.cv.queue",
                durable=True,
                auto_delete=False,
                exclusive=False
            )
            
            # Lier la queue à l'échange
            await self.queue.bind(
                self.exchange,
                routing_key=RABBITMQ_ROUTING_KEY
            )
            
            # Lier la queue pour le scoring
            scoring_queue = await self.channel.declare_queue(
                "intelligence.scoring.queue",
                durable=True,
                auto_delete=False,
                exclusive=False
            )
            await scoring_queue.bind(
                self.exchange,
                routing_key="Recruitment.Scoring.Demande"
            )
            
            # Démarrer les consommateurs
            await self.queue.consume(process_cv_message)
            await scoring_queue.consume(process_scoring_message)
            
            self.is_connected = True
            logger.info("RabbitMQ configuré avec succès")
            
        except Exception as e:
            self.is_connected = False
            logger.error(f"Erreur lors de la configuration de RabbitMQ: {str(e)}")
            raise

    async def close(self):
        if self.connection:
            await self.connection.close()
            self.is_connected = False

rabbitmq = RabbitMQManager()
processed_candidates = set()
consul_client = None
service_id = None

def register_with_consul():
    global consul_client, service_id
    consul_client = consul.Consul(host=os.getenv("CONSUL_HOST", "consul"),
                                 port=int(os.getenv("CONSUL_PORT", "8500")))
    service_name = os.getenv("SERVICE_NAME", "intelligence-service")
    service_host = os.getenv("SERVICE_HOST", "intelligence-service")
    service_port = int(os.getenv("PORT", "8082"))
    service_id = f"{service_name}-{service_port}"
    check = consul.Check.http(
        f"http://{service_host}:{service_port}/health",
        interval="10s"
    )
    consul_client.agent.service.register(
        name=service_name,
        service_id=service_id,
        address=service_host,
        port=service_port,
        check=check
    )
    logger.info("Registered with Consul")

def deregister_from_consul():
    if consul_client and service_id:
        try:
            consul_client.agent.service.deregister(service_id)
        except Exception as e:
            logger.error(f"Consul deregistration failed: {e}")

async def process_cv_message(message):
    """Traite les messages de CV reçus"""
    try:
        data = json.loads(message.body.decode())
        logger.info(f"Message reçu: {data}")
        
        if not data:
            logger.warning("Message vide reçu, ignoré")
            return
            
        candidat_id = data.get("candidatId")
        cv_url = data.get("cvUrl")
        token = data.get("token")
        
        if not all([candidat_id, cv_url, token]):
            logger.error(f"Message incomplet: {data}")
            return

        if candidat_id in processed_candidates:
            logger.info(f"Candidat {candidat_id} déjà traité, message ignoré")
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

        # Envoyer les données au service Candidat avec retry
        max_retries = 3
        retry_delay = 1  # seconds
        
        for attempt in range(max_retries):
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        CANDIDATS_POPULATE_CV_URL,
                        json=payload,
                        headers={"Authorization": token}
                    ) as response:
                        if response.status == 200:
                            logger.info(f"CV traité avec succès pour le candidat {candidat_id}")
                            processed_candidates.add(candidat_id)
                            return
                        elif response.status == 404:
                            logger.error(f"Endpoint non trouvé: {CANDIDATS_POPULATE_CV_URL}")
                            return
                        else:
                            error_text = await response.text()
                            logger.error(f"Erreur HTTP {response.status}: {error_text}")
                            
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay * (attempt + 1))
                    
            except Exception as e:
                logger.error(f"Erreur lors de la tentative {attempt + 1}: {str(e)}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay * (attempt + 1))
                else:
                    raise

    except Exception as e:
        logger.error(f"Erreur lors du traitement du message: {str(e)}")

@app.on_event("startup")
async def startup_event():
    """Événement de démarrage de l'application"""
    try:
        # Configurer RabbitMQ
        await rabbitmq.connect()
        
        # Démarrer le consumer RabbitMQ dans un thread séparé
        import threading
        consumer_thread = threading.Thread(target=start_consumer)
        consumer_thread.daemon = True
        consumer_thread.start()
        
        register_with_consul()
        
    except Exception as e:
        logger.error(f"Erreur lors du démarrage: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Événement d'arrêt de l'application"""
    await rabbitmq.close()
    deregister_from_consul()

@app.get("/health")
async def health_check():
    """Endpoint de vérification de santé"""
    if not rabbitmq.is_connected:
        raise HTTPException(status_code=503, detail="Service non connecté à RabbitMQ")
    return {"status": "healthy", "rabbitmq": "connected"}

@app.post("/score/{offre_id}")
async def score_offre(offre_id: str, background_tasks: BackgroundTasks, authorization: str = Header(...)):
    """Endpoint pour déclencher le scoring d'une offre"""
    if not rabbitmq.is_connected:
        raise HTTPException(status_code=503, detail="Service non connecté à RabbitMQ")
    
    token = authorization.replace("Bearer ", "")
    background_tasks.add_task(process_scoring_message, {
        "offreId": offre_id,
        "token": token
    })
    return {"message": "Scoring démarré en arrière-plan"} 