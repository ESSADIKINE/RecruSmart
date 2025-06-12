import pika, json, requests

JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NDljODBiMTI1NmZjMWEyNzQxYmUwMyIsImVtYWlsIjoicmVjcnRldXJAZ21haWwuY29tIiwicm9sZSI6IlJFQ1JVVEVVUiIsImlhdCI6MTc0OTY4OTMxOSwiZXhwIjoxNzQ5Nzc1NzE5fQ.yUkQFtFuz2LvarIYmvdeNcs5ZF0rngQnaEzacOINzjU"  # Remplacez par un vrai token JWT valide pour un RECRUTEUR

def compute_score(candidat, offre):
    score = 0
    # 1. Compétences (5 pts chacune)
    offre_competences = set(offre.get('competences', []))
    # Récupère les compétences du candidat (clé du dict)
    candidat_competences = set(candidat.get('competences', {}).keys())
    # Ajoute aussi les valeurs des expériences (toutes les valeurs str)
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

def process_matching_for_offer(offre_id):
    # Récupère l'offre
    offre = requests.get(f"http://localhost:5001/offres/{offre_id}").json()
    # Récupère tous les profils candidats (URL corrigée)
    profils = requests.get("http://localhost:8084/candidats/profils").json()
    # Correction : s'assurer que profils est une liste
    if not profils:
        print("Aucun profil reçu.")
        return
    if isinstance(profils, dict):
        # Si l'API retourne un seul profil sous forme de dict
        profils = [profils]
    if isinstance(profils, list) and profils and isinstance(profils[0], str):
        profils = [json.loads(p) for p in profils]
    print("Profils reçus:", profils)
    print("Type du premier profil:", type(profils[0]) if profils else "Aucun")
    scored = []
    for candidat in profils:
        # Désérialise les champs JSON stringifiés
        for field, default in [
            ('competences', {}),
            ('langues', {}),
            ('experiences', {}),
            ('educations', {}),
            ('domaines', [])
        ]:
            candidat[field] = safe_json_loads(candidat.get(field, default), default)
        s = compute_score(candidat, offre)
        scored.append({
            "utilisateur_id": candidat.get("utilisateur_id", candidat.get("utilisateurId")),
            "cv": candidat.get("cv_url", candidat.get("urlCv", "")),
            "score": s
        })
    # Trie et prend les 50 meilleurs
    top = sorted(scored, key=lambda x: x['score'], reverse=True)[:50]
    # Met à jour l'offre
    headers = {"Authorization": f"Bearer {JWT_TOKEN}"}
    resp = requests.patch(f"http://localhost:5001/offres/{offre_id}", json={"candidats": top}, headers=headers)
    print(f"PATCH /offres response: {resp.status_code} {resp.text}")
    print(f"Top {len(top)} candidats mis à jour pour l'offre {offre_id}")

def process_matching_for_candidature(event):
    print("Nouvelle candidature reçue:", event)
    offre_id = event.get("offreId") or event.get("offerId")
    if not offre_id:
        print("Aucun offreId dans l'événement !")
        return
    process_matching_for_offer(offre_id)

def on_event(ch, method, properties, body):
    try:
        event = json.loads(body.decode('utf-8'))
    except Exception as e:
        print("[RabbitMQ] Erreur de décodage JSON:", e)
        print("[RabbitMQ] Body brut:", body)
        return
    print(f"[RabbitMQ] Event reçu sur {method.routing_key} :", event)
    if method.routing_key == 'Recruitment.Offre.Publiée':
        offre_id = event.get("offreId") or event.get("_id")
        if not offre_id:
            print("Aucun offreId dans l'événement !")
            return
        process_matching_for_offer(offre_id)
    elif method.routing_key == 'Candidat.Candidature.Soumise':
        process_matching_for_candidature(event)
    else:
        print("[RabbitMQ] Routing key non gérée:", method.routing_key)

def start_consumer():
    conn = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = conn.channel()
    channel.exchange_declare(exchange='recrusmart.events', exchange_type='topic', durable=True)
    result = channel.queue_declare(queue='', exclusive=True)
    queue_name = result.method.queue
    # Écoute les deux routing keys
    channel.queue_bind(exchange='recrusmart.events', queue=queue_name, routing_key='Recruitment.Offre.Publiée')
    channel.queue_bind(exchange='recrusmart.events', queue=queue_name, routing_key='Candidat.Candidature.Soumise')
    channel.basic_consume(queue=queue_name, on_message_callback=on_event, auto_ack=True)
    print("En attente d'offres et de candidatures...")
    channel.start_consuming()

if __name__ == "__main__":
    start_consumer()