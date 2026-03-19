"""Geocode Australian locations using Open-Meteo geocoding API."""
import httpx
from typing import Optional

GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"

async def geocode_location(query: str) -> Optional[dict]:
    """Convert location name to lat/lon coordinates.
    Returns dict with name, lat, lon, state, country or None."""
    params = {
        "name": query,
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
