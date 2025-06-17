import os

# RabbitMQ
RABBITMQ_HOST        = os.getenv("RABBITMQ_HOST", "rabbitmq")
RABBITMQ_EXCHANGE    = os.getenv("RABBITMQ_EXCHANGE", "recrusmart.events")
RABBITMQ_ROUTING_KEY = os.getenv("RABBITMQ_ROUTING_KEY", "Candidat.CV.Recu")

# *** TOUS les appels HTTP passent par le Gateway ***
API_GATEWAY          = os.getenv("API_GATEWAY_HOST", "http://api-gateway")   # même réseau docker

OFFRE_SERVICE_URL         = f"{API_GATEWAY}/api/offres"          # ex : POST {OFFRE_SERVICE_URL}/{id}/candidats
CANDIDATS_POPULATE_CV_URL = f"{API_GATEWAY}/api/candidats/remplir-cv"
