// frontend/src/app/page.tsx - Gated Landing Page
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
          Part of the REALM Overlay Ecosystem
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Know What&apos;s Coming{" "}
          <span className="text-blue-600">Before It Hits</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
          Real-time weather forecasts, severe weather alerts, and AI-powered
          risk summaries for any US location.
        </p>
        <p className="text-sm text-gray-500 mb-10">
          Free account required to access risk checks, saved locations, AI summaries, and alerts.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <Link href="/login" className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 text-center">
            Create Free Account
          </Link>
          <Link href="/login" className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 text-center">
            Sign In
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 px-4 pb-16">
        {[
          { label: "NWS Alerts", value: "Real-Time" },
          { label: "USGS Gauges", value: "9,000+" },
          { label: "All 50 States", value: "Coverage" },
          { label: "Risk Summaries", value: "AI-Powered" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </section>

      {/* What You Get */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold text-center mb-2">What You Get With a Free Account</h2>
        <p className="text-gray-500 text-center mb-8">Register once to unlock everything below.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "AI Risk Summary", desc: "Plain-English summaries with actionable guidance powered by AI analysis." },
            { title: "NWS Alerts", desc: "Real-time severe weather alerts from the National Weather Service with severity levels." },
            { title: "USGS River Gauges", desc: "Monitor 9,000+ USGS river gauges with trend indicators and flood thresholds." },
            { title: "Weather Forecast", desc: "7-day forecasts including rainfall, temperature, wind and storm probability." },
            { title: "Saved Locations", desc: "Save home, farm, work and travel routes for instant risk checks." },
            { title: "Smart Alerts", desc: "Get notified when risk changes at your locations via email or SMS." },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Risk Tiers */}
      <section className="max-w-3xl mx-auto px-4 pb-16 text-center">
        <h2 className="text-3xl font-bold mb-2">Your Risk at a Glance</h2>
        <p className="text-gray-500 mb-8">A single clear rating for your location.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { level: "LOW", range: "0-29", color: "green", desc: "Minimal risk. Normal conditions." },
            { level: "MED", range: "30-64", color: "yellow", desc: "Elevated conditions. Monitor closely." },
            { level: "HIGH", range: "65-100", color: "red", desc: "Significant risk. Take precautions." },
          ].map((tier) => (
            <div key={tier.level} className="bg-white rounded-xl p-5 shadow-sm">
              <div className={`text-${tier.color}-500 font-bold text-xl mb-1`}>{tier.level}</div>
              <p className="text-sm text-gray-500 mb-1">Score {tier.range}</p>
              <p className="text-sm text-gray-600">{tier.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-2xl mx-auto px-4 pb-20 text-center">
        <h2 className="text-2xl font-bold mb-2">Ready to Check Your Risk?</h2>
        <p className="text-gray-500 mb-6">Create a free account to unlock AI-powered weather intelligence for any US location.</p>
        <Link href="/login" className="inline-block bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700">
          Get Started Free
        </Link>
      </section>
    </main>
  );
}
