"""REALM Weather Intelligence - FastAPI Backend"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import ALLOWED_ORIGINS
from app.routes import health, forecast, risk, summary, locations

app = FastAPI(
    title="REALM Weather Intelligence API",
    version="1.0.0",
    description="Australian weather, flood and risk intelligence API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(forecast.router, prefix="/api", tags=["forecast"])
app.include_router(risk.router, prefix="/api", tags=["risk"])
app.include_router(summary.router, prefix="/api", tags=["summary"])
app.include_router(locations.router, prefix="/api", tags=["locations"])

@app.get("/")
def root():
    return {"service": "REALM Weather Intelligence", "status": "running"}
