import traceback
from fastapi import APIRouter, HTTPException
from app.services.geocode import geocode_location
from app.services.weather import get_forecast
from app.services.bom import get_bom_warnings
from app.services.risk import compute_risk_score
from app.services.summary import generate_summary

router = APIRouter()

@router.get("/summary")
async def summary(location: str, user_type: str = "general"):
    """Get full AI-powered summary for a location."""
    try:
        geo = await geocode_location(location)
        if not geo:
            raise HTTPException(status_code=404, detail="Location not found")

        weather = await get_forecast(geo["latitude"], geo["longitude"])
        warnings = await get_bom_warnings(geo.get("state", "VIC"))
        risk_data = compute_risk_score(weather, warnings, user_type)
        location_name = f"{geo['name']}, {geo['state']}"
        summary_data = await generate_summary(location_name, weather, risk_data, warnings, user_type)

        return {
            "location": geo,
            "forecast": weather,
            "risk": risk_data,
            "warnings": warnings,
            "summary": summary_data,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Summary error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")
