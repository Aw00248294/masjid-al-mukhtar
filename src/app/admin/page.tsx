// src/app/admin/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useSession, signIn } from "next-auth/react";
import Link from 'next/link';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn();
    } else if (status === "authenticated" && (session as any)?.user?.role === 'admin') {
      fetch('/api/donations')
        .then(res => res.json())
        .then(data => {
          setDonations(data);
          setLoading(false);
        });
    }
  }, [status, session]);

  if (status === "loading") {
    return <div className="p-8 text-center text-gray-500">Checking authorization...</div>;
  }

  if (!session || (session as any)?.user?.role !== 'admin') {
    return <div className="p-8 text-center text-gray-500">Redirecting to login...</div>;
  }

  // FIX 1: Only sum donations that are actually 'approved'
  const totalApprovedAmount = donations
    .filter((d: any) => d.status === 'approved')
    .reduce((sum: number, d: any) => sum + d.amount, 0);
  
  const byType = donations.reduce((acc: any, d: any) => {
    if (d.status === 'approved') {
      acc[d.type] = (acc[d.type] || 0) + d.amount;
    }
    return acc;
  }, {});
  
  const pendingCount = donations.filter((d: any) => d.status === 'pending').length;
  const uniqueDonors = new Set(donations.map((d: any) => d.member?.email)).size;

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/donations?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      // Update state instantly
      setDonations(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    }
  };

  // FIX 2: Use functional state update (prev => ...) to guarantee instant UI refresh
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this donation record?')) return;
    
    try {
      const res = await fetch(`/api/donations?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDonations(prev => prev.filter(d => d.id !== id));
      } else {
        alert('Failed to delete donation.');
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert('An error occurred while deleting.');
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Donor Name', 'Email', 'Type', 'Amount (GHS)', 'Status'];
    const rows = donations.map((d: any) => [
      new Date(d.createdAt).toLocaleDateString(),
      d.member?.name || 'Anonymous',
      d.member?.email || '',
      d.type,
      d.amount.toFixed(2),
      d.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mosque-donations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">Logged in as: {session.user?.email}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/members" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
            👥 Members
          </Link>
          <Link href="/admin/events" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm font-medium">
            📅 Events
          </Link>
          <button onClick={exportToCSV} className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium">
            📥 Export CSV
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Approved Donations</p>
          <p className="text-3xl font-bold text-emerald-700 mt-2">GH₵ {totalApprovedAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="text-3xl font-bold text-blue-700 mt-2">{donations.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Pending Review</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Unique Donors</p>
          <p className="text-3xl font-bold text-orange-700 mt-2">{uniqueDonors}</p>
        </div>
      </div>

      {/* Recent Donations Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">All Donations</h2>
        </div>
        
        {loading ? (
          <p className="p-6 text-center text-gray-500">Loading data...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="px-6 py-3">Member</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donations.length > 0 ? (
                  donations.map((d: any) => (
                    <tr key={d.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium">{d.member?.name || 'Anonymous'}</td>
                      <td className="px-6 py-4 text-gray-600">{d.type}</td>
                      <td className="px-6 py-4 font-bold text-emerald-700">GH₵ {d.amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                          d.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          d.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          {d.status !== 'approved' && (
                            <button onClick={() => handleUpdateStatus(d.id, 'approved')} className="text-emerald-600 hover:text-emerald-800 text-sm font-medium hover:underline">
                              Approve
                            </button>
                          )}
                          {d.status !== 'rejected' && (
                            <button onClick={() => handleUpdateStatus(d.id, 'rejected')} className="text-yellow-600 hover:text-yellow-800 text-sm font-medium hover:underline">
                              Reject
                            </button>
                          )}
                          <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No donations recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}