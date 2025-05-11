import pdfplumber
import fitz  # PyMuPDF
import pytesseract
from PIL import Image, ImageEnhance
import io
import spacy
import re
import os
import nltk
from typing import Dict, List
import unicodedata
from fuzzywuzzy import fuzz
from transformers import pipeline

# Download NLTK stopwords
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Load SpaCy French model
nlp = spacy.load("fr_core_news_sm")

# Initialize Hugging Face zero-shot classifier
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

# Comprehensive skills list (French and English, with aliases)
SKILLS = [
    "python", "java", "javascript", "js", "sql", "apprentissage automatique", "machine learning",
    "analyse de données", "data analysis", "gestion de projet", "project management", "aws",
    "docker", "react", "react.js", "reactjs", "node.js", "nodejs", "node", "leadership",
    "spring boot", "express", "expressjs", "django", "tailwind css", "power bi", "tableau",
    "développement web", "web development", "science des données", "data science", "devops",
    "cloud computing", "base de données", "database", "programmation", "programming",
    "réseaux", "networking", "sécurité informatique", "cybersecurity", "angularjs", "angular",
    "socket.io", "socketio", "php", "mysql", "mongodb", "bootstrap", "jquery", "vanillajs",
    "vanilla js", "drupal", "wordpress", "prestashop", "magento", "typescript", "html", "css",
    "r", "scala", "bash", "material ui", "material-ui", "shadcn", "scikit-learn", "pandas",
    "numpy", "selenium", "tkinter", "excel", "spss", "jupyter notebooks", "knime", "hadoop",
    "spark", "kafka", "hive", "hbase", "kubernetes", "jenkins", "git", "github", "ci/cd",
    "swagger", "postman", "linux", "ubuntu", "zend", "codeigniter", "symfony", "html5",
    "php oop", "travis", "circle", "drone", "gitlab", "graphql", "vue.js", "vuejs", "agile",
    "scrum", "stakeholder management", "consulting"
]

# Job role definitions
JOB_ROLES = {
    "Data Scientist": {
        "required_skills": ["python", "sql", "scikit-learn", "pandas", "numpy", "machine learning", "data analysis", "r", "spark"],
        "min_experience": 2.0,
        "keywords": ["data science", "machine learning", "statistics", "predictive modeling"]
    },
    "Full Stack Developer": {
        "required_skills": ["javascript", "python", "react", "node.js", "django", "html", "css", "mysql", "mongodb"],
        "min_experience": 3.0,
        "keywords": ["web development", "frontend", "backend", "full stack"]
    },
    "Software Developer": {
        "required_skills": ["java", "python", "javascript", "spring boot", "sql", "git", "docker"],
        "min_experience": 2.0,
        "keywords": ["software development", "coding", "application development"]
    },
    "Product Manager": {
        "required_skills": ["project management", "leadership", "agile", "scrum", "stakeholder management"],
        "min_experience": 3.0,
        "keywords": ["product management", "roadmap", "strategy", "user experience"]
    },
    "IT Consultant": {
        "required_skills": ["cloud computing", "aws", "linux", "networking", "cybersecurity", "consulting"],
        "min_experience": 4.0,
        "keywords": ["IT consulting", "infrastructure", "solutions architecture"]
    }
}



# Normalize text (preserve punctuation like . and /)
def normalize_text(text: str) -> str:
    return unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('ASCII').lower()

# Clean and tokenize text for skills extraction
def tokenize_skills(text: str) -> List[str]:
    text = re.sub(r'[\n\r\•\-\–—\(\)\[\]\{\}]', ' ', text)
    text = re.sub(r'[,\s]+', ' ', text).strip()
    doc = nlp(text)
    tokens = []
    for chunk in doc.noun_chunks:
        tokens.append(chunk.text.lower())
    for token in doc:
        if not token.is_punct or token.text in ['.', '/']:
            tokens.append(token.text.lower())
    token_list = []
    for token in tokens:
        token_list.extend(re.split(r'\s+', token.strip()))
    return [t for t in token_list if t and len(t) > 1]

# Extract text from PDF (hybrid: try direct, fallback to OCR)
def extract_text_from_pdf(file_path: str, resume_id: str) -> str:
    try:
        with pdfplumber.open(file_path) as pdf:
            text = "".join(page.extract_text(layout=True) or "" for page in pdf.pages)
            if len(text.strip()) > 100:
                with open(f"{resume_id}_extracted.txt", "w", encoding="utf-8") as f:
                    f.write(text)
                return text
    except Exception:
        pass
    
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
        with open(f"{resume_id}_extracted.txt", "w", encoding="utf-8") as f:
            f.write(text)
        return text
    except Exception as e:
        raise Exception(f"Error processing PDF {file_path}: {str(e)}")

# Segment text into sections (French and English headers)
def segment_text(text: str, resume_id: str) -> Dict[str, str]:
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
            print(f"Section {section} for {resume_id}:\n{content.strip()}\n{'-'*50}")
    if sections["COMPÉTENCES"].strip():
        with open(f"{resume_id}_competences_section.txt", "w", encoding="utf-8") as f:
            f.write(sections["COMPÉTENCES"])
    
    return sections

# Extract skills from COMPÉTENCES/SKILLS section
def extract_skills(text: str, sections: Dict[str, str], resume_id: str) -> List[str]:
    skills_text = sections.get("COMPÉTENCES", text)
    cleaned_text = re.sub(r'[\n\r\•\-\–—\(\)\[\]\{\}]', ' ', skills_text)
    cleaned_text = re.sub(r'[,\s]+', ' ', cleaned_text).strip()
    tokens = tokenize_skills(cleaned_text)
    
    normalized_tokens = [normalize_text(token) for token in tokens]
    matched_skills = []
    with open(f"{resume_id}_skills_tokens.txt", "w", encoding="utf-8") as f:
        f.write(f"Raw Skills Text:\n{skills_text}\n\n")
        f.write(f"Cleaned Skills Text:\n{cleaned_text}\n\n")
        f.write(f"Raw Tokens:\n{', '.join(tokens)}\n\n")
        f.write(f"Normalized Tokens:\n{', '.join(normalized_tokens)}\n\n")
        f.write("Matched Skills:\n")
    
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
    
    unmatched_tokens = [token for token, norm_token in zip(tokens, normalized_tokens)
                       if not any(fuzz.ratio(normalize_text(skill), norm_token) > 70 for skill in SKILLS)]
    with open(f"{resume_id}_skills_tokens.txt", "a", encoding="utf-8") as f:
        f.write("\n".join(matched_skills) + "\n\nUnmatched Tokens:\n" + ", ".join(unmatched_tokens))
    print(f"Found Skills for {resume_id}: {', '.join(found_skills)}")
    print(f"Unmatched Tokens for {resume_id}: {', '.join(unmatched_tokens)}")
    
    if not found_skills:
        print(f"No skills found in COMPÉTENCES for {resume_id}, searching full text...")
        tokens = tokenize_skills(text)
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
        with open(f"{resume_id}_skills_tokens.txt", "a", encoding="utf-8") as f:
            f.write("\nFallback Matched Skills:\n" + "\n".join(matched_skills))
        print(f"Found Skills in full text for {resume_id}: {', '.join(found_skills)}")
    
    return list(set(found_skills))

# Extract experience from EXPÉRIENCE/EXPERIENCE section
def extract_experience(sections: Dict[str, str]) -> float:
    experience_text = sections.get("EXPÉRIENCE", "")
    year_pattern = r"(\d{1,2})\s*(?:ans?|années?|years?)"  # e.g., "5 ans"
    month_pattern = r"(\d{1,2})\s*(?:mois|months)"  # e.g., "3 mois"
    range_pattern = r"(\d{4})\s*[-–—à/]\s*(?:(\d{4})|présent|en cours|aujourd’hui|present|current)"  # e.g., "2015-2020"
    month_range_pattern = r"(?i)(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{4})\s*[-–—à/]\s*(?:(?:(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{4}))|présent|en cours|aujourd’hui|present|current)"  # e.g., "Juin 2023 - Décembre 2024"
    date_range_pattern = r"(\d{1,2}/\d{4})\s*[-–—à/]\s*(?:(\d{1,2}/\d{4})|présent|en cours|present|current)"  # e.g., "09/2015 to 05/2019"
    
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
        "july": 7, "august": 8, "septembre": 9, "october": 10, "novembre": 11, "december": 12
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
    
    return min(years, 30.0)

# Extract education from FORMATION/EDUCATION section
def extract_education(sections: Dict[str, str]) -> List[str]:
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
    return list(set(found))

# Score resume based on job role
def score_resume(skills: List[str], experience: float, education: List[str], text: str, role: str) -> float:
    if role not in JOB_ROLES:
        raise ValueError(f"Unknown job role: {role}")
    
    role_info = JOB_ROLES[role]
    required_skills = role_info["required_skills"]
    min_experience = role_info["min_experience"]
    keywords = role_info["keywords"]
    
    matched_required = [s for s in skills if s in required_skills]
    other_skills = [s for s in skills if s not in required_skills]
    skills_score = len(matched_required) * 8 + len(other_skills) * 4
    
    experience_diff = experience - min_experience
    experience_score = experience_diff * 20 if experience_diff >= 0 else experience_diff * 20
    
    education_score = len(education) * 15
    if any(d in ["Master", "Doctorat", "PhD", "Master’s"] for d in education):
        education_score += 10
    
    role_fit_score = 0
    if keywords:
        result = classifier(text[:512], candidate_labels=keywords + ["unrelated"], multi_label=True)
        role_fit_score = sum(score for label, score in zip(result["labels"], result["scores"])
                             if label in keywords) * 40
    
    return skills_score + experience_score + education_score + role_fit_score

# Process a single resume
def process_resume(file_path: str, resume_id: str, role: str) -> Dict:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File {file_path} does not exist.")
    
    text = extract_text_from_pdf(file_path, resume_id)
    sections = segment_text(text, resume_id)
    skills = extract_skills(text, sections, resume_id)
    experience = extract_experience(sections)
    education = extract_education(sections)
    score = score_resume(skills, experience, education, text, role)
    
    return {
        "id": resume_id,
        "skills": skills,
        "experience_years": experience,
        "education": education,
        "score": score
    }

