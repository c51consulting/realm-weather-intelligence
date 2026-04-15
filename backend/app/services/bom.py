"""Fetch BOM (Bureau of Meteorology) warnings via RSS/API."""
import httpx
from typing import List
import xml.etree.ElementTree as ET

from app.config import BOM_RSS_BASE

# BOM FWO (Forecast Warning Office) product codes per state
BOM_STATE_PRODUCTS = {
    "New South Wales": "IDN11060",
    "Victoria": "IDV10753",
    "Queensland": "IDQ21037",
    "Western Australia": "IDW21100",
    "South Australia": "IDS21044",
    "Tasmania": "IDT65100",
    "Northern Territory": "IDD21037",
    "Australian Capital Territory": "IDN11060",
}


def get_bom_product_code(state: str) -> str:
    """Get the BOM product code for a given state."""
    return BOM_STATE_PRODUCTS.get(state, "IDN11060")


async def get_bom_warnings(state: str) -> List[dict]:
    """Fetch active BOM warnings for an Australian state.
    Returns list of warning dicts with title, summary, severity, published, link."""
    product = get_bom_product_code(state)
    url = f"{BOM_RSS_BASE}/{product}.xml"
    headers = {"User-Agent": "REALM-Weather-Intelligence/1.0 (contact@realmgroup.com)"}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            xml_text = resp.text
    except Exception:
        return []

    warnings = []
    try:
        root = ET.fromstring(xml_text)
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        entries = root.findall(".//atom:entry", ns) or root.findall(".//entry")
        if not entries:
            entries = root.findall(".//item")

        for entry in entries[:20]:
            title_el = entry.find("atom:title", ns) or entry.find("title")
            summary_el = entry.find("atom:summary", ns) or entry.find("description")
            updated_el = entry.find("atom:updated", ns) or entry.find("pubDate")
            link_el = entry.find("atom:link", ns) or entry.find("link")

            title = title_el.text if title_el is not None else ""
            summary_text = (summary_el.text or "")[:300] if summary_el is not None else ""
            published = updated_el.text if updated_el is not None else ""
            link = ""
            if link_el is not None:
                link = link_el.get("href", "") or (link_el.text or "")

            title_lower = title.lower()
            if any(w in title_lower for w in ["severe", "extreme", "dangerous", "emergency", "cyclone"]):
                severity = "HIGH"
            elif any(w in title_lower for w in ["warning", "watch", "flood", "storm", "fire"]):
                severity = "MEDIUM"
            else:
                severity = "LOW"

            warnings.append({
                "title": title,
                "summary": summary_text,
                "severity": severity,
                "published": published,
                "link": link,
            })
    except Exception:
        pass

    return warnings
