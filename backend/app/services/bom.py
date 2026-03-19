"""Fetch BOM (Bureau of Meteorology) warnings via RSS feeds."""
import feedparser
from typing import List

# BOM RSS warning feeds by state
BOM_FEEDS = {
    "VIC": "https://www.bom.gov.au/fwo/IDV10753.warnings_land_vic.atom.xml",
    "NSW": "https://www.bom.gov.au/fwo/IDN11060.warnings_land_nsw.atom.xml",
    "QLD": "https://www.bom.gov.au/fwo/IDQ11060.warnings_land_qld.atom.xml",
    "SA": "https://www.bom.gov.au/fwo/IDS10076.warnings_land_sa.atom.xml",
    "WA": "https://www.bom.gov.au/fwo/IDW14100.warnings_land_wa.atom.xml",
    "TAS": "https://www.bom.gov.au/fwo/IDT13600.warnings_land_tas.atom.xml",
    "NT": "https://www.bom.gov.au/fwo/IDD10207.warnings_land_nt.atom.xml",
    "ACT": "https://www.bom.gov.au/fwo/IDN11060.warnings_land_nsw.atom.xml",
}

STATE_MAP = {
    "Victoria": "VIC", "New South Wales": "NSW",
    "Queensland": "QLD", "South Australia": "SA",
    "Western Australia": "WA", "Tasmania": "TAS",
    "Northern Territory": "NT",
    "Australian Capital Territory": "ACT",
}

def get_state_code(state_name: str) -> str:
    """Convert full state name to code."""
    if state_name in BOM_FEEDS:
        return state_name
    return STATE_MAP.get(state_name, "VIC")

async def get_bom_warnings(state: str) -> List[dict]:
    """Fetch active BOM warnings for a state.
    Returns list of warning dicts with title, summary, severity, link."""
    code = get_state_code(state)
    feed_url = BOM_FEEDS.get(code, BOM_FEEDS["VIC"])

    try:
        feed = feedparser.parse(feed_url)
    except Exception:
        return []

    warnings = []
    for entry in feed.entries:
        title = entry.get("title", "")
        severity = "HIGH" if any(w in title.lower() for w in ["severe", "major", "emergency"]) else (
            "MEDIUM" if any(w in title.lower() for w in ["warning", "watch", "moderate"]) else "LOW"
        )
        warnings.append({
            "title": title,
            "summary": entry.get("summary", "")[:300],
            "severity": severity,
            "published": entry.get("published", ""),
            "link": entry.get("link", ""),
        })
    return warnings
