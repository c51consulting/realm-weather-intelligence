"""Fetch NOAA/NWS (National Weather Service) warnings via API."""
import httpx
from typing import List

# NOAA NWS API base
NWS_API_BASE = "https://api.weather.gov"

# US state abbreviation map
STATE_MAP = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
    "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
    "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
    "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
    "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
    "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
    "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
    "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
    "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
    "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
    "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
    "Wisconsin": "WI", "Wyoming": "WY", "District of Columbia": "DC",
}

def get_state_code(state_name: str) -> str:
    """Convert full state name to 2-letter code."""
    if len(state_name) == 2 and state_name.upper() in STATE_MAP.values():
        return state_name.upper()
    return STATE_MAP.get(state_name, state_name)

async def get_bom_warnings(state: str) -> List[dict]:
    """Fetch active NWS warnings for a US state.
    Returns list of warning dicts with title, summary, severity, link."""
    code = get_state_code(state)
    url = f"{NWS_API_BASE}/alerts/active"
    params = {"area": code}
    headers = {"User-Agent": "REALM-Weather-Intelligence/1.0 (contact@realmgroup.com)"}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            resp.raise_for_status()
            data = resp.json()
    except Exception:
        return []
    warnings = []
    for feature in data.get("features", [])[:20]:
        props = feature.get("properties", {})
        event = props.get("event", "")
        severity_raw = props.get("severity", "Unknown")
        if severity_raw in ("Extreme", "Severe"):
            severity = "HIGH"
        elif severity_raw == "Moderate":
            severity = "MEDIUM"
        else:
            severity = "LOW"
        warnings.append({
            "title": event,
            "summary": (props.get("description") or "")[:300],
            "severity": severity,
            "published": props.get("sent", ""),
            "link": props.get("@id", ""),
        })
    return warnings
