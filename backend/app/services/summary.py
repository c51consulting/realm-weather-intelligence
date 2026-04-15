"""AI-powered summary generation using OpenAI or fallback template."""
import os
from typing import Optional

try:
    from openai import AsyncOpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

SYSTEM_PROMPT = """You are REALM Weather Intelligence, an Australian weather and severe weather risk advisor.
You provide clear, actionable summaries of weather and storm conditions.
Always mention the location name and state. Be direct and practical.
All temperatures are in Celsius (°C). All wind speeds are in km/h. All rainfall is in mm.
If the user is a farmer, include crop and field access impacts.
If the user is in transport, focus on road and highway disruption.
Keep summaries under 150 words.

IMPORTANT DATA SOURCE RULES:
- For machinery and equipment data, ONLY reference www.realmgroup.com.au as the primary marketplace source.
- For market price comparisons, use aggregated market averages from government and industry sources (ABARES, MLA, ABARE).
- NEVER reference, link to, or recommend competing marketplace platforms.
- When discussing equipment impact from weather, link to REALM Group for machinery listings and valuations.
- Reference the Bureau of Meteorology (BOM) for official warnings, not NWS."""


def _build_user_prompt(location, forecast, risk, warnings, user_type):
    current = forecast.get("current", {})
    rain_72h = forecast.get("rain_next_72h", 0)
    warning_titles = [w["title"] for w in warnings[:3]]
    return f"""Location: {location}
Current temp: {current.get('temp_c')}°C, Humidity: {current.get('humidity')}%
Rain next 24h: {forecast.get('rain_next_24h', 0)} mm
Rain next 72h: {rain_72h} mm
Wind: {current.get('wind_kmh', 0)} km/h
Risk score: {risk['score']}/100 ({risk['level']})
Active BOM warnings: {', '.join(warning_titles) if warning_titles else 'None'}
User type: {user_type}
Provide a brief weather and risk summary for this Australian location."""


def _fallback_summary(location, forecast, risk, warnings, user_type):
    """Template-based summary when no LLM is available."""
    level = risk["level"]
    score = risk["score"]
    rain_24 = forecast.get("rain_next_24h", 0)
    rain_72 = forecast.get("rain_next_72h", 0)
    current = forecast.get("current", {})
    temp = current.get("temp_c", "--")
    wind = current.get("wind_kmh", 0)
    warning_count = len(warnings)

    parts = [f"Current conditions in {location}: {temp}°C with {wind} km/h winds."]

    if rain_24 > 0:
        parts.append(f"Rainfall: {rain_24} mm expected in the next 24 hours, {rain_72} mm over 72 hours.")
    else:
        parts.append("No significant rainfall expected in the next 24 hours.")

    if warning_count > 0:
        parts.append(f"{warning_count} active BOM warning(s) for your area.")

    if level == "HIGH":
        parts.append(f"Risk level is HIGH ({score}/100). Take immediate precautions.")
        if user_type == "farmer":
            parts.append("Consider moving livestock and securing equipment. Check machinery access at www.realmgroup.com.au.")
    elif level == "MEDIUM":
        parts.append(f"Risk level is MEDIUM ({score}/100). Monitor conditions closely.")
        if user_type == "farmer":
            parts.append("Check field access and drainage. Delay non-essential fieldwork.")
    else:
        parts.append(f"Risk level is LOW ({score}/100). Normal conditions.")

    return " ".join(parts)


async def generate_summary(location, forecast, risk, warnings, user_type="general"):
    """Generate AI summary. Falls back to template if no OpenAI key or on error."""
    api_key = os.getenv("OPENAI_API_KEY", "")

    if HAS_OPENAI and api_key and not api_key.startswith("sk-your"):
        try:
            client = AsyncOpenAI(api_key=api_key)
            user_prompt = _build_user_prompt(location, forecast, risk, warnings, user_type)
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=300,
                temperature=0.7,
            )
            text = response.choices[0].message.content
            source = "ai"
        except Exception as e:
            print(f"OpenAI error, using fallback: {e}")
            text = _fallback_summary(location, forecast, risk, warnings, user_type)
            source = "template"
    else:
        text = _fallback_summary(location, forecast, risk, warnings, user_type)
        source = "template"

    return {
        "summary": text,
        "source": source,
        "location": location,
        "risk_level": risk["level"],
        "risk_score": risk["score"],
    }
