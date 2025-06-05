from fuzzywuzzy import fuzz
import re
from typing import List, Dict
from .nlp import tokenize_text
from .config import SKILLS, TEMP_DIR, normalize_text
import logging
import os

logger = logging.getLogger(__name__)

def extract_skills(text: str, sections: Dict[str, str], resume_id: str) -> List[str]:
    """Extract skills from resume text or COMPÉTENCES section."""
    skills_text = sections.get("COMPÉTENCES", text)
    cleaned_text = re.sub(r'[\n\r\•\-\–—\(\)\[\]\{\}]', ' ', skills_text)
    cleaned_text = re.sub(r'[,\s]+', ' ', cleaned_text).strip()
    tokens = tokenize_text(cleaned_text)
    
    normalized_tokens = [normalize_text(token) for token in tokens]
    matched_skills = []
    found_skills = []
    
    skills_output_path = os.path.join(TEMP_DIR, f"{resume_id}_skills_tokens.txt")
    with open(skills_output_path, "w", encoding="utf-8") as f:
        f.write(f"Raw Skills Text:\n{skills_text}\n\n")
        f.write(f"Cleaned Skills Text:\n{cleaned_text}\n\n")
        f.write(f"Raw Tokens:\n{', '.join(tokens)}\n\n")
        f.write(f"Normalized Tokens:\n{', '.join(normalized_tokens)}\n\n")
        f.write("Matched Skills:\n")
    
    for skill in SKILLS:
        normalized_skill = normalize_text(skill)
        for token, norm_token in zip(tokens, normalized_tokens):
            if (normalized_skill == norm_token or
                normalized_skill in norm_token or
                fuzz.ratio(normalized_skill, norm_token) > 70):
                found_skills.append(skill)
                matched_skills.append(f"{skill} (from token: {token})")
                break
    
    unmatched_tokens = [token for token, norm_token in zip(tokens, normalized_tokens)
                       if not any(fuzz.ratio(normalize_text(skill), norm_token) > 70 for skill in SKILLS)]
    
    with open(skills_output_path, "a", encoding="utf-8") as f:
        f.write("\n".join(matched_skills) + "\n\nUnmatched Tokens:\n" + ", ".join(unmatched_tokens))
    
    logger.info(f"Found skills for {resume_id}: {', '.join(found_skills)}")
    logger.info(f"Unmatched tokens for {resume_id}: {', '.join(unmatched_tokens)}")
    
    if not found_skills:
        logger.info(f"No skills found in COMPÉTENCES for {resume_id}, searching full text...")
        tokens = tokenize_text(text)
        normalized_tokens = [normalize_text(token) for token in tokens]
        matched_skills = []
        found_skills = []
        for skill in SKILLS:
            normalized_skill = normalize_text(skill)
            for token, norm_token in zip(tokens, normalized_tokens):
                if (normalized_skill == norm_token or
                    normalized_skill in norm_token or
                    fuzz.ratio(normalized_skill, norm_token) > 70):
                    found_skills.append(skill)
                    matched_skills.append(f"{skill} (from token: {token})")
                    break
        with open(skills_output_path, "a", encoding="utf-8") as f:
            f.write("\nFallback Matched Skills:\n" + "\n".join(matched_skills))
        logger.info(f"Found skills in full text for {resume_id}: {', '.join(found_skills)}")
    
    return list(set(found_skills))