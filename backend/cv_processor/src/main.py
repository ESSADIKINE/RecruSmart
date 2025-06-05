from fastapi import FastAPI
from src.api.endpoints import router
from src.utils.logging import setup_logging

# Initialize FastAPI app
app = FastAPI(
    title="RecruSmart CV Processor",
    description="AI-powered CV analysis and sorting for HR"
)

# Setup logging
setup_logging()

# Include API routes
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)