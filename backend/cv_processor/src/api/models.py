from pydantic import BaseModel
from typing import List

class ResumeInput(BaseModel):
    id: str
    url: str
    role: str

class ResumeListInput(BaseModel):
    resumes: List[ResumeInput]