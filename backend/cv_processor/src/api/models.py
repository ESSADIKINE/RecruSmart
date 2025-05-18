from pydantic import BaseModel
from typing import List, Dict, Optional

class ResumeInput(BaseModel):
    id: str
    url: str
    role: str

class JobRole(BaseModel):
    role: str
    required_skills: List[str]
    min_experience: float
    keywords: List[str]

class ScoringWeights(BaseModel):
    skills: float = 8.0
    experience: float = 20.0
    education: float = 15.0
    role_fit: float = 40.0
    projects: float = 10.0

class ResumeListInput(BaseModel):
    job_role: JobRole
    resumes: List[ResumeInput]
    scoring_weights: Optional[ScoringWeights] = None