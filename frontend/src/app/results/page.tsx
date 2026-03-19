// frontend/src/app/results/page.tsx - Results Page
"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { getSummary, FullReport } from "@/lib/api";

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
  const location = searchParams.get("location") || "";
  const [data, setData] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!location) return;
    setLoading(true);
    getSummary(location)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [location]);

  if (!location) return <p className="p-8 text-center">No location specified.</p>;
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );
  if (error) return <p className="p-8 text-center text-red-500">{error}</p>;
  if (!data) return null;

  const { forecast, risk, warnings, summary } = data;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Location Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{data.location.name}, {data.location.state}</h1>
        <p className="text-gray-500">Lat: {data.location.latitude.toFixed(4)}, Lon: {data.location.longitude.toFixed(4)}</p>
      </div>

      {/* Risk + Current Weather Row */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Risk Score</h2>
          <RiskBadge level={risk.level} score={risk.score} />
          <div className="mt-4 space-y-2">
            {Object.entries(risk.breakdown).map(([key, val]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="capitalize text-gray-600">{key.replace("_", " ")}</span>
                <span className="font-medium">{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Current Conditions</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><span className="text-gray-500 text-sm">Temp</span><div className="text-2xl font-bold">{forecast.current.temp_c}&deg;C</div></div>
            <div><span className="text-gray-500 text-sm">Humidity</span><div className="text-2xl font-bold">{forecast.current.humidity}%</div></div>
            <div><span className="text-gray-500 text-sm">Wind</span><div className="text-2xl font-bold">{forecast.current.wind_kmh} km/h</div></div>
            <div><span className="text-gray-500 text-sm">Rain</span><div className="text-2xl font-bold">{forecast.current.rain_mm} mm</div></div>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          AI Summary <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{summary.source}</span>
        </h2>
        <p className="text-gray-700 leading-relaxed">{summary.summary}</p>
      </div>

      {/* Rainfall Outlook */}
      <div className="bg-white rounded-xl border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Rainfall Outlook</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><div className="text-sm text-gray-500">Next 24h</div><div className="text-xl font-bold">{forecast.rain_next_24h} mm</div></div>
          <div><div className="text-sm text-gray-500">Next 48h</div><div className="text-xl font-bold">{forecast.rain_next_48h} mm</div></div>
          <div><div className="text-sm text-gray-500">Next 72h</div><div className="text-xl font-bold">{forecast.rain_next_72h} mm</div></div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="bg-white rounded-xl border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">7-Day Forecast</h2>
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {forecast.daily.map((day) => (
              <div key={day.date} className="text-center p-3 rounded-lg bg-gray-50 min-w-[100px]">
                <div className="text-xs text-gray-500">{day.date}</div>
                <div className="font-bold">{day.temp_max}&deg;</div>
                <div className="text-sm text-gray-400">{day.temp_min}&deg;</div>
                <div className="text-xs text-blue-600 mt-1">{day.rain_mm}mm ({day.rain_chance}%)</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-white rounded-xl border p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Active Warnings ({warnings.length})</h2>
          <div className="space-y-3">
            {warnings.map((w, i) => (
              <div key={i} className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                <div className="font-medium">{w.title}</div>
                <div className="text-sm text-gray-600 mt-1">{w.summary}</div>
                <a href={w.link} target="_blank" rel="noopener" className="text-sm text-blue-600 mt-2 inline-block">View on BOM</a>
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
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
