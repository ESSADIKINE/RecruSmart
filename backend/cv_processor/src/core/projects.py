import re
from typing import Dict, List
from .config import normalize_text, TEMP_DIR
import logging
import os

logger = logging.getLogger(__name__)

def extract_projects(sections: Dict[str, str], resume_id: str) -> List[str]:
    """Extract project titles or descriptions from PROJETS section."""
    projects_text = sections.get("PROJETS", "")
    if not projects_text.strip():
        logger.info(f"No projects found for {resume_id}")
        return []
    
    # Regex to identify project entries (e.g., bullet points, titles, or lines with dates)
    project_pattern = r"(?:•|-|\*|\d+\.)\s*(.+?)(?=(?:•|-|\*|\d+\.)|\Z)"
    projects = []
    
    # Split by lines and clean up
    lines = projects_text.splitlines()
    for line in lines:
        line = line.strip()
        if not line:
            continue
        match = re.match(project_pattern, line, re.IGNORECASE)
        if match:
            project = match.group(1).strip()
            if project and len(project) > 5:  # Ignore very short entries
                projects.append(project)
    
    # If no projects found with pattern, try to extract non-empty lines
    if not projects:
        for line in lines:
            line = line.strip()
            if line and len(line) > 5:
                projects.append(line)
    
    projects = list(set(projects))[:5]  # Limit to 5 projects to avoid noise
    logger.info(f"Extracted projects for {resume_id}: {', '.join(projects)}")
    
    # Write projects to debug file
    projects_output_path = os.path.join(TEMP_DIR, f"{resume_id}_projects.txt")
    with open(projects_output_path, "w", encoding="utf-8") as f:
        f.write(f"Raw Projects Text:\n{projects_text}\n\n")
        f.write(f"Extracted Projects:\n{', '.join(projects)}\n")
    
    return projects