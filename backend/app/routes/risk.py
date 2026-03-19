from fastapi import APIRouter, HTTPException
from app.services.geocode import geocode_location
from app.services.weather import get_forecast
from app.services.bom import get_bom_warnings
from app.services.risk import compute_risk_score

router = APIRouter()

@router.get("/risk")
async def risk(location: str, user_type: str = "general"):
    """Get risk score for a location. user_type: general, farmer, transport, council"""
    geo = await geocode_location(location)
    if not geo:
        raise HTTPException(status_code=404, detail="Location not found")

    weather = await get_forecast(geo["latitude"], geo["longitude"])
    warnings = await get_bom_warnings(geo.get("state", "VIC"))
    risk_data = compute_risk_score(weather, warnings, user_type)

    return {
        "location": geo,
        "risk": risk_data,
        "warning_count": len(warnings),
    }
