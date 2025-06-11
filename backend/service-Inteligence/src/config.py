import os

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_EXCHANGE = os.getenv("RABBITMQ_EXCHANGE", "recrusmart.events")
RABBITMQ_ROUTING_KEY = os.getenv("RABBITMQ_ROUTING_KEY", "Candidat.CV.Recu")
CANDIDATS_POPULATE_CV_URL = os.getenv("CANDIDATS_POPULATE_CV_URL", "http://localhost:8084/candidats/remplir-cv") 