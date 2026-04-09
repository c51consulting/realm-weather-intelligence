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
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-2xl font-bold text-blue-700 mb-2">R</div>
      <div className="text-gray-500">Checking authentication...</div>
    </div>
  );
  if (!location) return <div className="p-8 text-center text-gray-500">No location specified.</div>;
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900">{data.location.name}</h1>
      <p className="text-gray-500 mb-4">{data.location.state}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <div className="text-xs text-gray-500">Temp</div>
          <div className="text-xl font-bold">{data.forecast.current.temp_f}&deg;F</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <div className="text-xs text-gray-500">Rain 24h</div>
          <div className="text-xl font-bold">{data.forecast.rain_next_24h}&quot;</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <div className="text-xs text-gray-500">Wind</div>
          <div className="text-xl font-bold">{data.forecast.current.wind_mph} mph</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <div className="text-xs text-gray-500">NWS Alerts</div>
          <div className="text-xl font-bold">{data.warnings.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">AI Risk Summary</h2>
        <RiskBadge level={data.risk.level} score={data.risk.score} />
        <p className="mt-4 text-gray-700">{data.summary.summary}</p>
      </div>

      {data.warnings.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Active NWS Alerts</h2>
          <div className="space-y-3">
            {data.warnings.map((w: any, i: number) => (
              <div key={i} className="border-l-4 border-red-500 pl-4 py-2">
                <div className="font-medium">{w.severity || w.event} &mdash; {w.event || w.title}</div>
                <p className="text-sm text-gray-600">{w.headline || w.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.forecast.daily && data.forecast.daily.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">7-Day Forecast</h2>
          <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
            {data.forecast.daily.map((d: any, i: number) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xs font-medium text-gray-500 mb-1">{d.name || d.date}</div>
                <div className="font-bold">{d.temp || `${d.temp_max}/${d.temp_min}`}</div>
                <div className="text-xs text-gray-500 mt-1">{d.short || ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
