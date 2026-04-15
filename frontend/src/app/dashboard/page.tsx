// frontend/src/app/dashboard/page.tsx
"use client";
import { useState, useEffect } from "react";
import { getSummary, FullReport } from "@/lib/api";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const USER_TYPES = [
  { value: "general", label: "General" },
  { value: "farmer", label: "Farmer" },
  { value: "transport", label: "Transport / Logistics" },
  { value: "council", label: "Council / Emergency" },
  { value: "business", label: "Business Owner" },
];

export default function DashboardPage() {
  const [location, setLocation] = useState("");
  const [userType, setUserType] = useState("general");
  const [reports, setReports] = useState<FullReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login');
      } else {
        setAuthChecked(true);
      }
    });
  }, [router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mx-auto mb-3">R</div>
          <p className="text-gray-500 text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const addLocation = async () => {
    if (!location.trim()) return;
    setLoading(true);
    try {
      const data = await getSummary(location, userType);
      setReports((prev) => [...prev, data]);
      setLocation("");
    } catch (e) {
      alert("Failed to fetch data for that location.");
    }
    setLoading(false);
  };

  const riskColor = (level: string) => {
    if (level === "HIGH") return "bg-red-500";
    if (level === "MEDIUM") return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">REALM Dashboard</h1>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <h2 className="text-lg font-semibold mb-3">Add Location</h2>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter US city, state or ZIP code..."
            className="flex-1 min-w-[200px] px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === "Enter" && addLocation()}
          />
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="px-4 py-2.5 border rounded-lg bg-white"
          >
            {USER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <button
            onClick={addLocation}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Add"}
          </button>
        </div>
      </div>

      {/* Location Cards */}
      {reports.length === 0 ? (
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <p className="text-gray-400 text-lg">No locations added yet.</p>
          <p className="text-gray-400 text-sm mt-1">Search above to add your first US location.</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((r, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-5">
              <h3 className="text-lg font-bold">{r.location.name}</h3>
              <p className="text-gray-500 text-sm mb-3">{r.location.state}</p>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded text-white text-xs font-bold ${riskColor(r.risk.level)}`}>{r.risk.level}</span>
                <span className="text-sm text-gray-600">{r.risk.score}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div><span className="text-gray-500">Temp</span><p className="font-semibold">{r.forecast.current.temp_f}&deg;F</p></div>
                <div><span className="text-gray-500">Rain 24h</span><p className="font-semibold">{r.forecast.rain_next_24h}&quot;</p></div>
                <div><span className="text-gray-500">Wind</span><p className="font-semibold">{r.forecast.current.wind_mph} mph</p></div>
                <div><span className="text-gray-500">NWS Alerts</span><p className="font-semibold">{r.warnings.length}</p></div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{r.summary.summary.slice(0, 200)}{r.summary.summary.length > 200 ? "..." : ""}</p>
              <a href={`/results?location=${encodeURIComponent(r.location.name)}`} className="text-blue-600 text-sm font-medium hover:underline">View Full Report &rarr;</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
