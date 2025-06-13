import json
import aiohttp
import os
import asyncio
from typing import List, Dict, Any
from .config import OFFRE_SERVICE_URL

async def get_offre(offre_id: str, token: str) -> Dict[str, Any]:
    """Récupère les détails d'une offre depuis le service Offres"""
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"{OFFRE_SERVICE_URL}/offres/{offre_id}",
            headers={"Authorization": f"Bearer {token}"}
        ) as response:
            if response.status == 200:
                return await response.json()
            return None

async def add_candidat_to_offre(offre_id: str, candidat: Dict[str, Any]) -> bool:
    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{OFFRE_SERVICE_URL}/offres/{offre_id}/candidats",
            json=candidat,
            headers={"Authorization": f"Bearer {SERVICE_JWT}"}
        ) as response:
            return response.status == 200

async def update_candidat_score(offre_id: str, candidat: Dict[str, Any], token: str) -> bool:
    """Met à jour le score d'un candidat pour une offre"""
    async with aiohttp.ClientSession() as session:
        async with session.put(
            f"{OFFRE_SERVICE_URL}/candidatures/offre/{offre_id}/candidat/{candidat['utilisateurId']}/score",
            json={"score": candidat["score"]},
            headers={"Authorization": f"Bearer {token}"}
        ) as response:
            return response.status == 200

async def scorer_candidats(offre: Dict[str, Any]) -> List[Dict[str, Any]]:
    # Récupérer les candidats de l'offre
    candidats = []
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{OFFRE_SERVICE_URL}/candidatures/offre/{offre['_id']}") as response:
            if response.status == 200:
                data = await response.json()
                candidats = data.get('candidats', [])

    # Calculer les scores pour chaque candidat
    scored_candidats = []
    for candidat in candidats:
        score = 0
        # Logique de scoring basée sur les compétences
    if 'competences' in offre and 'competences' in candidat:
        print("Both 'offre' and 'candidat' have 'competences' field")
        competences_offre = set(offre['competences'])
        competences_candidat = set(candidat.get('competences', []))
        print(f"Offre competences: {competences_offre}")
        print(f"Candidat competences: {competences_candidat}")
    
        common_competences = competences_offre.intersection(competences_candidat)
        print(f"Common competences: {common_competences}")
    
        score_increment = len(common_competences) * 10
        print(f"Adding {score_increment} points to score")
    
        score += score_increment
        print(f"New score: {score}")

        # Logique de scoring basée sur l'expérience
        if 'annees_experience' in candidat:
            score += min(candidat['annees_experience'] * 5, 50)

        # Logique de scoring basée sur le niveau d'étude
        if 'niveau_etude' in candidat and 'niveau_etude' in offre:
            if candidat['niveau_etude'] == offre['niveau_etude']:
                score += 20

        scored_candidats.append({
            "utilisateurId": candidat["utilisateurId"],
            "score": min(score, 100)
        })

    return scored_candidats

def get_profil(utilisateur_id: str) -> Dict[str, Any]:
    try:
        resp = requests.get(f"http://localhost:8084/candidats/{utilisateur_id}")
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"[ERROR] get_profil({utilisateur_id}): {e}")
        return None

def safe_json_loads(val, default):
    """Charge un JSON de manière sécurisée"""
    try:
        return json.loads(val) if isinstance(val, str) else val
    except Exception:
        return default

def compute_score(candidat: Dict[str, Any], offre: Dict[str, Any]) -> int:
    """Calcule le score d'un candidat pour une offre"""
    score = 0
    
    # 1. Compétences (5 pts chacune, bonus de 1-5 pts selon le niveau)
    offre_competences = set(offre.get('competences', []))
    candidat_competences = safe_json_loads(candidat.get('competences', '{}'), {})
    exp_competences = set()
    experiences = safe_json_loads(candidat.get('experiences', '{}'), {})
    for exp in experiences.values():
        for v in exp.values():
            if isinstance(v, str):
                exp_competences.add(v)
    
    # Vérifier chaque compétence requise
    for comp in offre_competences:
        # Vérifier dans les compétences principales
        if comp in candidat_competences:
            niveau = candidat_competences[comp]
            score += 5 + niveau  # 5 points de base + niveau (1-5)
        # Vérifier dans les expériences
        elif comp in exp_competences:
            score += 5  # Points de base sans bonus de niveau

    # 2. Années d'expérience (15 pts si suffisant)
    if int(candidat.get('anneesExperience', 0)) >= int(offre.get('experienceMin', 0) or 0):
        score += 15

    # 3. Niveau d'étude (15 pts si correspond)
    candidat_niveau = str(candidat.get('niveauEtude', '')).lower()
    offre_niveau = str(offre.get('niveauEtude', '')).lower()
    if candidat_niveau == offre_niveau:
        score += 15
    elif candidat_niveau == 'bac+4' and offre_niveau == 'bac+5':
        score += 10  # Bonus partiel pour niveau proche

    # 4. Domaine (15 pts si correspond)
    domaines = [d.lower() for d in safe_json_loads(candidat.get('domaines', '[]'), [])]
    if str(offre.get('domaine', '')).lower() in domaines:
        score += 15

    # 5. Langue (15 pts si correspond)
    langues = [l.lower() for l in safe_json_loads(candidat.get('langues', '{}'), {}).keys()]
    if str(offre.get('langue', '').lower()) in langues:
        score += 15

    return min(score, 100)

async def process_scoring_request(offre_id: str, token: str):
    """Traite une demande de scoring pour une offre"""
    print(f"Traitement du scoring pour l'offre {offre_id}")
    
    # Récupérer l'offre
    offre = await get_offre(offre_id, token)
    if not offre:
        print(f"Erreur: Offre {offre_id} non trouvée")
        return
    print(f"Offre récupérée: {offre.get('titre', 'Sans titre')}")

    # Récupérer les candidats
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"{OFFRE_SERVICE_URL}/candidatures/offre/{offre_id}",
            headers={"Authorization": f"Bearer {token}"}
        ) as response:
            if response.status != 200:
                print(f"Erreur lors de la récupération des candidats: {response.status}")
                return
            data = await response.json()
            candidats = data.get('candidats', [])
            print(f"Nombre de candidats trouvés: {len(candidats)}")

    # Calculer les scores
    scored_candidats = []
    for candidat in candidats:
        score = compute_score(candidat, offre)
        print(f"Score calculé pour le candidat {candidat.get('utilisateurId')}: {score}")
        scored_candidats.append({
            "utilisateurId": candidat["utilisateurId"],
            "score": score
        })

    print(f"Scores calculés pour {len(scored_candidats)} candidats")

    # Mettre à jour les scores
    success_count = 0
    for candidat in scored_candidats:
        if await update_candidat_score(offre_id, candidat, token):
            print(f"Score mis à jour pour le candidat {candidat['utilisateurId']}")
            success_count += 1
        else:
            print(f"Erreur lors de la mise à jour du score pour le candidat {candidat['utilisateurId']}")
    
    print(f"Scoring terminé: {success_count}/{len(scored_candidats)} scores mis à jour avec succès")

def on_event(ch, method, properties, body):
    try:
        event = json.loads(body.decode('utf-8'))
    except Exception as e:
        print("[RabbitMQ] Erreur de décodage JSON:", e)
        print("[RabbitMQ] Body brut:", body)
        return

    print(f"[RabbitMQ] Event reçu sur {method.routing_key} :", event)
    
    if method.routing_key == "Recruitment.Scoring.Demande":
        offre_id = event.get("offreId")
        if not offre_id:
            print("Aucun offreId dans l'événement !")
            return
        print(f"[RabbitMQ] Déclenchement du scoring pour l'offre {offre_id}")
        asyncio.run(process_scoring_request(offre_id, event.get("token")))

def start_consumer():
    print("Démarrage du consumer RabbitMQ...")
    conn = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = conn.channel()
    
    # Déclarer l'exchange
    channel.exchange_declare(
        exchange='recrusmart.events',
        exchange_type='topic',
        durable=True
    )
    
    # Créer une queue exclusive
    result = channel.queue_declare(queue='', exclusive=True)
    queue_name = result.method.queue
    
    # S'abonner aux événements de scoring
    channel.queue_bind(
        exchange='recrusmart.events',
        queue=queue_name,
        routing_key='Recruitment.Scoring.Demande'
    )
    
    print(f"Queue {queue_name} créée et liée à l'exchange recrusmart.events")
    print("En attente d'événements de scoring...")
    
    channel.basic_consume(
        queue=queue_name,
        on_message_callback=on_event,
        auto_ack=True
    )
    
    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        print("Arrêt du consumer...")
        channel.stop_consuming()
        conn.close()

if __name__ == "__main__":
    start_consumer()