import uvicorn
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

if __name__ == "__main__":
    # Démarrer le serveur
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8082")),
        reload=True,
        log_level="info"
    )