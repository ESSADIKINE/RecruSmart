import pika
import json
import logging
from pdf_extractor import download_pdf, parse_cv
from config import RABBITMQ_HOST, RABBITMQ_EXCHANGE, RABBITMQ_ROUTING_KEY, CANDIDATS_POPULATE_CV_URL
import requests

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

        pdf_path = download_pdf(cv_url)
        result = parse_cv(pdf_path)

        # Sécurité : forcer les champs à être des dict
        def ensure_dict(val):
            return val if isinstance(val, dict) else {}

        payload = {
            "id": candidat_id,
            "experiences": ensure_dict(result.get("experiences")),
            "competences": ensure_dict(result.get("competences")),
            "langues": ensure_dict(result.get("langues")),
            "educations": ensure_dict(result.get("educations")),
            "anneesExperience": result.get("annees_experience", 0)
        }
        logging.info(f"Payload envoyé à /candidats/remplir-cv: {payload}")
        logging.info(f"Types: exp={type(payload['experiences'])}, comp={type(payload['competences'])}, lang={type(payload['langues'])}, edu={type(payload['educations'])}")

        resp = requests.post(CANDIDATS_POPULATE_CV_URL, json=payload)
        if resp.status_code == 200:
            logging.info("Profil candidat mis à jour avec succès")
        else:
            logging.error(f"Erreur lors de l'appel à /remplir-cv: {resp.status_code} {resp.text}")
    except Exception as e:
        logging.exception(f"Erreur lors du traitement du message RabbitMQ: {e}")

def start_consumer():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
    print(f"OK: Connexion RabbitMQ réussie (host={RABBITMQ_HOST})")
    channel = connection.channel()
    channel.exchange_declare(exchange=RABBITMQ_EXCHANGE, exchange_type='topic', durable=True)
    result = channel.queue_declare(queue='', exclusive=True)
    queue_name = result.method.queue
    channel.queue_bind(exchange=RABBITMQ_EXCHANGE, queue=queue_name, routing_key=RABBITMQ_ROUTING_KEY)
    print(f"[RabbitMQ] En attente de messages sur routing key: {RABBITMQ_ROUTING_KEY}")
    channel.basic_consume(queue=queue_name, on_message_callback=on_message, auto_ack=True)
    logging.info("En attente de messages RabbitMQ...")
    channel.start_consuming()

if __name__ == "__main__":
    start_consumer() 