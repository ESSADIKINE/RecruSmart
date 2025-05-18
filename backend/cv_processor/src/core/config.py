import os
import json
import yaml
import logging
import tempfile
import unicodedata

logger = logging.getLogger(__name__)

# Base directory for config (relative to config.py)
BASE_CONFIG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "config"))

# Default configuration
DEFAULT_CONFIG = {
    "temp_dir": os.getenv("RECRUSMART_TEMP_DIR", tempfile.gettempdir()),
    "log_level": os.getenv("RECRUSMART_LOG_LEVEL", "INFO"),
    "config_dir": os.getenv("RECRUSMART_CONFIG_DIR", BASE_CONFIG_DIR),
    "api": {
        "host": os.getenv("RECRUSMART_API_HOST", "0.0.0.0"),
        "port": int(os.getenv("RECRUSMART_API_PORT", 8000))
    },
    "scoring_weights": {
        "skills": float(os.getenv("RECRUSMART_SCORING_SKILLS", 8.0)),
        "experience": float(os.getenv("RECRUSMART_SCORING_EXPERIENCE", 20.0)),
        "education": float(os.getenv("RECRUSMART_SCORING_EDUCATION", 15.0)),
        "role_fit": float(os.getenv("RECRUSMART_SCORING_ROLE_FIT", 40.0)),
        "projects": float(os.getenv("RECRUSMART_SCORING_PROJECTS", 10.0))
    }
}

# Default skills if skills.json fails
DEFAULT_SKILLS = ["python", "sql", "scikit-learn", "pandas", "numpy", "machine learning", "data analysis", "r", "spark"]

def normalize_text(text: str) -> str:
    """Normalize text by removing accents and converting to lowercase."""
    return unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('ASCII').lower()

def load_yaml_config(file_path: str) -> dict:
    """Load YAML configuration file."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
        logger.info(f"Loaded YAML config from {file_path}")
        return data
    except Exception as e:
        logger.warning(f"Failed to load YAML config from {file_path}: {str(e)}")
        return {}

def load_skills(config_dir: str) -> list:
    """Load skills from skills.json or return default."""
    if not config_dir:
        config_dir = BASE_CONFIG_DIR
    skills_path = os.path.join(config_dir, "skills.json")
    try:
        with open(skills_path, "r", encoding="utf-8") as f:
            skills = json.load(f)
            if not isinstance(skills, list):
                raise ValueError("skills.json must contain a list")
        logger.info(f"Loaded skills from {skills_path}")
        return skills
    except Exception as e:
        logger.error(f"Failed to load skills from {skills_path}: {str(e)}")
        logger.info(f"Using default skills: {', '.join(DEFAULT_SKILLS)}")
        return DEFAULT_SKILLS

# Load configuration
config_path = os.getenv("RECRUSMART_CONFIG_PATH", os.path.join(BASE_CONFIG_DIR, "settings.yaml"))
SETTINGS = DEFAULT_CONFIG.copy()
yaml_config = load_yaml_config(config_path)

# Update settings, ignoring None values
for key, value in yaml_config.items():
    if value is not None:
        if isinstance(value, dict) and key in SETTINGS:
            SETTINGS[key].update({k: v for k, v in value.items() if v is not None})
        else:
            SETTINGS[key] = value

# Ensure config_dir is not None
SETTINGS["config_dir"] = SETTINGS["config_dir"] or BASE_CONFIG_DIR

# Load skills
SKILLS = load_skills(SETTINGS["config_dir"])

# Set temp_dir and scoring weights
TEMP_DIR = SETTINGS["temp_dir"]
DEFAULT_SCORING_WEIGHTS = SETTINGS["scoring_weights"]