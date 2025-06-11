import pika, json, requests

def compute_score(candidat, offre):
    score = 0
    # 1. Compétences (5 pts chacune)
    offre_competences = set(offre.get('competences', []))
    candidat_competences = set(candidat.get('competences', []))
    # Ajoute aussi les compétences issues des expériences si elles existent
    exp_competences = set()
    experiences = candidat.get('experiences', {})
    for exp in experiences.values():
        for k, v in exp.items():
            if isinstance(v, str) and v in offre_competences:
                exp_competences.add(v)
    all_candidat_competences = candidat_competences | exp_competences
    for comp in offre_competences:
        if comp in all_candidat_competences:
            score += 5
    # 2. Années d'expérience
    if int(candidat.get('annees_experience', 0)) >= int(offre.get('experienceMin', 0)):
        score += 15
    # 3. Niveau d'étude
    if str(candidat.get('niveau_etude', '')).lower() == str(offre.get('niveauEtude', '')).lower():
        score += 15
    # 4. Domaine
    domaines = [d.lower() for d in candidat.get('domaines', [])]
    if str(offre.get('domaine', '')).lower() in domaines:
        score += 15
    # 5. Langue
    langues = [l.lower() for l in candidat.get('langues', {}).keys()]
    if 'langue' in offre and str(offre['langue']).lower() in langues:
        score += 15
    return min(score, 100)

def process_matching_for_offer(offre_id):
    # Récupère l'offre
    offre = requests.get(f"http://localhost:5001/offres/{offre_id}").json()
    # Récupère tous les profils candidats
    profils = requests.get("http://localhost:8084/profils").json()
    scored = []
    for candidat in profils:
        s = compute_score(candidat, offre)
        scored.append({
            "utilisateur_id": candidat.get("utilisateur_id", candidat.get("utilisateurId")),
            "cv": candidat.get("cv_url", candidat.get("urlCv", "")),
            "score": s
        })
    # Trie et prend les 50 meilleurs
    top = sorted(scored, key=lambda x: x['score'], reverse=True)[:50]
    # Met à jour l'offre
    requests.patch(f"http://localhost:5001/offres/{offre_id}", json={"candidats": top})
    print(f"Top {len(top)} candidats mis à jour pour l'offre {offre_id}")

def on_offer(ch, method, properties, body):
    event = json.loads(body)
    print("Nouvelle offre reçue:", event)
    offre_id = event.get("offreId") or event.get("_id")
    if not offre_id:
        print("Aucun offreId dans l'événement !")
        return
    process_matching_for_offer(offre_id)

def start_consumer():
    conn = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = conn.channel()
    channel.exchange_declare(exchange='recrusmart.events', exchange_type='topic', durable=True)
    result = channel.queue_declare(queue='', exclusive=True)
    queue_name = result.method.queue
    channel.queue_bind(exchange='recrusmart.events', queue=queue_name, routing_key='Recruitment.Offre.Publiée')
    channel.basic_consume(queue=queue_name, on_message_callback=on_offer, auto_ack=True)
    print("En attente d'offres...")
    channel.start_consuming()

if __name__ == "__main__":
    start_consumer()