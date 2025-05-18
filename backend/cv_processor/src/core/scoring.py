from typing import List, Dict
from .nlp import classifier
from .config import DEFAULT_SCORING_WEIGHTS
import logging

logger = logging.getLogger(__name__)

def score_resume(skills: List[str], experience: float, education: List[str], projects: List[str], text: str, role: str, job_role: Dict, scoring_weights: Dict = None) -> float:
    """Score a resume based on skills, experience, education, projects, and role fit."""
    if job_role.get("role") != role:
        logger.error(f"Job role mismatch: expected {role}, got {job_role.get('role')}")
        raise ValueError(f"Job role mismatch: expected {role}, got {job_role.get('role')}")
    
    # Use provided weights or default
    weights = scoring_weights or DEFAULT_SCORING_WEIGHTS
    
    required_skills = job_role.get("required_skills", [])
    min_experience = job_role.get("min_experience", 0.0)
    keywords = job_role.get("keywords", [])
    
    # Skills score: matched required skills get full weight, others half
    matched_required = [s for s in skills if s in required_skills]
    other_skills = [s for s in skills if s not in required_skills]
    skills_score = (len(matched_required) * 1.0 + len(other_skills) * 0.5) * weights.get("skills", 8.0)
    
    # Experience score: difference from min_experience
    experience_diff = experience - min_experience
    experience_score = experience_diff * weights.get("experience", 20.0) if experience_diff >= 0 else experience_diff * weights.get("experience", 20.0)
    
    # Education score: base score per degree, bonus for advanced degrees
    education_score = len(education) * weights.get("education", 15.0)
    if any(d in ["Master", "Doctorat", "PhD", "Master’s"] for d in education):
        education_score += 10.0
    
    # Projects score: score per project
    projects_score = len(projects) * weights.get("projects", 10.0)
    
    # Role fit score: based on keyword classification
    role_fit_score = 0
    if keywords:
        try:
            result = classifier(text[:512], candidate_labels=keywords + ["unrelated"], multi_label=True)
            role_fit_score = sum(score for label, score in zip(result["labels"], result["scores"])
                                 if label in keywords) * weights.get("role_fit", 40.0)
        except Exception as e:
            logger.error(f"Error in role fit classification: {str(e)}")
    
    total_score = skills_score + experience_score + education_score + projects_score + role_fit_score
    logger.info(f"Resume score: {total_score} (skills={skills_score}, experience={experience_score}, education={education_score}, projects={projects_score}, role_fit={role_fit_score})")
    return total_score