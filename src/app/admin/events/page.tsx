// src/app/admin/events/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';

const CATEGORIES = ['general', 'quran', 'jumuah', 'community', 'nikah', 'fundraising'];
const EMPTY = { title: '', description: '', date: '', location: '', capacity: '', category: 'general' };

export default function AdminEventsPage() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);

  const isAdmin = (session as any)?.user?.role === 'admin';

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
    if (status === 'unauthenticated') {
      signIn();
    } else if (status === 'authenticated' && isAdmin) {
      loadEvents();
    }
  }, [status, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/events?id=${editingId}` : '/api/events';
    const res = await fetch(url, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setEditingId(null);
      setForm(EMPTY);
      loadEvents();
    } else {
      alert('Failed to save event.');
    }
  };

  const handleEdit = (event: any) => {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().slice(0, 16),
      location: event.location,
      capacity: String(event.capacity),
      category: event.category || 'general',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event and all its registrations?')) return;
    const res = await fetch(`/api/events?id=${id}`, { method: 'DELETE' });
    if (res.ok) setEvents(prev => prev.filter(e => e.id !== id));
    else alert('Failed to delete event.');
  };

  const toggleAttendance = async (reg: any) => {
    const res = await fetch(`/api/event-registration?id=${reg.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attended: !reg.attended }),
    });
    if (res.ok) {
      setEvents(prev => prev.map(e => ({
        ...e,
        registrations: e.registrations?.map((r: any) =>
          r.id === reg.id ? { ...r, attended: !reg.attended } : r
        ),
      })));
    }
  };

  const removeRegistration = async (regId: string) => {
    if (!confirm('Remove this person from the event?')) return;
    const res = await fetch(`/api/event-registration?id=${regId}`, { method: 'DELETE' });
    if (res.ok) {
      setEvents(prev => prev.map(e => ({
        ...e,
        registrations: e.registrations?.filter((r: any) => r.id !== regId),
      })));
    }
  };

  if (status === 'loading') return <div className="p-8 text-center text-gray-500">Checking authorization...</div>;
  if (!isAdmin) return <div className="p-8 text-center text-gray-500">Redirecting to login...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">{editingId ? 'Edit Event' : 'Manage Events'}</h1>
        <Link href="/admin" className="text-emerald-700 hover:underline">← Back to Dashboard</Link>
      </div>

      {/* Create / Edit Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{editingId ? 'Update Event' : 'Add New Event'}</h2>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <input type="text" placeholder="Event Title" required value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          <input type="text" placeholder="Location" required value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          <input type="datetime-local" required value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          <input type="number" min="1" placeholder="Capacity" required value={form.capacity}
            onChange={e => setForm({ ...form, capacity: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 capitalize">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <textarea placeholder="Description" required rows={2} value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" />
          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className="flex-1 bg-emerald-700 text-white font-bold py-3 rounded-lg hover:bg-emerald-800 transition">
              {editingId ? 'Update Event' : 'Create Event'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY); }}
                className="px-6 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">All Events</h2>
        </div>

        {loading ? (
          <p className="p-6 text-center text-gray-500">Loading...</p>
        ) : events.length === 0 ? (
          <p className="p-6 text-center text-gray-500">No events created yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {events.map(event => {
              const regs = event.registrations || [];
              const attended = regs.filter((r: any) => r.attended).length;
              return (
                <div key={event.id} className="p-6">
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800">{event.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleString('en-GB')} • {event.location} •{' '}
                        <span className="capitalize">{event.category}</span>
                      </p>
                      <p className="text-sm text-emerald-700 font-semibold mt-1">
                        {regs.length}/{event.capacity} registered • {attended} attended
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                        className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm">
                        {expandedId === event.id ? 'Hide' : `Attendees (${regs.length})`}
                      </button>
                      <button onClick={() => handleEdit(event)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">Edit</button>
                      <button onClick={() => handleDelete(event.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm">Delete</button>
                    </div>
                  </div>

                  {/* Attendees */}
                  {expandedId === event.id && (
                    <div className="mt-4 bg-gray-50 rounded-xl p-4">
                      {regs.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center">No one has registered yet.</p>
                      ) : (
                        <table className="w-full text-left text-sm">
                          <thead className="text-gray-600">
                            <tr>
                              <th className="py-2">Name</th>
                              <th className="py-2">Email</th>
                              <th className="py-2">Attended</th>
                              <th className="py-2">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {regs.map((r: any) => (
                              <tr key={r.id}>
                                <td className="py-2 font-medium">{r.member?.name}</td>
                                <td className="py-2 text-gray-600">{r.member?.email}</td>
                                <td className="py-2">
                                  <button onClick={() => toggleAttendance(r)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      r.attended ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                                    }`}>
                                    {r.attended ? '✓ Present' : 'Mark Present'}
                                  </button>
                                </td>
                                <td className="py-2">
                                  <button onClick={() => removeRegistration(r.id)}
                                    className="text-red-600 hover:underline">Remove</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}