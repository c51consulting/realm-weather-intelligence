from fastapi import APIRouter, HTTPException
from app.services.geocode import geocode_location
from app.services.weather import get_forecast
from app.services.bom import get_bom_warnings

router = APIRouter()

@router.get("/forecast")
async def forecast(location: str):
    """Get weather forecast for an Australian location."""
    geo = await geocode_location(location)
    if not geo:
        raise HTTPException(status_code=404, detail="Location not found")

    weather = await get_forecast(geo["latitude"], geo["longitude"])
    warnings = await get_bom_warnings(geo.get("state", "VIC"))

    return {
        "location": geo,
        "forecast": weather,
        "warnings": warnings,
    }
