"""Geocode US locations using multiple geocoding sources."""
import httpx
import re
from typing import Optional

GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

# Major US cities/zip codes with direct coordinates for instant lookup
US_CITY_COORDS = {
    "new york": {"name": "New York", "state": "New York", "lat": 40.7128, "lon": -74.0060},
    "los angeles": {"name": "Los Angeles", "state": "California", "lat": 34.0522, "lon": -118.2437},
    "chicago": {"name": "Chicago", "state": "Illinois", "lat": 41.8781, "lon": -87.6298},
    "houston": {"name": "Houston", "state": "Texas", "lat": 29.7604, "lon": -95.3698},
    "phoenix": {"name": "Phoenix", "state": "Arizona", "lat": 33.4484, "lon": -112.0740},
    "philadelphia": {"name": "Philadelphia", "state": "Pennsylvania", "lat": 39.9526, "lon": -75.1652},
    "san antonio": {"name": "San Antonio", "state": "Texas", "lat": 29.4241, "lon": -98.4936},
    "san diego": {"name": "San Diego", "state": "California", "lat": 32.7157, "lon": -117.1611},
    "dallas": {"name": "Dallas", "state": "Texas", "lat": 32.7767, "lon": -96.7970},
    "san jose": {"name": "San Jose", "state": "California", "lat": 37.3382, "lon": -121.8863},
    "austin": {"name": "Austin", "state": "Texas", "lat": 30.2672, "lon": -97.7431},
    "jacksonville": {"name": "Jacksonville", "state": "Florida", "lat": 30.3322, "lon": -81.6557},
    "fort worth": {"name": "Fort Worth", "state": "Texas", "lat": 32.7555, "lon": -97.3308},
    "columbus": {"name": "Columbus", "state": "Ohio", "lat": 39.9612, "lon": -82.9988},
    "charlotte": {"name": "Charlotte", "state": "North Carolina", "lat": 35.2271, "lon": -80.8431},
    "indianapolis": {"name": "Indianapolis", "state": "Indiana", "lat": 39.7684, "lon": -86.1581},
    "san francisco": {"name": "San Francisco", "state": "California", "lat": 37.7749, "lon": -122.4194},
    "seattle": {"name": "Seattle", "state": "Washington", "lat": 47.6062, "lon": -122.3321},
    "denver": {"name": "Denver", "state": "Colorado", "lat": 39.7392, "lon": -104.9903},
    "nashville": {"name": "Nashville", "state": "Tennessee", "lat": 36.1627, "lon": -86.7816},
    "oklahoma city": {"name": "Oklahoma City", "state": "Oklahoma", "lat": 35.4676, "lon": -97.5164},
    "el paso": {"name": "El Paso", "state": "Texas", "lat": 31.7619, "lon": -106.4850},
    "washington dc": {"name": "Washington", "state": "District of Columbia", "lat": 38.9072, "lon": -77.0369},
    "las vegas": {"name": "Las Vegas", "state": "Nevada", "lat": 36.1699, "lon": -115.1398},
    "louisville": {"name": "Louisville", "state": "Kentucky", "lat": 38.2527, "lon": -85.7585},
    "memphis": {"name": "Memphis", "state": "Tennessee", "lat": 35.1495, "lon": -90.0490},
    "portland": {"name": "Portland", "state": "Oregon", "lat": 45.5051, "lon": -122.6750},
    "baltimore": {"name": "Baltimore", "state": "Maryland", "lat": 39.2904, "lon": -76.6122},
    "milwaukee": {"name": "Milwaukee", "state": "Wisconsin", "lat": 43.0389, "lon": -87.9065},
    "albuquerque": {"name": "Albuquerque", "state": "New Mexico", "lat": 35.0844, "lon": -106.6504},
    "tucson": {"name": "Tucson", "state": "Arizona", "lat": 32.2226, "lon": -110.9747},
    "fresno": {"name": "Fresno", "state": "California", "lat": 36.7378, "lon": -119.7871},
    "sacramento": {"name": "Sacramento", "state": "California", "lat": 38.5816, "lon": -121.4944},
    "mesa": {"name": "Mesa", "state": "Arizona", "lat": 33.4152, "lon": -111.8315},
    "miami": {"name": "Miami", "state": "Florida", "lat": 25.7617, "lon": -80.1918},
    "atlanta": {"name": "Atlanta", "state": "Georgia", "lat": 33.7490, "lon": -84.3880},
    "minneapolis": {"name": "Minneapolis", "state": "Minnesota", "lat": 44.9778, "lon": -93.2650},
    "new orleans": {"name": "New Orleans", "state": "Louisiana", "lat": 29.9511, "lon": -90.0715},
    "cleveland": {"name": "Cleveland", "state": "Ohio", "lat": 41.4993, "lon": -81.6944},
    "tampa": {"name": "Tampa", "state": "Florida", "lat": 27.9506, "lon": -82.4572},
    "pittsburgh": {"name": "Pittsburgh", "state": "Pennsylvania", "lat": 40.4406, "lon": -79.9959},
    "cincinnati": {"name": "Cincinnati", "state": "Ohio", "lat": 39.1031, "lon": -84.5120},
    "kansas city": {"name": "Kansas City", "state": "Missouri", "lat": 39.0997, "lon": -94.5786},
    "st louis": {"name": "St. Louis", "state": "Missouri", "lat": 38.6270, "lon": -90.1994},
    "detroit": {"name": "Detroit", "state": "Michigan", "lat": 42.3314, "lon": -83.0458},
    "boston": {"name": "Boston", "state": "Massachusetts", "lat": 42.3601, "lon": -71.0589},
    "honolulu": {"name": "Honolulu", "state": "Hawaii", "lat": 21.3069, "lon": -157.8583},
    "anchorage": {"name": "Anchorage", "state": "Alaska", "lat": 61.2181, "lon": -149.9003},
}

async def geocode_location(location: str) -> Optional[dict]:
    """Geocode a US location string. Returns dict with name, state, country, lat, lon, timezone."""
    # Check hardcoded US cities first (instant, no API call)
    key = location.strip().lower()
    # strip trailing state abbreviation pattern like "Houston, TX"
    key_clean = re.sub(r',\s*[A-Z]{2}$', '', key).strip()
    if key_clean in US_CITY_COORDS:
        c = US_CITY_COORDS[key_clean]
        return {
            "name": c["name"],
            "state": c["state"],
            "country": "United States",
            "latitude": c["lat"],
            "longitude": c["lon"],
            "timezone": "America/New_York",
        }

    # Try Open-Meteo geocoder with US country filter
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                GEOCODE_URL,
                params={"name": location, "count": 5, "language": "en", "format": "json", "countryCode": "US"},
            )
            data = resp.json()
            results = data.get("results", [])
            # Filter to US results only
            us_results = [r for r in results if r.get("country_code") == "US"]
            if us_results:
                r = us_results[0]
                return {
                    "name": r.get("name", location),
                    "state": r.get("admin1", ""),
                    "country": "United States",
                    "latitude": r["latitude"],
                    "longitude": r["longitude"],
                    "timezone": r.get("timezone", "America/New_York"),
                }
    except Exception:
        pass

    # Fallback: Nominatim with US country code
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                NOMINATIM_URL,
                params={"q": location, "format": "json", "limit": 5, "countrycodes": "us"},
                headers={"User-Agent": "REALM-Weather-Intelligence/1.0"},
            )
            results = resp.json()
            if results:
                r = results[0]
                display = r.get("display_name", "")
                parts = [p.strip() for p in display.split(",")]
                name = parts[0] if parts else location
                state = parts[-3] if len(parts) >= 3 else ""
                return {
                    "name": name,
                    "state": state,
                    "country": "United States",
                    "latitude": float(r["lat"]),
                    "longitude": float(r["lon"]),
                    "timezone": "America/New_York",
                }
    except Exception:
        pass

    return None
