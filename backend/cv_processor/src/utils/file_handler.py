import os
import requests
import logging
#from core.config import TEMP_DIR
from ..core.config import TEMP_DIR

logger = logging.getLogger(__name__)

def download_pdf(url: str, resume_id: str) -> str:
    """Download a PDF from a URL and save it to a temporary file."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        file_path = os.path.join(TEMP_DIR, f"{resume_id}.pdf")
        with open(file_path, "wb") as f:
            f.write(response.content)
        logger.info(f"Downloaded PDF from {url} to {file_path}")
        return file_path
    except Exception as e:
        logger.error(f"Failed to download PDF from {url}: {str(e)}")
        raise

def cleanup_temp_file(file_path: str) -> None:
    """Remove a temporary file if it exists."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Cleaned up temporary file: {file_path}")
        # Check current working directory for stray files
        cwd_file = os.path.join(os.getcwd(), os.path.basename(file_path))
        if os.path.exists(cwd_file):
            os.remove(cwd_file)
            logger.info(f"Cleaned up stray file in cwd: {cwd_file}")
    except Exception as e:
        logger.warning(f"Failed to clean up file {file_path}: {str(e)}")