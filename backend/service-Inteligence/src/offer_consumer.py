import pika, json, requests
import aiohttp
import os
import asyncio
from typing import List, Dict, Any
try:
    from .config import SERVICE_JWT
except ImportError:
    from config import SERVICE_JWT
# --- UTILS ---
OFFRE_SERVICE_URL = os.getenv("OFFRE_SERVICE_URL", "http://localhost:5001")

async def get_offre(offre_id: str) -> Dict[str, Any]:
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{OFFRE_SERVICE_URL}/offres/{offre_id}") as response:
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

async def update_candidat_score(offre_id: str, candidat: Dict[str, Any]) -> bool:
    async with aiohttp.ClientSession() as session:
        async with session.put(
            f"{OFFRE_SERVICE_URL}/candidatures/offre/{offre_id}/candidat/{candidat['utilisateurId']}/score",
            json={"score": candidat["score"]},
            headers={"Authorization": f"Bearer {SERVICE_JWT}"}
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
            competences_offre = set(offre['competences'])
            competences_candidat = set(candidat.get('competences', []))
            score += len(competences_offre.intersection(competences_candidat)) * 10

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

def compute_score(candidat: Dict[str, Any], offre: Dict[str, Any]) -> int:
    score = 0
    # 1. Compétences (5 pts chacune)
    offre_competences = set(offre.get('competences', []))
    candidat_competences = set(candidat.get('competences', {}).keys())
    exp_competences = set()
    experiences = candidat.get('experiences', {})
    for exp in experiences.values():
        for v in exp.values():
            if isinstance(v, str):
                exp_competences.add(v)
    all_candidat_competences = candidat_competences | exp_competences
    for comp in offre_competences:
        if comp in all_candidat_competences:
            score += 5

    # 2. Années d'expérience
    if int(candidat.get('anneesExperience', 0)) >= int(offre.get('experienceMin', 0) or 0):
        score += 15

    # 3. Niveau d'étude
    if str(candidat.get('niveauEtude', '')).lower() == str(offre.get('niveauEtude', '')).lower():
        score += 15

    # 4. Domaine
    domaines = [d.lower() for d in candidat.get('domaines', [])]
    if str(offre.get('domaine', '')).lower() in domaines:
        score += 15

    # 5. Langue
    langues = [l.lower() for l in candidat.get('langues', {}).keys()]
    if str(offre.get('langue', '').lower()) in langues:
        score += 15

    return min(score, 100)

def safe_json_loads(val, default):
    try:
        return json.loads(val) if isinstance(val, str) else val
    except Exception:
        return default

async def process_scoring_request(offre_id: str):
    print(f"Traitement du scoring pour l'offre {offre_id}")
    
    # Récupérer l'offre
    offre = await get_offre(offre_id)
    if not offre:
        print(f"Erreur: Offre {offre_id} non trouvée")
        return

    # Récupérer les candidats
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"{OFFRE_SERVICE_URL}/candidatures/offre/{offre_id}",
            headers={"Authorization": f"Bearer {SERVICE_JWT}"}
        ) as response:
            if response.status != 200:
                print(f"Erreur lors de la récupération des candidats: {response.status}")
                return
            data = await response.json()
            candidats = data.get('candidats', [])

    # Calculer les scores
    scored_candidats = []
    for candidat in candidats:
        utilisateur_id = candidat.get('utilisateurId')
        if not utilisateur_id:
            continue

        profil = get_profil(utilisateur_id)
        if not profil:
            print(f"[WARN] Profil non trouvé pour utilisateur {utilisateur_id}")
            continue

        # Désérialiser les champs JSON stringifiés
        for field, default in [
            ('competences', {}),
            ('langues', {}),
            ('experiences', {}),
            ('educations', {}),
            ('domaines', [])
        ]:
            profil[field] = safe_json_loads(profil.get(field, default), default)

        score = compute_score(profil, offre)
        scored_candidats.append({
            "utilisateurId": utilisateur_id,
            "score": score
        })

    print(f"Scores calculés pour {len(scored_candidats)} candidats")

    # Mettre à jour les scores
    for candidat in scored_candidats:
        if await update_candidat_score(offre_id, candidat):
            print(f"Score mis à jour pour le candidat {candidat['utilisateurId']}")
        else:
            print(f"Erreur lors de la mise à jour du score pour le candidat {candidat['utilisateurId']}")

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
        asyncio.run(process_scoring_request(offre_id))

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