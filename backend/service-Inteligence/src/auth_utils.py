import os
import jwt
from fastapi import Request, HTTPException, status
from functools import wraps
from dotenv import load_dotenv

load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET", "changeme")

# Décorateur FastAPI pour vérifier le JWT et le rôle

def require_recruteur(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        request: Request = kwargs.get('request')
        if not request:
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
        if not request:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Requête invalide")
        auth = request.headers.get("Authorization")
        if not auth or not auth.startswith("Bearer "):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token manquant")
        token = auth.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        except Exception:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalide")
        if payload.get("role") != "RECRUTEUR":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès réservé aux recruteurs")
        request.state.user = payload
        return await func(*args, **kwargs)
    return wrapper 