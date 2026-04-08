# REALM Weather Intelligence

AI-powered US weather and severe weather risk intelligence platform. Real-time forecasts, NOAA/NWS alerts, composite risk scoring (0-100), and personalised AI summaries. All data in US imperial units (°F, mph, inches).

## Tech Stack

- **Backend:** FastAPI (Python 3.11+)
- **Frontend:** Next.js 14 + Tailwind CSS
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **AI:** OpenAI GPT-4o-mini (with template fallback)
- **Weather:** Open-Meteo API (free, no key needed) — returns °F, mph, inches
- **Warnings:** NOAA National Weather Service API (all 50 US states + DC)

## Quick Start

### Backend
```
cd backend
cp .env.example .env  # Edit with your keys
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload  # API at http://localhost:8000 | Docs at http://localhost:8000/docs
```

### Frontend
```
cd frontend
cp .env.local.example .env.local
npm install
npm run dev  # Frontend at http://localhost:3000
```

### Database
1. Create project at [supabase.com](https://supabase.com/)
2. Run `backend/schema.sql` in SQL Editor
3. Copy URL + anon key to `backend/.env`

## Deploy

| Service | Platform | Command |
|---|---|---|
| Backend | Railway/Render | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Frontend | Vercel | Framework: Next.js, Root: `frontend/` |
| Database | Supabase | Run `schema.sql` |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/forecast?location={loc}` | Weather + NWS warnings |
| GET | `/api/risk?location={loc}&user_type={type}` | Risk score |
| GET | `/api/summary?location={loc}&user_type={type}` | Full AI report |
| POST | `/api/locations` | Save location |
| GET | `/api/locations/{user_id}` | Get saved locations |

## Risk Scoring

- **Precipitation:** max 35 pts
- **NWS Warnings:** max 40 pts
- **Wind:** max 15 pts
- **Wet Days:** max 10 pts
- **LOW** 0-29 | **MEDIUM** 30-64 | **HIGH** 65-100

## US Units

- Temperature: **°F** (Fahrenheit)
- Wind speed: **mph**
- Precipitation: **inches**
- Coverage: All 50 US states + DC

## User Types

General | Farmer | Transport | Council | Business

## License

Private - REALM Group Global
