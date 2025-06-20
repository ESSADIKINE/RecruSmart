# src/offer_consumer.py
# ---------------------------------------------------------------
# 𝗦𝗲𝗿𝘃𝗶𝗰𝗲 Intelligence – consumer/scoring logic
#
#  ⓘ  هذا الملف فيه جميع الوظائف ديال:
#      • الاستماع لـ RabbitMQ
#      • حساب السكور ديال كل كانديد
#      • استدعاء API Gateway باش نحين السكور
# ---------------------------------------------------------------

import asyncio
import json
import logging
from typing import Dict, List, Any

import aiohttp
import pika

from .config import OFFRE_SERVICE_URL


class _Msg:
    """Wrap raw bytes from RabbitMQ so we get `msg.body` like aio-pika."""
    def __init__(self, raw: bytes):
        self.body = raw

def safe_json_loads(val, default):
    try:
        if val is None or val == "null":
            return default
        return json.loads(val) if isinstance(val, str) else val
    except Exception:
        return default


def compute_score(candidat: Dict[str, Any], offre: Dict[str, Any]) -> int:
    """Calcule un score sur 100 pts selon : compétences / exp / diplôme / domaine / langue."""
    score = 0

    # ---- 1. compétences (5 pts + niveau) -----------------------
    offre_comps = set(offre.get("competences", []))
    cand_comps = safe_json_loads(candidat.get("competences", "{}"), {})
    exp_comps = set()

    experiences = safe_json_loads(candidat.get("experiences", "{}"), {})
    for exp in experiences.values():
        for v in exp.values():
            if isinstance(v, str):
                exp_comps.add(v)

    for comp in offre_comps:
        if comp in cand_comps:                  # compétence déclarée
            niveau = cand_comps[comp]
            score += 5 + niveau                 # 5 + (1-5)
        elif comp in exp_comps:                 # compétence déduite des expériences
            score += 5

    cand_years = int(safe_json_loads(candidat.get("anneesExperience", 0), 0))
    offre_years = int(offre.get("anneesExperience", 0) or 0)
    if cand_years >= offre_years:
        score += 15

    cand_lvl = str(candidat.get("niveauEtude", "")).lower()
    offre_lvl = str(offre.get("niveauEtude", "")).lower()
    if cand_lvl and cand_lvl == offre_lvl:
        score += 15
    elif cand_lvl == "bac+4" and offre_lvl == "bac+5":
        score += 10  # presque

    cand_domains = safe_json_loads(candidat.get("domaines", "[]"), [])
    if isinstance(cand_domains, str):
        try:
            cand_domains = json.loads(cand_domains)
        except Exception:
            cand_domains = []
    cand_domains = [str(d).lower() for d in cand_domains]
    if str(offre.get("domaine", "")).lower() in cand_domains:
        score += 15

    langues = safe_json_loads(candidat.get("langues", "{}"), {})
    if isinstance(langues, str):
        try:
            langues = json.loads(langues)
        except Exception:
            langues = {}
    if str(offre.get("langue", "")).lower() in [l.lower() for l in langues.keys()]:
        score += 15

    return min(score, 100)


async def process_scoring_message(msg: _Msg):
    """Reçoit message JSON, يحسب السكور، ويحينه عبر الـ API Gateway."""
    data = json.loads(msg.body.decode())
    logging.info("💡 Scoring message reçu: %s", data)

    offre_id = data.get("offreId")
    token = data.get("token")
    offre = data.get("offre")
    candidats = data.get("candidats")

    if not all([offre_id, token, offre, candidats]):
        logging.error("⚠️  Message incomplet – ignoré")
        return

    logging.info("➡️  Offre %s – %d candidats", offre_id, len(candidats))

    # Calcul des scores
    scored = [
        {"utilisateurId": c["utilisateurId"], "score": compute_score(c, offre)}
        for c in candidats
    ]

    # Mise à jour via API Gateway (nginx écoute port 80 داخل الدوكير)
    success = 0
    async with aiohttp.ClientSession() as session:
        for cand in scored:
            url = (
                f"http://api-gateway/api/offres/{offre_id}"
                f"/candidat/{cand['utilisateurId']}/score"
            )
            try:
                async with session.put(
                    url,
                    json={"score": cand["score"]},
                    headers={"Authorization": token},
                    timeout=30,
                ) as resp:
                    if resp.status == 200:
                        success += 1
                    else:
                        logging.error(
                            "PUT %s → %s\n%s",
                            url,
                            resp.status,
                            await resp.text(),
                        )
            except Exception as exc:
                logging.exception("Exception PUT score: %s", exc)

    logging.info("Scoring terminé: %d/%d OK", success, len(scored))


# ---------------------------------------------------------------
# RabbitMQ consumer
# ---------------------------------------------------------------
def _on_event(ch, method, properties, body: bytes):
    """Callback appelé par pika."""
    try:
        logging.info("📨  RabbitMQ event %s", method.routing_key)
        if method.routing_key == "Recruitment.Scoring.Demande":
            asyncio.run(process_scoring_message(_Msg(body)))
    except Exception:
        logging.exception("Erreur dans _on_event")


def start_consumer():
    """Blocage (thread) – écoute RabbitMQ et consomme."""
    logging.info("🚀 Démarrage consumer RabbitMQ …")
    try:
        conn = pika.BlockingConnection(pika.ConnectionParameters("rabbitmq"))
        channel = conn.channel()

        # exchange (topic) déjà créé par les autres services
        channel.exchange_declare(
            exchange="recrusmart.events", exchange_type="topic", durable=True
        )

        channel.queue_declare(
            queue="intelligence.scoring.queue",
            durable=True,
            auto_delete=False,
            exclusive=False,
        )
        channel.queue_bind(
            exchange="recrusmart.events",
            queue="intelligence.scoring.queue",
            routing_key="Recruitment.Scoring.Demande",
        )

        channel.basic_consume(
            queue="intelligence.scoring.queue", on_message_callback=_on_event, auto_ack=True
        )
        logging.info("En attente d'événements de scoring …")
        channel.start_consuming()
    except KeyboardInterrupt:
        logging.info("Arrêt consumer (Ctrl-C)")
    except Exception:
        logging.exception("Erreur consumer – arrêt")

if __name__ == "__main__":
    start_consumer()
