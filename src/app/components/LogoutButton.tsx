// src/app/components/LogoutButton.tsx
'use client';
import { useSession, signOut } from "next-auth/react";

export default function LogoutButton() {
  const { data: session, status } = useSession();

  if (status === "loading" || !session) {
    return null;
  }

  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="bg-emerald-700 hover:bg-emerald-900 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
    >
      Logout
    </button>
  );
}