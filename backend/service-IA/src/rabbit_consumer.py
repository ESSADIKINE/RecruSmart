import pika
import json
import requests
import logging
from src.core.pdf_processing import process_resume

# Configuration RabbitMQ
RABBITMQ_HOST = "rabbitmq"
RABBITMQ_EXCHANGE = "recrusmart.events"
RABBITMQ_ROUTING_KEY = "Candidat.CV.Recu"

# URL du service-candidats (adapter le port si besoin)
CANDIDATS_POPULATE_CV_URL = "http://service-candidats:8080/api/candidats/populate-cv"

logging.basicConfig(level=logging.INFO)


def on_message(ch, method, properties, body):
    logging.info("Message reçu de RabbitMQ")
    try:
        data = json.loads(body)
        candidat_id = data.get("candidatId")
        cv_url = data.get("cvUrl")
        if not candidat_id or not cv_url:
            logging.error(f"Message incomplet: {data}")
            return

        # 1. Traiter le CV (adapter process_resume si besoin)
        result = process_resume(cv_url, candidat_id)

        # 2. Construire le payload pour populate-cv
        payload = {
            "id": candidat_id,
            "experiences": result.get("experiences", []),
            "competences": result.get("competences", []),
            "langues": result.get("langues", []),
            "educations": result.get("educations", [])
        }

        # 3. Appeler le service-candidats
        resp = requests.post(CANDIDATS_POPULATE_CV_URL, json=payload)
        if resp.status_code == 200:
            logging.info("Profil candidat mis à jour avec succès")
        else:
            logging.error(f"Erreur lors de l'appel à /populate-cv: {resp.status_code} {resp.text}")
    except Exception as e:
        logging.exception(f"Erreur lors du traitement du message RabbitMQ: {e}")

def start_consumer():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
    channel = connection.channel()
    channel.exchange_declare(exchange=RABBITMQ_EXCHANGE, exchange_type='topic', durable=True)
    result = channel.queue_declare(queue='', exclusive=True)
    queue_name = result.method.queue
    channel.queue_bind(exchange=RABBITMQ_EXCHANGE, queue=queue_name, routing_key=RABBITMQ_ROUTING_KEY)
    channel.basic_consume(queue=queue_name, on_message_callback=on_message, auto_ack=True)
    logging.info("En attente de messages RabbitMQ...")
    channel.start_consuming()

if __name__ == "__main__":
    start_consumer() 