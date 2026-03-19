"""Geocode Australian locations using Open-Meteo geocoding API with postcode support."""
import httpx
import re
from typing import Optional

GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"

# Australian postcodes with direct coordinates to bypass geocoder issues
AU_POSTCODE_COORDS = {
    "2000": {"name": "Sydney", "state": "New South Wales", "lat": -33.8688, "lon": 151.2093},
    "2600": {"name": "Canberra", "state": "Australian Capital Territory", "lat": -35.2809, "lon": 149.1300},
    "3000": {"name": "Melbourne", "state": "Victoria", "lat": -37.8136, "lon": 144.9631},
    "4000": {"name": "Brisbane", "state": "Queensland", "lat": -27.4698, "lon": 153.0251},
    "5000": {"name": "Adelaide", "state": "South Australia", "lat": -34.9285, "lon": 138.6007},
    "6000": {"name": "Perth", "state": "Western Australia", "lat": -31.9505, "lon": 115.8605},
    "7000": {"name": "Hobart", "state": "Tasmania", "lat": -42.8821, "lon": 147.3272},
    "0800": {"name": "Darwin", "state": "Northern Territory", "lat": -12.4634, "lon": 130.8456},
    "0870": {"name": "Alice Springs", "state": "Northern Territory", "lat": -23.6980, "lon": 133.8807},
    "2300": {"name": "Newcastle", "state": "New South Wales", "lat": -32.9283, "lon": 151.7817},
    "2500": {"name": "Wollongong", "state": "New South Wales", "lat": -34.4278, "lon": 150.8931},
    "2640": {"name": "Albury", "state": "New South Wales", "lat": -36.0737, "lon": 146.9135},
    "2650": {"name": "Wagga Wagga", "state": "New South Wales", "lat": -35.1082, "lon": 147.3598},
    "3220": {"name": "Geelong", "state": "Victoria", "lat": -38.1499, "lon": 144.3617},
    "3350": {"name": "Ballarat", "state": "Victoria", "lat": -37.5622, "lon": 143.8503},
    "3550": {"name": "Bendigo", "state": "Victoria", "lat": -36.7570, "lon": 144.2794},
    "3630": {"name": "Shepparton", "state": "Victoria", "lat": -36.3833, "lon": 145.4000},
    "3500": {"name": "Mildura", "state": "Victoria", "lat": -34.1855, "lon": 142.1625},
    "3690": {"name": "Wodonga", "state": "Victoria", "lat": -36.1217, "lon": 146.8883},
    "3840": {"name": "Traralgon", "state": "Victoria", "lat": -38.1953, "lon": 146.5415},
    "4211": {"name": "Gold Coast", "state": "Queensland", "lat": -28.0167, "lon": 153.4000},
    "4350": {"name": "Toowoomba", "state": "Queensland", "lat": -27.5598, "lon": 151.9507},
    "4670": {"name": "Bundaberg", "state": "Queensland", "lat": -24.8661, "lon": 152.3489},
    "4700": {"name": "Rockhampton", "state": "Queensland", "lat": -23.3791, "lon": 150.5100},
    "4810": {"name": "Townsville", "state": "Queensland", "lat": -19.2590, "lon": 146.8169},
    "4870": {"name": "Cairns", "state": "Queensland", "lat": -16.9186, "lon": 145.7781},
    "6230": {"name": "Bunbury", "state": "Western Australia", "lat": -33.3271, "lon": 115.6414},
    "6430": {"name": "Kalgoorlie", "state": "Western Australia", "lat": -30.7489, "lon": 121.4658},
    "6530": {"name": "Geraldton", "state": "Western Australia", "lat": -28.7774, "lon": 114.6150},
    "6725": {"name": "Broome", "state": "Western Australia", "lat": -17.9614, "lon": 122.2359},
    "3206": {"name": "Albert Park", "state": "Victoria", "lat": -37.8417, "lon": 144.9553},
}

def _is_au_postcode(query: str) -> bool:
    """Check if query looks like an Australian postcode (3-4 digit number)."""
    return bool(re.match(r'^\d{3,4}$', query.strip()))

async def geocode_location(query: str) -> Optional[dict]:
    """Convert location name or Australian postcode to lat/lon coordinates.
    Returns dict with name, lat, lon, state, country or None."""
    search_query = query.strip()
    
    # If it looks like an Australian postcode, check direct lookup first
    if _is_au_postcode(search_query):
        padded = search_query.zfill(4)
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
        # Unknown postcode - try geocoder with just the number + Australia
        search_query = f"postcode {search_query} Australia"
    
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
    # Filter for Australian results first
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
