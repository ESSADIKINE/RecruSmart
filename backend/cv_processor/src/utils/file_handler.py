import os
import requests
import tempfile
import time
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

def download_pdf(url: str, resume_id: str) -> str:
    logger.info(f"Downloading PDF from {url} for {resume_id}")
    temp_dir = tempfile.gettempdir()
    logger.info(f"Using temporary directory: {temp_dir}")
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        content_type = response.headers.get("Content-Type", "").lower()
        logger.info(f"Content-Type: {content_type} for {url}")
        if "application/pdf" not in content_type:
            logger.error(f"Invalid Content-Type: {content_type} for {url}")
            raise HTTPException(status_code=400, detail=f"URL {url} does not point to a PDF file")
        if not response.content:
            logger.error(f"Empty response content from {url}")
            raise HTTPException(status_code=400, detail=f"URL {url} returned empty content")
        file_name = f"{resume_id}_{os.urandom(4).hex()}.pdf"
        file_path = os.path.join(temp_dir, file_name)
        logger.info(f"Writing PDF to {file_path}")
        with open(file_path, "wb") as f:
            f.write(response.content)
        if not os.path.exists(file_path):
            logger.error(f"Failed to create file {file_path}")
            raise HTTPException(status_code=500, detail=f"Failed to create temporary file")
        file_size = os.path.getsize(file_path)
        if file_size == 0:
            logger.error(f"Created empty file {file_path}")
            cleanup_temp_file(file_path)
            raise HTTPException(status_code=500, detail=f"Created empty temporary file")
        logger.info(f"Created PDF file {file_path} with size {file_size} bytes")
        return file_path
    except requests.RequestException as e:
        logger.error(f"Request failed for {url}: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to download PDF: {str(e)}")
    except Exception as e:
        logger.error(f"Error saving PDF for {resume_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving PDF: {str(e)}")

def cleanup_temp_file(file_path: str, max_attempts: int = 3, delay: float = 0.5) -> None:
    if not file_path or not os.path.exists(file_path):
        cwd_file = os.path.join(os.getcwd(), os.path.basename(file_path))
        if os.path.exists(cwd_file):
            file_path = cwd_file
        else:
            logger.debug(f"No file to clean up at {file_path} or {cwd_file}")
            return
    for attempt in range(max_attempts):
        try:
            os.unlink(file_path)
            logger.info(f"Cleaned up temp file {file_path}")
            return
        except PermissionError as e:
            logger.warning(f"Permission error on attempt {attempt + 1} for {file_path}: {str(e)}")
            time.sleep(delay)
        except Exception as e:
            logger.error(f"Failed to clean up temp file {file_path}: {str(e)}")
            return
    logger.error(f"Failed to clean up temp file {file_path} after {max_attempts} attempts")