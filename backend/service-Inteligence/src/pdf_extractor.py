from __future__ import annotations
"""pdf_extractor.py – v4  
(Python ≥ 3.9)

▶ **Changements clés**
* Fallback « Heading → Section » : détecte `EXPÉRIENCES`, `LANGUES`, etc. quand le
  classifieur BERT se trompe.
* Extraction des langues via pattern `Langue : Niveau` + liste élargie.
* Expériences : heuristique lignes contenant (rôle|stage) **et** une date ➜ rôle,
  entreprise, durée.
* Compétences : si la section *Skills* est introuvable, scanne tout le document.
* Renvoie toujours des dictionnaires non vides (sinon valeurs par défaut).

Dépendances : pdfminer.six, transformers, torch, rapidfuzz, spacy.
"""

from pathlib import Path
from typing import Dict, Any, List, Tuple
import re, json, unicodedata, datetime as dt, itertools
import requests, pdfminer.high_level
from transformers import pipeline
from rapidfuzz import process, fuzz
import spacy
from spacy.matcher import PhraseMatcher

# ========================  MODELS  =========================================
_SECTION_MODEL = "has-abi/distilBERT-finetuned-resumes-sections"
_NER_MODEL     = "Davlan/xlm-roberta-base-ner-hrl"

_section = pipeline("text-classification", model=_SECTION_MODEL, tokenizer=_SECTION_MODEL,
                    device=-1, batch_size=8)
_ner      = pipeline("token-classification", model=_NER_MODEL, tokenizer=_NER_MODEL,
                    aggregation_strategy="simple", device=-1)

# ========================  CONFIG  =========================================
CONFIG_DIR = Path(__file__).parent / "config"
CONFIG_DIR.mkdir(exist_ok=True)
try:
    with open(CONFIG_DIR / "skills.json", encoding="utf-8") as f:
        _SKILLS = [s.lower() for s in json.load(f)]
except FileNotFoundError:
    _SKILLS = []

# spaCy matcher for skills
NLP = spacy.blank("fr")
MATCHER = PhraseMatcher(NLP.vocab, attr="LOWER")
if _SKILLS:
    MATCHER.add("SKILL", [NLP.make_doc(s) for s in _SKILLS])

# headings fallback
HEAD_KWS = {
    "experiences": ("experience", "expériences", "experiences"),
    "educations":  ("education", "formation", "diplome", "diplôme", "éducation"),
    "skills":      ("competence", "compétence", "skills", "compétences"),
    "languages":   ("langues", "languages"),
}

LANG_KWS   = ["français", "anglais", "arab", "espagnol", "allemand", "italien", "portugais",
              "chinois", "mandarin", "japonais", "russe", "neerlandais", "turc", "hindi"]
LEVEL_KWS  = ["maternelle", "native", "bilingue", "courant", "professionnel", "fluent",
              "intermediaire", "avancé", "advanced", "elementaire", "debutant", "basic"]

# keywords mapping
DEGREE_KWS = {
    "Master": ["master", "msc", "maitrise"],
    "Licence": ["licence", "bachelor", "lst"],
    "Bac": ["bac", "baccalaureat"],
}
ROLE_KWS = {
    "Developpeur": ["developpeur", "developer", "full stack", "backend", "frontend"],
    "Data Engineer": ["data engineer"],
    "Data Scientist": ["data scientist"],
    "Cybersecurity": ["cybersecurite", "cybersecurity", "security"],
}

DEFAULTS = {
    "year": 2000,
    "duree": "2 mois",
    "type": "Stage",
    "score": 3,
    "entreprise": "",            # valeur vide si NER n'en trouve pas
    "level": "Intermediaire"      # niveau par défaut pour les langues
}

DATE_RX  = re.compile(r"(\d{4})(?:\s*[–\-]\s*(\d{4}|actuel|present))?", re.I)
MONTH_RX = re.compile(r"(\d{1,2})[\-/](\d{4})")

# ========================  HELPERS  ========================================

def _strip(x: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", x) if unicodedata.category(c) != "Mn")


def download_pdf(url: str) -> Path:
    p = Path("temp_cv.pdf")
    p.write_bytes(requests.get(url, timeout=30).content)
    return p


def _lines(text: str) -> List[str]:
    text = re.sub(r"[•\u2022\u2023]", "\n", text)
    return [l.strip() for l in text.splitlines() if l.strip()]


def _paras(lines: List[str], max_len: int = 360) -> List[str]:
    buf, out = [], []
    for l in lines:
        if len(" ".join(buf + [l])) > max_len:
            out.append(" ".join(buf)); buf=[l]
        else:
            buf.append(l)
    if buf: out.append(" ".join(buf))
    return out


def _classify(paras: List[str]) -> Dict[str, List[str]]:
    groups: Dict[str, List[str]] = {}
    for p, pred in zip(paras, _section(paras)):
        groups.setdefault(pred['label'].lower(), []).append(p)
    return groups


def _heading_split(lines: List[str]) -> Dict[str, List[str]]:
    sec: Dict[str, List[str]] = {}
    cur = "other"
    for l in lines:
        clean = _strip(l.lower())
        # heading if uppercase or ends with ':'
        if l.isupper() or clean.endswith(":"):
            for key, kws in HEAD_KWS.items():
                if any(k in clean for k in kws):
                    cur = key; break
            else:
                cur = "other"
            continue
        sec.setdefault(cur, []).append(l)
    return sec

# ========================  PARSERS  =========================================

def _keyword(text: str, mapping: Dict[str, List[str]]) -> str | None:
    low = _strip(text.lower())
    for k, vals in mapping.items():
        if any(v in low for v in vals):
            return k
    return None


def _years(text: str) -> Tuple[int,int]:
    m = DATE_RX.search(text)
    if m:
        s = int(m.group(1))
        e = m.group(2)
        e = int(e) if e and e.isdigit() else dt.datetime.now().year
        return s,e
    return DEFAULTS['year'], DEFAULTS['year']


def _duration(text: str) -> str:
    m = MONTH_RX.findall(text)
    if len(m) >= 2:
        (m1,y1),(m2,y2) = m[0], m[1]
        months = (int(y2)-int(y1))*12 + int(m2)-int(m1)
        return f"{months} mois" if months>0 else DEFAULTS['duree']
    return DEFAULTS['duree']

# ----------------- main parser ---------------------------------------------

def parse_cv(src: str | Path) -> Dict[str, Any]:
    if isinstance(src, (str, Path)) and str(src).startswith("http"):
        src = download_pdf(str(src))
    raw = pdfminer.high_level.extract_text(str(src))

    lines = _lines(raw)
    paras = _paras(lines)
    ml_groups = _classify(paras)
    hd_groups = _heading_split(lines)

    def pick(*keys):
        for k in keys:
            if ml_groups.get(k):
                return ml_groups[k]
        for k in keys:
            if hd_groups.get(k):
                return hd_groups[k]
        return []

    # -------- EDUCATIONS ---------------------------------------------------
    edu_blocks = pick("educations", "education", "formation")
    educ: Dict[str, Any] = {}
    for b in edu_blocks:
        deg = _keyword(b, DEGREE_KWS)
        if not deg:
            continue
        start, end = _years(b)
        org  = " ".join(e['word'] for e in _ner(b) if e['entity_group']=='ORG') or ""
        educ[deg] = {"annee_debut": start, "annee_fin": end, "etablissement": org}

    # -------- EXPERIENCES --------------------------------------------------
    exp_blocks = pick("experiences", "experience")
    experiences: Dict[str, Any] = {}
    for b in exp_blocks:
        role = _keyword(b, ROLE_KWS) or "Autre"
        if role == "Autre" and not DATE_RX.search(b):
            continue  # peu fiable
        dur  = _duration(b)
        org  = " ".join(e['word'] for e in _ner(b) if e['entity_group']=='ORG') or DEFAULTS['entreprise']
        m = MONTH_RX.findall(b)
        if m:
            # Prend le premier couple mois/année trouvé
            date_debut = f"{m[0][0].zfill(2)}/{m[0][1]}"
        else:
            start, _ = _years(b)
            date_debut = f"01/{start}"
        experiences.setdefault(role, {
            "duree": dur,
            "type": DEFAULTS['type'],
            "entreprise": org,
            "date_debut": date_debut
        })

    # -------- LANGUAGES ----------------------------------------------------
    lang_text = "\n".join(pick("languages", "langues")) or raw
    langues: Dict[str,str] = {}
    for lg in LANG_KWS:
        if lg in _strip(lang_text.lower()):
            lvl_candidates = [lv for lv in LEVEL_KWS if lv in _strip(lang_text.lower())]
            lvl = lvl_candidates[0].capitalize() if lvl_candidates else DEFAULTS['level']
            langues[lg.capitalize()] = lvl


    # -------- SKILLS -------------------------------------------------------
    skill_text = "\n".join(pick("skills", "competences")) or raw
    doc = NLP(skill_text.lower())
    skills = {doc[s:e].text for _,s,e in MATCHER(doc)}
    skills.update({m[0] for m in process.extract(" ".join(skill_text.split()), _SKILLS, scorer=fuzz.token_sort_ratio, score_cutoff=90)})
    competences = {s: DEFAULTS['score'] for s in sorted(skills)}

    return {
        "educations":  educ,
        "experiences": experiences,
        "competences": competences,
        "langues":     langues,
    }

# -------------------------- CLI -------------------------------------------
if __name__ == "__main__":
    import argparse, json, sys
    ap = argparse.ArgumentParser("CV→JSON v4")
    ap.add_argument("file_or_url")
    ap.add_argument("-o","--out")
    a=ap.parse_args()
    data = parse_cv(a.file_or_url)
    txt=json.dumps(data,ensure_ascii=False,indent=2)
    if a.out:
        Path(a.out).write_text(txt,encoding="utf-8")
    else:
        print(txt)
