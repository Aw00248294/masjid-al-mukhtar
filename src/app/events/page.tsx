// src/app/events/page.tsx
'use client';
import { useEffect, useState } from 'react';

const CATEGORIES = [
  { value: 'all', label: 'All Events' },
  { value: 'general', label: 'General' },
  { value: 'quran', label: 'Quran Class' },
  { value: 'jumuah', label: "Jumu'ah" },
  { value: 'community', label: 'Community' },
  { value: 'nikah', label: 'Nikah' },
  { value: 'fundraising', label: 'Fundraising' },
];

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [openFormId, setOpenFormId] = useState<string | null>(null);
  const [form, setForm] = useState({ memberName: '', memberEmail: '' });
  const [message, setMessage] = useState<{ id: string; text: string; ok: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadEvents = () => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleRegister = async (eventId: string) => {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/event-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, ...form }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ id: eventId, text: '✅ You are registered! JazakAllah Khair.', ok: true });
        setForm({ memberName: '', memberEmail: '' });
        setOpenFormId(null);
        loadEvents();
      } else {
        setMessage({ id: eventId, text: data.error || 'Registration failed.', ok: false });
      }
    } catch {
      setMessage({ id: eventId, text: 'Network error. Please try again.', ok: false });
    }
    setSubmitting(false);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const visible = filter === 'all' ? events : events.filter(e => e.category === filter);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-emerald-800 mb-2">Upcoming Events</h1>
        <p className="text-gray-600">Join us for classes, gatherings and community programs.</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === c.value
                ? 'bg-emerald-700 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-12">Loading events...</p>
      ) : visible.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500 text-lg">No events in this category yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {visible.map(event => {
            const registered = event.registrations?.length || 0;
            const spotsLeft = event.capacity - registered;
            const isFull = spotsLeft <= 0;

            return (
              <div key={event.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold capitalize mb-2">
                      {event.category}
                    </span>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>📅 {formatDate(event.date)}</span>
                      <span>📍 {event.location}</span>
                      <span className={isFull ? 'text-red-600 font-semibold' : 'text-emerald-700 font-semibold'}>
                        👥 {isFull ? 'Fully booked' : `${spotsLeft} of ${event.capacity} spots left`}
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={isFull}
                    onClick={() => { setOpenFormId(openFormId === event.id ? null : event.id); setMessage(null); }}
                    className="bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-800 transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isFull ? 'Full' : 'Register'}
                  </button>
                </div>

                {/* Registration Form */}
                {openFormId === event.id && !isFull && (
                  <div className="mt-6 pt-6 border-t border-gray-100 grid md:grid-cols-3 gap-3">
                    <input
                      type="text" placeholder="Your full name" required
                      value={form.memberName}
                      onChange={e => setForm({ ...form, memberName: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="email" placeholder="Your email" required
                      value={form.memberEmail}
                      onChange={e => setForm({ ...form, memberEmail: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => handleRegister(event.id)}
                      disabled={submitting || !form.memberName || !form.memberEmail}
                      className="bg-emerald-700 text-white font-bold py-2 rounded-lg hover:bg-emerald-800 transition disabled:opacity-50"
                    >
                      {submitting ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  </div>
                )}

                {message?.id === event.id && (
                  <p className={`mt-4 font-medium ${message.ok ? 'text-emerald-700' : 'text-red-600'}`}>
                    {message.text}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}