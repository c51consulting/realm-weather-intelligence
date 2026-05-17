import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./Navbar";

export const metadata: Metadata = {
  title: "REALM Weather Intelligence",
  description: "US weather, severe storm and risk intelligence platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        {children}
      {/* RR-WIDGET-EMBED-v1 — Robbie's REALM cross-portal embed */}
      <section aria-label="Latest from Robbie's REALM" style={{borderTop:"1px solid rgba(0,0,0,0.06)",background:"#f7f8f5"}}>
        <div id="robbies-realm-embed" data-count="3" data-theme="light" data-utm={typeof window!=="undefined"?window.location.hostname:"portal"}></div>
        <script async src="https://realm-widgets.vercel.app/robbies-realm-widget.js" />
      </section>

      </body>
    </html>
  );
}
