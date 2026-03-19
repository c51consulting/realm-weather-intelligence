"""Configuration loaded from environment variables."""
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,https://realm-weather-intelligence.vercel.app").split(",")
OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast"
BOM_RSS_BASE = "https://www.bom.gov.au/fwo"
