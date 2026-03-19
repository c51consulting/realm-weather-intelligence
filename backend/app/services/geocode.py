"""Geocode Australian locations using multiple geocoding sources."""
import httpx
import re
from typing import Optional

GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

# Major Australian postcodes with direct coordinates for instant lookup
AU_POSTCODE_COORDS = {
    "2000": {"name": "Sydney", "state": "New South Wales", "lat": -33.8688, "lon": 151.2093},
    "2600": {"name": "Canberra", "state": "Australian Capital Territory", "lat": -35.2809, "lon": 149.1300},
    "3000": {"name": "Melbourne", "state": "Victoria", "lat": -37.8136, "lon": 144.9631},
    "4000": {"name": "Brisbane", "state": "Queensland", "lat": -27.4698, "lon": 153.0251},
    "5000": {"name": "Adelaide", "state": "South Australia", "lat": -34.9285, "lon": 138.6007},
    "6000": {"name": "Perth", "state": "Western Australia", "lat": -31.9505, "lon": 115.8605},
    "7000": {"name": "Hobart", "state": "Tasmania", "lat": -42.8821, "lon": 147.3272},
    "0800": {"name": "Darwin", "state": "Northern Territory", "lat": -12.4634, "lon": 130.8456},
    "3206": {"name": "Albert Park", "state": "Victoria", "lat": -37.8417, "lon": 144.9553},
}

def _is_au_postcode(query: str) -> bool:
    """Check if query looks like an Australian postcode (3-4 digit number)."""
    return bool(re.match(r'^\d{3,4}$', query.strip()))

async def _geocode_au_postcode(postcode: str) -> Optional[dict]:
    """Use Nominatim (OpenStreetMap) to geocode any Australian postcode."""
    params = {
        "postalcode": postcode,
        "country": "AU",
        "format": "json",
        "limit": 1,
    }
    headers = {"User-Agent": "REALMWeatherIntelligence/1.0"}
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(NOMINATIM_URL, params=params, headers=headers)
            data = resp.json()
        if data and len(data) > 0:
            result = data[0]
            display = result.get("display_name", "")
            parts = [p.strip() for p in display.split(",")]
            # Extract suburb name and state from display_name
            name = parts[0] if parts else postcode
            state = ""
            for p in parts:
                if p.strip() in ["Victoria", "New South Wales", "Queensland", "South Australia", "Western Australia", "Tasmania", "Northern Territory", "Australian Capital Territory"]:
                    state = p.strip()
                    break
            return {
                "name": name,
                "state": state,
                "country": "Australia",
                "latitude": float(result["lat"]),
                "longitude": float(result["lon"]),
                "timezone": "Australia/Sydney",
            }
    except Exception as e:
        print(f"Nominatim geocode error: {e}")
    return None

async def geocode_location(query: str) -> Optional[dict]:
    """Convert location name or Australian postcode to lat/lon coordinates."""
    search_query = query.strip()

    # If it looks like an Australian postcode
    if _is_au_postcode(search_query):
        padded = search_query.zfill(4)
        # Check hardcoded lookup first (instant)
        if padded in AU_POSTCODE_COORDS:
            pc = AU_POSTCODE_COORDS[padded]
            return {
                "name": pc["name"],
                "state": pc["state"],
                "country": "Australia",
                "latitude": pc["lat"],
                "longitude": pc["lon"],
                "timezone": "Australia/Sydney",
            }
        # Fallback: use Nominatim for any AU postcode
        result = await _geocode_au_postcode(padded)
        if result:
            return result
        return None

    # For place names, use Open-Meteo geocoder
    params = {
        "name": search_query,
        "count": 5,
        "language": "en",
        "format": "json"
    }
    async with httpx.AsyncClient() as client:
        resp = await client.get(GEOCODE_URL, params=params)
        data = resp.json()

    results = data.get("results", [])
    au_results = [r for r in results if r.get("country_code") == "AU"]
    pick = au_results[0] if au_results else (results[0] if results else None)
    if not pick:
        return None
    return {
        "name": pick.get("name", query),
        "state": pick.get("admin1", ""),
        "country": pick.get("country", "Australia"),
        "latitude": pick["latitude"],
        "longitude": pick["longitude"],
        "timezone": pick.get("timezone", "Australia/Sydney"),
    }
