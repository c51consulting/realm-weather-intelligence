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
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900">{data.location.name}</h1>
        <p className="text-gray-500 mb-6">{data.location.state}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-gray-500 text-sm">Temp</p>
            <p className="text-2xl font-bold">{data.forecast.current.temp_f}&deg;F</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-gray-500 text-sm">Rain 24h</p>
            <p className="text-2xl font-bold">{data.forecast.rain_next_24h}&quot;</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-gray-500 text-sm">Wind</p>
            <p className="text-2xl font-bold">{data.forecast.current.wind_mph} mph</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-gray-500 text-sm">NWS Alerts</p>
            <p className="text-2xl font-bold">{data.warnings.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">AI Risk Summary</h2>
          <RiskBadge level={data.risk.level} score={data.risk.score} />
          <p className="mt-4 text-gray-700 leading-relaxed">{data.summary.summary}</p>
        </div>

        {data.warnings.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">Active NWS Alerts</h2>
            {data.warnings.map((w: any, i: number) => (
              <div key={i} className="border-b last:border-0 py-3">
                <p className="font-medium">{w.severity || w.event} — {w.event || w.title}</p>
                <p className="text-sm text-gray-600 mt-1">{w.headline || w.summary}</p>
              </div>
            ))}
          </div>
        )}

        {data.forecast.daily && data.forecast.daily.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-3">7-Day Forecast</h2>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {data.forecast.daily.map((d: any, i: number) => (
                <div key={i} className="p-2">
                  <p className="font-medium">{d.name || d.date}</p>
                  <p className="text-lg font-bold mt-1">{d.temp || `${d.temp_max}/${d.temp_min}`}</p>
                  <p className="text-gray-500 text-xs mt-1">{d.short || ''}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return <Suspense><ResultsContent /></Suspense>;
}
