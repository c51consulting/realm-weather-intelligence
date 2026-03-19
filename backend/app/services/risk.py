"""Risk scoring engine - computes flood and weather risk 0-100."""
from typing import List

def compute_risk_score(forecast: dict, warnings: List[dict], user_type: str = "general") -> dict:
    """Compute a composite risk score from weather + warnings.
    Score 0-29 = LOW, 30-64 = MEDIUM, 65-100 = HIGH.
    Weights adjust based on user_type."""
    score = 0
    breakdown = {}

    # --- Rainfall component (max 35 points) ---
    rain_72h = forecast.get("rain_next_72h", 0)
    rain_24h = forecast.get("rain_next_24h", 0)
    if rain_72h > 100:
        rain_score = 35
    elif rain_72h > 50:
        rain_score = 25
    elif rain_72h > 20:
        rain_score = 15
    elif rain_24h > 10:
        rain_score = 10
    else:
        rain_score = min(rain_24h, 5)
    breakdown["rainfall"] = rain_score
    score += rain_score

    # --- BOM warnings component (max 40 points) ---
    warning_score = 0
    for w in warnings:
        sev = w.get("severity", "LOW")
        if sev == "HIGH":
            warning_score += 20
        elif sev == "MEDIUM":
            warning_score += 10
        else:
            warning_score += 3
    warning_score = min(warning_score, 40)
    breakdown["warnings"] = warning_score
    score += warning_score

    # --- Wind component (max 15 points) ---
    days = forecast.get("daily", [])
    max_gust = max((d.get("gust_max_kmh", 0) for d in days[:3]), default=0)
    if max_gust > 90:
        wind_score = 15
    elif max_gust > 60:
        wind_score = 10
    elif max_gust > 40:
        wind_score = 5
    else:
        wind_score = 0
    breakdown["wind"] = wind_score
    score += wind_score

    # --- Consecutive wet days (max 10 points) ---
    wet_days = sum(1 for d in days[:5] if d.get("rain_mm", 0) > 1)
    consec_score = min(wet_days * 2, 10)
    breakdown["consecutive_wet"] = consec_score
    score += consec_score

    # --- User type adjustments ---
    if user_type == "farmer":
        score = int(score * 1.15)  # farmers more sensitive to rain
    elif user_type == "transport":
        score = int(score * 1.1)  # transport sensitive to wind + rain

    score = min(score, 100)

    if score >= 65:
        level = "HIGH"
    elif score >= 30:
        level = "MEDIUM"
    else:
        level = "LOW"

    return {
        "score": score,
        "level": level,
        "breakdown": breakdown,
        "user_type": user_type,
    }
