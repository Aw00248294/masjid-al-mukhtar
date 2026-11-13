// src/app/donate/page.tsx
'use client';

import { useState } from 'react';

export default function DonatePage() {
  const [formData, setFormData] = useState({
    memberName: '',
    memberEmail: '',
    amount: '',
    type: 'Sadaqah'
  });
  const [status, setStatus] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Redirecting to secure MoMo/Card payment...');
    
    try {
      const res = await fetch('/api/paystack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok && data.url) {
        // Save donation details temporarily so the success page can record it
        sessionStorage.setItem('pending_donation', JSON.stringify(formData));
        
        // Redirect to Paystack
        window.location.href = data.url;
      } else {
        setStatus(`Error: ${data.error || 'Failed to start payment'}`);
      }
    } catch (error) {
      console.error("Network Error:", error);
      setStatus('Network error. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-emerald-800 mb-2">Donate to the Masjid</h1>
      <p className="text-gray-600 mb-8 italic">
        "The example of those who spend their wealth in the way of Allah is like a seed of grain which grows seven ears." (Quran 2:261)
      </p>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              required 
              value={formData.memberName} 
              onChange={e => setFormData({...formData, memberName: e.target.value})} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required 
              value={formData.memberEmail} 
              onChange={e => setFormData({...formData, memberEmail: e.target.value})} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Donation Type</label>
          <select 
            value={formData.type} 
            onChange={e => setFormData({...formData, type: e.target.value})} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Sadaqah">Sadaqah (General Charity)</option>
            <option value="Zakat">Zakat</option>
            <option value="BuildingFund">Building Fund</option>
          </select>
        </div>

        <div>
<label className="block text-sm font-medium text-gray-700 mb-1">Amount (GHS)</label>
          <input 
            type="number" 
            min="1" 
            step="0.01" 
            required 
            value={formData.amount} 
            onChange={e => setFormData({...formData, amount: e.target.value})} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" 
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-emerald-700 text-white font-bold py-3 rounded-lg hover:bg-emerald-800 transition shadow-md"
        >
          Submit Donation
        </button>
        
        {status && (
          <p className={`text-center font-medium mt-4 ${status.includes('JazakAllah') ? 'text-emerald-700' : 'text-red-600'}`}>
            {status}
          </p>
        )}
      </form>
    </div>
  );
}