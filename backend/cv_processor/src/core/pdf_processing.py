import pdfplumber
import fitz  # PyMuPDF
import pytesseract
from PIL import Image, ImageEnhance
import io
import re
from typing import Dict
import logging
from .skills import extract_skills
from .experience import extract_experience
from .education import extract_education
from .projects import extract_projects
from .scoring import score_resume
import os
from .config import TEMP_DIR

logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_path: str, resume_id: str) -> str:
    """Extract text from PDF using pdfplumber or OCR fallback."""
    try:
        with pdfplumber.open(file_path) as pdf:
            text = "".join(page.extract_text(layout=True) or "" for page in pdf.pages)
            if len(text.strip()) > 100:
                output_path = os.path.join(TEMP_DIR, f"{resume_id}_extracted.txt")
                with open(output_path, "w", encoding="utf-8") as f:
                    f.write(text)
                logger.info(f"Extracted text from {file_path} using pdfplumber")
                return text
    except Exception as e:
        logger.warning(f"pdfplumber failed for {file_path}: {str(e)}")
    
    try:
        doc = fitz.open(file_path)
        text = ""
        for page_number in range(len(doc)):
            page = doc.load_page(page_number)
            pix = page.get_pixmap(dpi=400)
            img_data = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_data))
            img = img.convert("L")
            img = ImageEnhance.Contrast(img).enhance(2.5)
            page_text = pytesseract.image_to_string(img, lang='fra+eng')
            text += page_text + "\n"
        doc.close()
        output_path = os.path.join(TEMP_DIR, f"{resume_id}_extracted.txt")
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(text)
        logger.info(f"Extracted text from {file_path} using OCR")
        return text
    except Exception as e:
        logger.error(f"Error processing PDF {file_path}: {str(e)}")
        raise

def segment_text(text: str, resume_id: str) -> Dict[str, str]:
    """Segment resume text into sections (FORMATION, EXPÉRIENCE, etc.)."""
    sections = {
        "FORMATION": "",
        "EXPÉRIENCE": "",
        "COMPÉTENCES": "",
        "PROFIL": "",
        "LANGUES": "",
        "PROJETS": "",
        "EDUCATION": "",
        "EXPERIENCE": "",
        "SKILLS": ""
    }
    
    section_headers = {
        "FORMATION": r"^\s*FORMATION(?:\s*(?:PROFESSIONNELLE|ACADÉMIQUE))?\s*$",
        "EXPÉRIENCE": r"^\s*EXP[ÉE]RIENCE(?:\s*(?:PROFESSIONNELLE|PRATIQUE))?\s*$",
        "COMPÉTENCES": r"^\s*COMP[ÉE]TENCES(?:\s*(?:TECHNIQUES|PROFESSIONNELLES))?\s*$",
        "PROFIL": r"^\s*PROFIL\s*$",
        "LANGUES": r"^\s*LANGUES\s*$",
        "PROJETS": r"^\s*PROJETS\s*$",
        "EDUCATION": r"^\s*EDUCATION\s*$",
        "EXPERIENCE": r"^\s*EXPERIENCE\s*$",
        "SKILLS": r"^\s*SKILLS\s*$"
    }
    
    current_section = None
    lines = text.splitlines()
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        for section, pattern in section_headers.items():
            if re.match(pattern, line, re.IGNORECASE):
                current_section = section
                break
        else:
            if current_section:
                sections[current_section] += line + "\n"
    
    sections["FORMATION"] += sections["EDUCATION"]
    sections["EXPÉRIENCE"] += sections["EXPERIENCE"]
    sections["COMPÉTENCES"] += sections["SKILLS"]
    sections["EDUCATION"] = ""
    sections["EXPERIENCE"] = ""
    sections["SKILLS"] = ""
    
    for section, content in sections.items():
        if content.strip():
            logger.info(f"Section {section} for {resume_id}:\n{content.strip()}")
    if sections["COMPÉTENCES"].strip():
        output_path = os.path.join(TEMP_DIR, f"{resume_id}_competences_section.txt")
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(sections["COMPÉTENCES"])
    
    return sections

def process_resume(file_path: str, resume_id: str, url: str, role: str, job_role: Dict, scoring_weights: Dict = None) -> Dict:
    """Process a resume PDF and return analysis results."""
    logger.info(f"Checking file existence: {file_path}")
    if not os.path.exists(file_path):
        cwd_file = os.path.join(os.getcwd(), os.path.basename(file_path))
        if os.path.exists(cwd_file):
            logger.warning(f"File found in current working directory: {cwd_file}")
            file_path = cwd_file
        else:
            logger.error(f"File {file_path} does not exist in temp dir or cwd")
            raise FileNotFoundError(f"File {file_path} does not exist")
    
    text = extract_text_from_pdf(file_path, resume_id)
    sections = segment_text(text, resume_id)
    skills = extract_skills(text, sections, resume_id)
    experience = extract_experience(sections)
    education = extract_education(sections)
    projects = extract_projects(sections, resume_id)
    score = score_resume(skills, experience, education, projects, text, role, job_role, scoring_weights)
    
    result = {
        "id": resume_id,
        "url": url,
        "skills": skills,
        "experience_years": experience,
        "education": education,
        "projects": projects,
        "score": score
    }
    logger.info(f"Processed resume {resume_id}: {result}")
    return result