// frontend/src/app/results/page.tsx - Results Page
"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { getSummary, FullReport } from "@/lib/api";
import { supabase } from "@/lib/supabase";

function RiskBadge({ level, score }: { level: string; score: number }) {
  const colors: Record<string, string> = {
    LOW: "bg-green-500",
    MEDIUM: "bg-yellow-500",
    HIGH: "bg-red-500",
  };
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold ${colors[level] || "bg-gray-500"}`}>
      {level} <span className="text-sm font-normal">({score}/100)</span>
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const location = searchParams.get("location") || "";
  const [data, setData] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login');
      } else {
        setAuthChecked(true);
      }
    });
  }, [router]);

  useEffect(() => {
    if (!location || !authChecked) return;
    setLoading(true);
    getSummary(location)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [location, authChecked]);

  if (!authChecked) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mx-auto mb-3">R</div>
        <p className="text-gray-500 text-sm">Checking authentication...</p>
      </div>
    </div>
  );

  if (!location) return <div className="p-8 text-center text-gray-500">No location specified.</div>;
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mx-auto mb-3 animate-pulse">R</div>
        <p className="text-gray-500 text-sm">Loading weather data...</p>
      </div>
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-1">{data.location.name}</h1>
      <p className="text-gray-500 mb-6">{data.location.state}</p>

      {/* Current Conditions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-gray-500 text-sm">Temp</div>
          <div className="text-2xl font-bold">{data.forecast.current.temp_c}</div>
          <div className="text-gray-400 text-sm">°C</div>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-gray-500 text-sm">Rain 24h</div>
          <div className="text-2xl font-bold">{data.forecast.rain_next_24h}</div>
          <div className="text-gray-400 text-sm">mm</div>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-gray-500 text-sm">Wind</div>
          <div className="text-2xl font-bold">{data.forecast.current.wind_kmh}</div>
          <div className="text-gray-400 text-sm">km/h</div>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <div className="text-gray-500 text-sm">BOM Alerts</div>
          <div className="text-2xl font-bold">{data.warnings.length}</div>
        </div>
      </div>

      {/* AI Risk Summary */}
      <div className="bg-white rounded-xl border p-6 mb-8">
        <h2 className="font-bold text-lg mb-3">AI Risk Summary</h2>
        <div className="mb-4"><RiskBadge level={data.risk.level} score={data.risk.score} /></div>
        <p className="text-gray-700 leading-relaxed">{data.summary.summary}</p>
      </div>

      {/* BOM Alerts */}
      {data.warnings.length > 0 && (
        <div className="bg-white rounded-xl border p-6 mb-8">
          <h2 className="font-bold text-lg mb-3">Active BOM Alerts</h2>
          {data.warnings.map((w: any, i: number) => (
            <div key={i} className="border-b last:border-0 py-3">
              <div className="font-semibold">{w.severity || w.event} — {w.event || w.title}</div>
              <p className="text-sm text-gray-600">{w.headline || w.summary}</p>
            </div>
          ))}
        </div>
      )}

      {/* 7-Day Forecast */}
      {data.forecast.daily && data.forecast.daily.length > 0 && (
        <div className="bg-white rounded-xl border p-6 mb-8">
          <h2 className="font-bold text-lg mb-3">7-Day Forecast</h2>
          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {data.forecast.daily.map((d: any, i: number) => (
              <div key={i} className="p-2">
                <div className="font-semibold text-gray-500">{d.name || d.date}</div>
                <div className="font-bold">{d.temp || `${d.temp_max}/${d.temp_min}`}</div>
                <div className="text-gray-400 text-xs">°C</div>
                {d.rain_mm > 0 && <div className="text-blue-500 text-xs">{d.rain_mm}mm</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return <Suspense><ResultsContent /></Suspense>;
}
