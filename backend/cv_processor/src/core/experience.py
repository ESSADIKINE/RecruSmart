import re
from typing import Dict
import logging

logger = logging.getLogger(__name__)

def extract_experience(sections: Dict[str, str]) -> float:
    """Extract years of experience from EXPÉRIENCE section."""
    experience_text = sections.get("EXPÉRIENCE", "")
    year_pattern = r"(\d{1,2})\s*(?:ans?|années?|years?)"  # e.g., "5 ans"
    month_pattern = r"(\d{1,2})\s*(?:mois|months)"  # e.g., "3 mois"
    range_pattern = r"(\d{4})\s*[-–—à/]\s*(?:(\d{4})|présent|en cours|aujourd’hui|present|current)"  # e.g., "2015-2020"
    month_range_pattern = r"(?i)(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{4})\s*[-–—à/]\s*(?:(?:(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{4}))|présent|en cours|aujourd’hui|present|current)"
    date_range_pattern = r"(\d{1,2}/\d{4})\s*[-–—à/]\s*(?:(\d{1,2}/\d{4})|présent|en cours|present|current)"
    
    years = 0.0
    for match in re.finditer(year_pattern, experience_text, re.IGNORECASE):
        years += float(match.group(1))
    for match in re.finditer(month_pattern, experience_text, re.IGNORECASE):
        years += float(match.group(1)) / 12.0
    for match in re.finditer(range_pattern, experience_text, re.IGNORECASE):
        start = int(match.group(1))
        end = 2025 if match.group(2) is None else int(match.group(2))
        if end > start and end - start <= 30:
            years += end - start
    month_map = {
        "janvier": 1, "février": 2, "mars": 3, "avril": 4, "mai": 5, "juin": 6,
        "juillet": 7, "août": 8, "septembre": 9, "octobre": 10, "novembre": 11, "décembre": 12,
        "january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6,
        "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12
    }
    for match in re.finditer(month_range_pattern, experience_text, re.IGNORECASE):
        start_month_str = re.match(r"(?i)(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|january|february|march|april|may|june|july|august|september|october|november|december)", match.group(0), re.IGNORECASE).group(0).lower()
        start_month = month_map[start_month_str]
        start_year = int(match.group(1))
        end_year = 2025 if match.group(2) is None else int(match.group(2))
        end_month_str = start_month_str if match.group(2) is None else re.search(r"(?i)(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|january|february|march|april|may|june|july|august|september|october|november|december)", match.group(0), re.IGNORECASE).group(0).lower()
        end_month = month_map[end_month_str]
        start_date = start_year + start_month / 12.0
        end_date = end_year + end_month / 12.0
        if end_date > start_date and end_date - start_date <= 30:
            years += end_date - start_date
    for match in re.finditer(date_range_pattern, experience_text, re.IGNORECASE):
        start_parts = match.group(1).split('/')
        start_month, start_year = int(start_parts[0]), int(start_parts[1])
        end_month, end_year = (start_month, 2025) if match.group(2) is None else [int(x) for x in match.group(2).split('/')]
        start_date = start_year + start_month / 12.0
        end_date = end_year + end_month / 12.0
        if end_date > start_date and end_date - start_date <= 30:
            years += end_date - start_date
    
    years = min(years, 30.0)
    logger.info(f"Extracted {years} years of experience")
    return years