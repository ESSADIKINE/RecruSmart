from fastapi import APIRouter, HTTPException
from src.api.models import ResumeInput, ResumeListInput
#from src.core.config import JOB_ROLES
#from src.core.pdf_processing import process_resume
#from src.utils.file_handler import download_pdf, cleanup_temp_file
import logging

router = APIRouter()
logger = logging.getLogger(__name__)
