// frontend/src/app/page.tsx - Landing Page
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.push('/dashboard');
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center pt-20 pb-16 px-4">
        <div className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          Part of the REALM Overlay Intelligence System
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Know What&apos;s Coming{" "}
          <span className="text-blue-600">Before It Hits</span>
        </h1>
        <p className="text-gray-500 text-sm mb-2">Built for Australian properties, routes, and real-time risk monitoring</p>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
          Real-time weather forecasts, severe weather alerts, and AI-powered
          risk summaries for any Australian location.
        </p>
        <p className="text-sm text-gray-500 mb-10">
          Your first check is free. Save locations, track over time, and unlock full risk history with an account.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <Link href="/login?tab=register" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-center transition">
            Check Weather Risk
          </Link>
          <Link href="/login" className="border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-8 rounded-lg text-center transition">
            Sign In
          </Link>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="max-w-4xl mx-auto px-4 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Coverage", value: "Australia" },
            { label: "Data Inputs", value: "BOM + Gauges" },
            { label: "AI Output", value: "Risk Detection" },
            { label: "Use Case", value: "Location-Based" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What You Get */}
      <section className="max-w-5xl mx-auto px-4 mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">What You Get</h2>
        <p className="text-gray-500 text-center mb-8">Everything included. No paywalls.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "AI Risk Summary", desc: "Plain-English summaries with actionable guidance powered by AI analysis." },
            { title: "BOM Alerts", desc: "Real-time severe weather alerts from the Bureau of Meteorology with severity levels." },
            { title: "River & Flood Gauges", desc: "Monitor river gauges with trend indicators and flood thresholds across Australia." },
            { title: "Weather Forecast", desc: "7-day forecasts including rainfall, temperature, wind and storm probability." },
            { title: "Saved Locations", desc: "Save home, farm, work and travel routes for instant risk checks." },
            { title: "Smart Alerts", desc: "Get notified when risk changes at your locations via email or SMS." },
          ].map((f) => (
            <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Risk Tiers */}
      <section className="max-w-4xl mx-auto px-4 mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Your Risk at a Glance</h2>
        <p className="text-gray-500 text-center mb-8">A single clear rating for your location.</p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-green-600 font-bold text-lg">Low</span>
            </div>
            <p className="text-gray-900 font-medium mb-1">Minimal risk detected</p>
            <p className="text-gray-500 text-sm">No action required at this time</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-yellow-600 font-bold text-lg">Medium</span>
            </div>
            <p className="text-gray-900 font-medium mb-1">Monitor conditions closely</p>
            <p className="text-gray-500 text-sm">Stay informed and prepare if needed</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-red-600 font-bold text-lg">High</span>
            </div>
            <p className="text-gray-900 font-medium mb-1">Action recommended</p>
            <p className="text-gray-500 text-sm">Take precautions and monitor official channels</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Check Your Weather Risk</h2>
        <p className="text-gray-500 mb-6">Enter any Australian location for real-time risk analysis</p>
        <Link href="/login?tab=register" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition inline-block">
          Start Free Check
        </Link>
      </section>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 pb-8 text-center text-gray-400 text-xs border-t border-gray-200 pt-6 space-y-1">
        <p>REALM Weather Intelligence v1.0 | Australia Coverage | Decision-support only, not an emergency warning system</p>
        <p>Not a replacement for BOM alerts. Not emergency advice. Use official channels for critical decisions.</p>
        <p>Part of the REALM Overlay Intelligence System</p>
      </footer>
    </main>
  );
}
