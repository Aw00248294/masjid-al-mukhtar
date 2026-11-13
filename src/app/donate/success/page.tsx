// src/app/donate/success/page.tsx
'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Verifying your payment...');

  useEffect(() => {
    const reference = searchParams.get('reference');
    const savedDonationData = sessionStorage.getItem('pending_donation');
    
    if (reference && savedDonationData) {
      const { memberName, memberEmail, amount, type } = JSON.parse(savedDonationData);
      
      // Save the successful donation to our database
      fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberName, memberEmail, amount, type })
      })
      .then(res => {
        if (res.ok) {
          setStatus('JazakAllah Khair! Your MoMo/Card donation has been successfully recorded.');
          sessionStorage.removeItem('pending_donation'); // Clean up
        } else {
          setStatus('Payment successful, but there was an issue recording it. Please contact the admin.');
        }
      })
      .catch(() => {
        setStatus('Payment successful, but there was an issue recording it.');
      });
    } else if (reference) {
       setStatus('Payment successful! (Reference: ' + reference + ')');
    }
  }, [searchParams]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-100 max-w-md w-full">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-emerald-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">{status}</p>
        <Link href="/" className="inline-block bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-emerald-800 transition">
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default function DonationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-gray-600">Loading success page...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}