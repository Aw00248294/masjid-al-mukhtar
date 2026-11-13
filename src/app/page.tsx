// src/app/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [timings, setTimings] = useState<any>(null);
  const [date, setDate] = useState('');

  useEffect(() => {
    fetch('/api/prayer-times')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTimings(data.data);
          setDate(data.date);
        }
      });
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 bg-emerald-50 rounded-2xl border border-emerald-100">
        <h1 className="text-4xl font-bold text-emerald-900 mb-4">Assalamu Alaikum</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Welcome to Masjid Al-Mukhtar Ibn Abdallah community portal. Stay connected with prayer times, events, and community initiatives.
        </p>
      </section>

      {/* Prayer Times Widget */}
      <section className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-emerald-800 mb-6 text-center">Daily Prayer Times</h2>
        {date && <p className="text-center text-gray-500 mb-4">{date}</p>}
        
        {timings ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => (
              <div key={prayer} className="bg-emerald-50 p-4 rounded-xl text-center border border-emerald-100">
                <p className="text-sm font-semibold text-emerald-700">{prayer}</p>
                <p className="text-2xl font-bold text-emerald-900 mt-1">{timings[prayer]}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Loading prayer times...</p>
        )}
      </section>

      {/* Quick Actions */}
      <section className="grid md:grid-cols-3 gap-6">
        <Link href="/donate" className="block p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <h3 className="text-xl font-bold text-gray-800 mb-2">💝 Make a Donation</h3>
          <p className="text-gray-600">Support the mosque through Zakat, Sadaqah, or our building fund.</p>
        </Link>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-2">📅 Upcoming Events</h3>
          <p className="text-gray-600">Friday Jumu'ah at 12:30 PM. Weekly Quran class on Saturdays.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-2">📞 Contact Imam</h3>
          <p className="text-gray-600">Need spiritual counsel or a Janazah prayer? Reach out to our Imam.</p>
        </div>
      </section>
    </div>
  );
}