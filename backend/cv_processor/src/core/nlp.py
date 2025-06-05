import spacy
from transformers import pipeline
import logging
import nltk

logger = logging.getLogger(__name__)

# Download NLTK stopwords
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Initialize SpaCy French model
try:
    nlp = spacy.load("fr_core_news_sm")
    logger.info("Loaded SpaCy fr_core_news_sm model")
except Exception as e:
    logger.error(f"Failed to load SpaCy model: {str(e)}")
    raise

# Initialize Hugging Face zero-shot classifier
try:
    classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    logger.info("Loaded Hugging Face bart-large-mnli model")
except Exception as e:
    logger.error(f"Failed to load Hugging Face model: {str(e)}")
    raise

def tokenize_text(text: str) -> list:
    """Tokenize text using SpaCy, returning tokens and noun chunks."""
    try:
        doc = nlp(text)
        tokens = []
        for chunk in doc.noun_chunks:
            tokens.append(chunk.text.lower())
        for token in doc:
            if not token.is_punct or token.text in ['.', '/']:
                tokens.append(token.text.lower())
        token_list = []
        for token in tokens:
            token_list.extend(token.strip().split())
        return [t for t in token_list if t and len(t) > 1]
    except Exception as e:
        logger.error(f"Error tokenizing text: {str(e)}")
        raise