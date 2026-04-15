"""Geocode Australian locations using multiple geocoding sources."""
import httpx
import re
from typing import Optional

GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

# Major Australian cities/towns with direct coordinates for instant lookup
AU_CITY_COORDS = {
    "sydney": {"name": "Sydney", "state": "New South Wales", "lat": -33.8688, "lon": 151.2093},
    "melbourne": {"name": "Melbourne", "state": "Victoria", "lat": -37.8136, "lon": 144.9631},
    "brisbane": {"name": "Brisbane", "state": "Queensland", "lat": -27.4698, "lon": 153.0251},
    "perth": {"name": "Perth", "state": "Western Australia", "lat": -31.9505, "lon": 115.8605},
    "adelaide": {"name": "Adelaide", "state": "South Australia", "lat": -34.9285, "lon": 138.6007},
    "hobart": {"name": "Hobart", "state": "Tasmania", "lat": -42.8821, "lon": 147.3272},
    "darwin": {"name": "Darwin", "state": "Northern Territory", "lat": -12.4634, "lon": 130.8456},
    "canberra": {"name": "Canberra", "state": "Australian Capital Territory", "lat": -35.2809, "lon": 149.1300},
    "gold coast": {"name": "Gold Coast", "state": "Queensland", "lat": -28.0167, "lon": 153.4000},
    "newcastle": {"name": "Newcastle", "state": "New South Wales", "lat": -32.9283, "lon": 151.7817},
    "wollongong": {"name": "Wollongong", "state": "New South Wales", "lat": -34.4278, "lon": 150.8931},
    "geelong": {"name": "Geelong", "state": "Victoria", "lat": -38.1499, "lon": 144.3617},
    "townsville": {"name": "Townsville", "state": "Queensland", "lat": -19.2590, "lon": 146.8169},
    "cairns": {"name": "Cairns", "state": "Queensland", "lat": -16.9186, "lon": 145.7781},
    "toowoomba": {"name": "Toowoomba", "state": "Queensland", "lat": -27.5598, "lon": 151.9507},
    "ballarat": {"name": "Ballarat", "state": "Victoria", "lat": -37.5622, "lon": 143.8503},
    "bendigo": {"name": "Bendigo", "state": "Victoria", "lat": -36.7570, "lon": 144.2794},
    "launceston": {"name": "Launceston", "state": "Tasmania", "lat": -41.4332, "lon": 147.1441},
    "mackay": {"name": "Mackay", "state": "Queensland", "lat": -21.1411, "lon": 149.1861},
    "rockhampton": {"name": "Rockhampton", "state": "Queensland", "lat": -23.3791, "lon": 150.5100},
    "bunbury": {"name": "Bunbury", "state": "Western Australia", "lat": -33.3271, "lon": 115.6414},
    "bundaberg": {"name": "Bundaberg", "state": "Queensland", "lat": -24.8661, "lon": 152.3489},
    "hervey bay": {"name": "Hervey Bay", "state": "Queensland", "lat": -25.2882, "lon": 152.8531},
    "wagga wagga": {"name": "Wagga Wagga", "state": "New South Wales", "lat": -35.1082, "lon": 147.3598},
    "albury": {"name": "Albury", "state": "New South Wales", "lat": -36.0737, "lon": 146.9135},
    "mildura": {"name": "Mildura", "state": "Victoria", "lat": -34.1855, "lon": 142.1625},
    "shepparton": {"name": "Shepparton", "state": "Victoria", "lat": -36.3833, "lon": 145.4000},
    "gladstone": {"name": "Gladstone", "state": "Queensland", "lat": -23.8489, "lon": 151.2872},
    "alice springs": {"name": "Alice Springs", "state": "Northern Territory", "lat": -23.6980, "lon": 133.8807},
    "mount isa": {"name": "Mount Isa", "state": "Queensland", "lat": -20.7256, "lon": 139.4927},
    "tamworth": {"name": "Tamworth", "state": "New South Wales", "lat": -31.0833, "lon": 150.9167},
    "orange": {"name": "Orange", "state": "New South Wales", "lat": -33.2833, "lon": 149.1000},
    "dubbo": {"name": "Dubbo", "state": "New South Wales", "lat": -32.2569, "lon": 148.6011},
    "geraldton": {"name": "Geraldton", "state": "Western Australia", "lat": -28.7744, "lon": 114.6150},
    "kalgoorlie": {"name": "Kalgoorlie", "state": "Western Australia", "lat": -30.7489, "lon": 121.4658},
    "warrnambool": {"name": "Warrnambool", "state": "Victoria", "lat": -38.3818, "lon": 142.4873},
    "albert park": {"name": "Albert Park", "state": "Victoria", "lat": -37.8417, "lon": 144.9558},
    "sunshine coast": {"name": "Sunshine Coast", "state": "Queensland", "lat": -26.6500, "lon": 153.0667},
    "bathurst": {"name": "Bathurst", "state": "New South Wales", "lat": -33.4167, "lon": 149.5833},
    "lismore": {"name": "Lismore", "state": "New South Wales", "lat": -28.8133, "lon": 153.2769},
    "port macquarie": {"name": "Port Macquarie", "state": "New South Wales", "lat": -31.4333, "lon": 152.9000},
    "coffs harbour": {"name": "Coffs Harbour", "state": "New South Wales", "lat": -30.2963, "lon": 153.1157},
    "katherine": {"name": "Katherine", "state": "Northern Territory", "lat": -14.4667, "lon": 132.2667},
    "broome": {"name": "Broome", "state": "Western Australia", "lat": -17.9614, "lon": 122.2359},
    "karratha": {"name": "Karratha", "state": "Western Australia", "lat": -20.7364, "lon": 116.8464},
    "port hedland": {"name": "Port Hedland", "state": "Western Australia", "lat": -20.3107, "lon": 118.6013},
}

# Australian state abbreviation map
AU_STATE_ABBREV = {
    "nsw": "New South Wales", "vic": "Victoria", "qld": "Queensland",
    "wa": "Western Australia", "sa": "South Australia", "tas": "Tasmania",
    "nt": "Northern Territory", "act": "Australian Capital Territory",
}


async def geocode_location(location: str) -> Optional[dict]:
    """Geocode an Australian location string.
    Returns dict with name, state, country, lat, lon, timezone or None."""
    key = location.strip().lower()
    # Strip trailing state abbreviations like "Melbourne, VIC"
    key_clean = re.sub(r',\s*[A-Za-z]{2,3}$', '', key).strip()

    if key_clean in AU_CITY_COORDS:
        c = AU_CITY_COORDS[key_clean]
        return {
            "name": c["name"],
            "state": c["state"],
            "country": "Australia",
            "latitude": c["lat"],
            "longitude": c["lon"],
            "timezone": "Australia/Sydney",
        }

    # Try Open-Meteo geocoder with AU country filter
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                GEOCODE_URL,
                params={"name": location, "count": 5, "language": "en", "format": "json", "countryCode": "AU"},
            )
            data = resp.json()
            results = data.get("results", [])
            au_results = [r for r in results if r.get("country_code") == "AU"]
            if au_results:
                r = au_results[0]
                return {
                    "name": r.get("name", location),
                    "state": r.get("admin1", ""),
                    "country": "Australia",
                    "latitude": r["latitude"],
                    "longitude": r["longitude"],
                    "timezone": r.get("timezone", "Australia/Sydney"),
                }
    except Exception:
        pass

    # Fallback: Nominatim with AU country code
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                NOMINATIM_URL,
                params={"q": location, "format": "json", "limit": 5, "countrycodes": "au"},
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
                    "country": "Australia",
                    "latitude": float(r["lat"]),
                    "longitude": float(r["lon"]),
                    "timezone": "Australia/Sydney",
                }
    except Exception:
        pass

    return None
