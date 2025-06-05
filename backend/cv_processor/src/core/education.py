from typing import Dict, List
from .config import normalize_text
import logging

logger = logging.getLogger(__name__)

def extract_education(sections: Dict[str, str]) -> List[str]:
    """Extract education degrees from FORMATION section."""
    education_text = sections.get("FORMATION", "")
    degrees = [
        "licence", "master", "doctorat", "baccalauréat", "diplôme",
        "ingénieur", "dut", "bts", "maîtrise", "dea", "dess",
        "bachelor", "master’s", "phd", "associate"
    ]
    found = []
    normalized_education = normalize_text(education_text)
    for degree in degrees:
        if normalize_text(degree) in normalized_education:
            found.append(degree.capitalize())
    found = list(set(found))
    logger.info(f"Extracted education: {', '.join(found)}")
    return found