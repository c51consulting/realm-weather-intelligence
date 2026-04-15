"""Fetch weather forecast data from Open-Meteo API - Australian metric units."""
import httpx
from app.config import OPEN_METEO_BASE


async def get_forecast(lat: float, lon: float) -> dict:
    """Get 7-day forecast for given coordinates.
    Returns temperature in °C, rain in mm, wind in km/h."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "temperature_unit": "celsius",
        "windspeed_unit": "kmh",
        "precipitation_unit": "mm",
        "daily": ",".join([
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "precipitation_probability_max",
            "windspeed_10m_max",
            "windgusts_10m_max",
            "weathercode",
        ]),
        "current": ",".join([
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation",
            "windspeed_10m",
            "weathercode",
        ]),
        "timezone": "auto",
        "forecast_days": 7,
    }

    async with httpx.AsyncClient() as client:
        resp = await client.get(OPEN_METEO_BASE, params=params)
        data = resp.json()

    current = data.get("current", {})
    daily = data.get("daily", {})

    days = []
    dates = daily.get("time", [])
    for i, date in enumerate(dates):
        days.append({
            "date": date,
            "temp_max": daily["temperature_2m_max"][i],
            "temp_min": daily["temperature_2m_min"][i],
            "rain_mm": daily["precipitation_sum"][i],
            "rain_chance": daily["precipitation_probability_max"][i],
            "wind_max_kmh": daily["windspeed_10m_max"][i],
            "gust_max_kmh": daily["windgusts_10m_max"][i],
            "weather_code": daily["weathercode"][i],
        })

    return {
        "current": {
            "temp_c": current.get("temperature_2m"),
            "humidity": current.get("relative_humidity_2m"),
            "rain_mm": current.get("precipitation"),
            "wind_kmh": current.get("windspeed_10m"),
            "weather_code": current.get("weathercode"),
        },
        "daily": days,
        "rain_next_24h": days[0]["rain_mm"] if days else 0,
        "rain_next_48h": sum(d["rain_mm"] for d in days[:2]),
        "rain_next_72h": sum(d["rain_mm"] for d in days[:3]),
    }
