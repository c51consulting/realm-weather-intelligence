// frontend/src/lib/api.ts
// API client for REALM Weather Intelligence backend

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface Location {
  name: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface CurrentWeather {
  temp_c: number;
  humidity: number;
  rain_mm: number;
  wind_kmh: number;
  weather_code: number;
}

export interface DayForecast {
  date: string;
  temp_max: number;
  temp_min: number;
  rain_mm: number;
  rain_chance: number;
  wind_max_kmh: number;
  gust_max_kmh: number;
  weather_code: number;
}

export interface Forecast {
  current: CurrentWeather;
  daily: DayForecast[];
  rain_next_24h: number;
  rain_next_48h: number;
  rain_next_72h: number;
}

export interface RiskScore {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH";
  breakdown: Record<string, number>;
  user_type: string;
}

export interface Warning {
  title: string;
  summary: string;
  severity: string;
  published: string;
  link: string;
}

export interface SummaryData {
  summary: string;
  source: string;
  location: string;
  risk_level: string;
  risk_score: number;
}

export interface FullReport {
  location: Location;
  forecast: Forecast;
  risk: RiskScore;
  warnings: Warning[];
  summary: SummaryData;
}

export async function getForecast(location: string): Promise<{
  location: Location;
  forecast: Forecast;
  warnings: Warning[];
}> {
  const res = await fetch(`${API_BASE}/forecast?location=${encodeURIComponent(location)}`);
  if (!res.ok) throw new Error("Failed to fetch forecast");
  return res.json();
}

export async function getRisk(location: string, userType = "general"): Promise<{
  location: Location;
  risk: RiskScore;
  warning_count: number;
}> {
  const res = await fetch(`${API_BASE}/risk?location=${encodeURIComponent(location)}&user_type=${userType}`);
  if (!res.ok) throw new Error("Failed to fetch risk");
  return res.json();
}

export async function getSummary(location: string, userType = "general"): Promise<FullReport> {
  const res = await fetch(`${API_BASE}/summary?location=${encodeURIComponent(location)}&user_type=${userType}`);
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}
