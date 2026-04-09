// frontend/src/app/dashboard/page.tsx
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
        <h1 className="text-xl font-bold">REALM Dashboard</h1>
      </div>

      {/* Controls */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl border p-6 mb-8">
          <h2 className="font-semibold mb-4">Add Location</h2>
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
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Add"}
            </button>
          </div>
        </div>

        {/* Location Cards */}
        {reports.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No locations added yet.</p>
            <p className="text-sm">Search above to add your first US location.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((r, i) => (
              <div key={i} className="bg-white rounded-xl border p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{r.location.name}</h3>
                    <p className="text-sm text-gray-500">{r.location.state}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${riskColor(r.risk.level)}`}>
                    {r.risk.level} {r.risk.score}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Temp</span>
                    <div className="font-semibold">{r.forecast.current.temp_f}&deg;F</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Rain 24h</span>
                    <div className="font-semibold">{r.forecast.rain_next_24h}&quot;</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Wind</span>
                    <div className="font-semibold">{r.forecast.current.wind_mph} mph</div>
                  </div>
                  <div>
                    <span className="text-gray-500">NWS Alerts</span>
                    <div className="font-semibold">{r.warnings.length}</div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-gray-700">
                  {r.summary.summary.slice(0, 200)}{r.summary.summary.length > 200 ? "..." : ""}
                </div>
                <a
                  href={`/results?location=${encodeURIComponent(r.location.name)}`}
                  className="text-blue-600 text-sm mt-3 inline-block hover:underline"
                >
                  View Full Report
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
