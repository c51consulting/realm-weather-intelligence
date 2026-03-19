"""Geocode Australian locations using Open-Meteo geocoding API with postcode support."""
import httpx
import re
from typing import Optional

GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"

# Common Australian postcodes mapped to suburb names for reliable geocoding
AU_POSTCODE_MAP = {
    "2000": "Sydney NSW",
    "2600": "Canberra ACT",
    "3000": "Melbourne VIC",
    "4000": "Brisbane QLD",
    "5000": "Adelaide SA",
    "6000": "Perth WA",
    "7000": "Hobart TAS",
    "0800": "Darwin NT",
    "0870": "Alice Springs NT",
    "2340": "Tamworth NSW",
    "2500": "Wollongong NSW",
    "2640": "Albury NSW",
    "3220": "Geelong VIC",
    "3350": "Ballarat VIC",
    "3550": "Bendigo VIC",
    "3630": "Shepparton VIC",
    "3820": "Warragul VIC",
    "4350": "Toowoomba QLD",
    "4670": "Bundaberg QLD",
    "4700": "Rockhampton QLD",
    "4740": "Mackay QLD",
    "4810": "Townsville QLD",
    "4870": "Cairns QLD",
    "5290": "Mount Gambier SA",
    "6230": "Bunbury WA",
    "6430": "Kalgoorlie WA",
    "6530": "Geraldton WA",
    "2250": "Gosford NSW",
    "2300": "Newcastle NSW",
    "2444": "Port Macquarie NSW",
    "2650": "Wagga Wagga NSW",
    "2680": "Griffith NSW",
    "2795": "Bathurst NSW",
    "2800": "Orange NSW",
    "3280": "Warrnambool VIC",
    "3400": "Horsham VIC",
    "3500": "Mildura VIC",
    "3690": "Wodonga VIC",
    "3840": "Traralgon VIC",
    "3950": "Leongatha VIC",
    "4020": "Redcliffe QLD",
    "4211": "Gold Coast QLD",
    "4500": "Strathpine QLD",
    "4551": "Caloundra QLD",
    "4570": "Gympie QLD",
    "4680": "Gladstone QLD",
    "5700": "Port Augusta SA",
    "6210": "Mandurah WA",
    "6701": "Carnarvon WA",
    "6725": "Broome WA",
}

def _is_au_postcode(query: str) -> bool:
    """Check if query looks like an Australian postcode (3-4 digit number)."""
    return bool(re.match(r'^\d{3,4}$', query.strip()))

async def geocode_location(query: str) -> Optional[dict]:
    """Convert location name or Australian postcode to lat/lon coordinates.
    Returns dict with name, lat, lon, state, country or None."""
    search_query = query.strip()
    
    # If it looks like an Australian postcode, resolve it
    if _is_au_postcode(search_query):
        padded = search_query.zfill(4)
        if padded in AU_POSTCODE_MAP:
            search_query = AU_POSTCODE_MAP[padded]
        else:
            # For unknown postcodes, append Australia to help geocoder
            search_query = f"{search_query} Australia"
    
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
