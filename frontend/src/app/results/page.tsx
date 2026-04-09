// frontend/src/app/results/page.tsx - Results Page
"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { getSummary, FullReport } from "@/lib/api";
import { supabase } from "@/lib/supabase";

function RiskBadge({ level, score }: { level: string; score: number }) {
  const colors = {
    LOW: "bg-green-500",
    MEDIUM: "bg-yellow-500",
    HIGH: "bg-red-500",
  };
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold ${colors[level as keyof typeof colors] || "bg-gray-500"}`}>
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
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mx-auto mb-3">R</div>
        <p className="text-gray-500 text-sm">Checking authentication...</p>
      </div>
    </div>
  );
  if (!location) return <p className="p-8 text-center">No location specified.</p>;
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );
  if (error) return <p className="p-8 text-center text-red-500">{error}</p>;
  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{data.location.name}</h1>
            <p className="text-gray-500">{data.location.state}</p>
          </div>
          <RiskBadge level={data.risk.level} score={data.risk.score} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">Temp</div>
            <div className="text-lg font-bold">{data.forecast.current.temp_f}&deg;F</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">Rain 24h</div>
            <div className="text-lg font-bold">{data.forecast.rain_next_24h}&quot;</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">Wind</div>
            <div className="text-lg font-bold">{data.forecast.current.wind_mph} mph</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">NWS Alerts</div>
            <div className="text-lg font-bold">{data.warnings.length}</div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">AI Risk Summary</h2>
          <div className="bg-blue-50 rounded-xl p-6">
            <p className="text-gray-700 leading-relaxed">{data.summary.summary}</p>
          </div>
        </div>

        {data.warnings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Active NWS Alerts</h2>
            <div className="space-y-3">
              {data.warnings.map((w: { event: string; severity: string; headline: string }, i: number) => (
                <div key={i} className="border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-red-600">{w.severity}</span>
                    <span className="font-semibold">{w.event}</span>
                  </div>
                  <p className="text-sm text-gray-600">{w.headline}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.forecast.daily && data.forecast.daily.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7-Day Forecast</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {data.forecast.daily.map((d: { name: string; temp: string; short: string }, i: number) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xs font-medium text-gray-500 mb-1">{d.name}</div>
                  <div className="font-bold">{d.temp}</div>
                  <div className="text-xs text-gray-500 mt-1">{d.short}</div>
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
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
