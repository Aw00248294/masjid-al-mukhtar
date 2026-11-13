// src/app/admin/members/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useSession, signIn } from "next-auth/react";
import Link from 'next/link';

export default function AdminMembersPage() {
  const { data: session, status } = useSession();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Move useEffect to the top, before any conditional returns
  useEffect(() => {
    if (status === "unauthenticated") {
      signIn();
    } else if (status === "authenticated" && (session as any)?.user?.role === 'admin') {
      fetch('/api/members')
        .then(res => res.json())
        .then(data => {
          setMembers(data);
          setLoading(false);
        });
    }
  }, [status, session]);

  // Show loading state while checking auth
  if (status === "loading") {
    return <div className="p-8 text-center text-gray-500">Checking authorization...</div>;
  }

  // Show redirecting state if not admin
  if (!session || (session as any)?.user?.role !== 'admin') {
    return <div className="p-8 text-center text-gray-500">Redirecting to login...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Members Directory</h1>
        <Link href="/admin" className="text-emerald-700 hover:underline">← Back to Dashboard</Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="p-6 text-center text-gray-500">Loading members...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Total Donations</th>
                  <th className="px-6 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.length > 0 ? (
                  members.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium">{m.name}</td>
                      <td className="px-6 py-4 text-gray-600">{m.email}</td>
                      <td className="px-6 py-4 text-gray-600">{m.phone || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold capitalize">
                          {m.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-700">
                        GH₵ {m._count?.donations || 0} donations
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No members yet.
                    </td>
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