import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "REALM Weather Intelligence",
  description: "US weather, severe storm and risk intelligence platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">R</div>
                <span className="font-semibold text-gray-900">REALM Weather Intelligence</span>
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition">Dashboard</Link>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition">Login</Link>
                <Link href="/" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Check Risk</Link>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
