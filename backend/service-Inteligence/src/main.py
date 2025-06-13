from fastapi import FastAPI, Request, HTTPException, status
from .offer_consumer import get_offre, scorer_candidats, add_candidat_to_offre
from .auth_utils import require_recruteur

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Service d'intelligence démarré"}

@app.post("/score")
async def score_candidature(offre_id: str):
    try:
        # Récupérer l'offre
        offre = await get_offre(offre_id)
        if not offre:
            return {"error": "Offre non trouvée"}

        # Calculer les scores
        candidats_with_scores = await scorer_candidats(offre)
        
        # Mettre à jour les scores dans l'offre
        for candidat in candidats_with_scores:
            await add_candidat_to_offre(offre_id, candidat)

        return {"message": "Scores calculés et mis à jour avec succès"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/health")
def health():
    return {"status": "ok"} 