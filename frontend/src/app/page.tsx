// frontend/src/app/page.tsx - Landing Page
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [location, setLocation] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      router.push(`/results?location=${encodeURIComponent(location.trim())}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center pt-20 pb-16 px-4">
        <div className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          Part of the REALM Overlay Ecosystem
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Know What&apos;s Coming{" "}
          <span className="text-blue-600">Before It Hits</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Real-time weather forecasts, severe weather alerts, and AI-powered
          summaries personalised to your location and needs. Built for the United States.
        </p>
        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter any US city, state or ZIP code..."
              className="flex-1 px-5 py-3.5 rounded-xl border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Check Risk
            </button>
          </div>
        </form>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-4 pb-16">
        {[
          { label: "NWS Alerts", value: "Real-Time" },
          { label: "USGS Gauges", value: "9,000+" },
          { label: "All 50 States", value: "Coverage" },
          { label: "Risk Summaries", value: "AI-Powered" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Risk Tiers */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold text-center mb-3">Your Risk at a Glance</h2>
        <p className="text-center text-gray-600 mb-10">A single clear rating for your location.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { level: "LOW", range: "0-29", color: "green", desc: "Minimal risk. Normal conditions." },
            { level: "MED", range: "30-64", color: "yellow", desc: "Elevated conditions. Monitor closely." },
            { level: "HIGH", range: "65-100", color: "red", desc: "Significant risk. Take precautions." },
          ].map((tier) => (
            <div key={tier.level} className={`p-6 rounded-xl border-t-4 border-${tier.color}-500 bg-${tier.color}-50`}>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold text-white bg-${tier.color}-500 mb-3`}>
                {tier.level}
              </span>
              <div className="font-bold text-lg">Score {tier.range}</div>
              <p className="text-gray-600 mt-2">{tier.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-center mb-10">Comprehensive Monitoring</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "AI Risk Summary", desc: "Plain-English summaries with actionable guidance powered by AI analysis." },
            { title: "NWS Alerts", desc: "Real-time severe weather alerts from the National Weather Service with severity levels." },
            { title: "USGS River Gauges", desc: "Monitor 9,000+ USGS river gauges with trend indicators and flood thresholds." },
            { title: "Weather Forecast", desc: "7-day forecasts including rainfall, temperature (°F), wind (mph) and storm probability." },
            { title: "Saved Locations", desc: "Save home, farm, work and travel routes for instant risk checks." },
            { title: "Smart Alerts", desc: "Get notified when risk changes at your locations via email or SMS." },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-xl border border-gray-200 hover:shadow-md transition">
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Check Your Risk?</h2>
        <p className="mb-8 text-blue-100">Enter any US location for instant AI-powered insights.</p>
        <a href="/" className="bg-white text-blue-600 px-8 py-3 rounded-xl font-medium hover:bg-blue-50">
          Check My Location
        </a>
      </section>
    </main>
  );
}
