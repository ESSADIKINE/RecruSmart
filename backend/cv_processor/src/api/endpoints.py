from fastapi import APIRouter, HTTPException
from src.api.models import ResumeInput, ResumeListInput, JobRole, ScoringWeights
from src.core.pdf_processing import process_resume
from src.utils.file_handler import download_pdf, cleanup_temp_file
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/process_resume")
async def process_resume_endpoint(resume: ResumeInput, job_role: JobRole, scoring_weights: ScoringWeights = None):
    if resume.role != job_role.role:
        logger.error(f"Invalid job role: {resume.role}, expected {job_role.role}")
        raise HTTPException(status_code=400, detail=f"Invalid job role: {resume.role}, expected {job_role.role}")
    
    file_path = None
    try:
        file_path = download_pdf(resume.url, resume.id)
        logger.info(f"Processing resume {resume.id} with file {file_path}")
        result = process_resume(
            file_path, resume.id, resume.url, resume.role, 
            job_role.dict(), 
            scoring_weights.dict() if scoring_weights else None
        )
        logger.info(f"Successfully processed resume {resume.id}")
        return result
    except Exception as e:
        logger.error(f"Error processing resume {resume.id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing resume {resume.id}: {str(e)}")
    finally:
        if file_path:
            cleanup_temp_file(file_path)

@router.post("/sort_resumes")
async def sort_resumes_endpoint(input: ResumeListInput):
    if not input.resumes:
        logger.error("No resumes provided")
        raise HTTPException(status_code=400, detail="No resumes provided")
    
    results = []
    temp_files = []
    
    for resume in input.resumes:
        if resume.role != input.job_role.role:
            logger.error(f"Invalid job role for {resume.id}: {resume.role}, expected {input.job_role.role}")
            raise HTTPException(status_code=400, detail=f"Invalid job role for {resume.id}: {resume.role}")
        
        file_path = None
        try:
            file_path = download_pdf(resume.url, resume.id)
            temp_files.append(file_path)
            logger.info(f"Processing resume {resume.id} with file {file_path}")
            result = process_resume(
                file_path, resume.id, resume.url, resume.role, 
                input.job_role.dict(), 
                input.scoring_weights.dict() if input.scoring_weights else None
            )
            results.append(result)
            logger.info(f"Successfully processed resume {resume.id}")
        except Exception as e:
            logger.error(f"Error processing resume {resume.id}: {str(e)}")
    
    results.sort(key=lambda x: (x["experience_years"], x["score"]), reverse=True)
    
    for file_path in temp_files:
        cleanup_temp_file(file_path)
    
    logger.info(f"Sorted {len(results)} resumes for role {input.job_role.role}")
    return {
        "role": input.job_role.role,
        "sorted_resumes": results
    }