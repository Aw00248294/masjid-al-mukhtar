// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { SessionProvider } from "next-auth/react";
import LogoutButton from "./components/LogoutButton";

export const metadata: Metadata = {
  title: "Masjid Al-Mukhtar Ibn Abdallah Management System",
  description: "Community, Prayer, and Management Portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 font-sans antialiased">
        <SessionProvider>
          <nav className="bg-emerald-800 text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold tracking-wide flex items-center gap-2">
                🕌 Masjid Al-Mukhtar
              </Link>
              <div className="space-x-6 text-sm font-medium flex items-center">
                <Link href="/" className="hover:text-emerald-200 transition">Home</Link>
                <Link href="/events" className="hover:text-emerald-200 transition">Events</Link>
                <Link href="/donate" className="hover:text-emerald-200 transition">Donate</Link>
                <Link href="/admin" className="hover:text-emerald-200 transition">Admin</Link>
                <LogoutButton />
              </div>
            </div>
          </nav>
          
          <main className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
            {children}
          </main>

          <footer className="bg-emerald-900 text-emerald-200 text-center py-6 mt-12">
            <p>© 2026 Masjid Al-Mukhtar Ibn Abdallah. All rights reserved.</p>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}