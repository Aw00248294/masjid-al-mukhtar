// src/app/api/paystack/route.ts
import { NextResponse } from 'next/server';

// Initialize Paystack with your secret key
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
  console.error("❌ PAYSTACK_SECRET_KEY is missing from .env file!");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, type, memberName, memberEmail } = body;

    if (!amount || !memberEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Paystack expects the amount in the smallest currency unit (pesewas for GHS)
    const amountInPesewas = Math.round(parseFloat(amount) * 100);

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: memberEmail,
        amount: amountInPesewas,
        currency: 'GHS', // Explicitly set to Ghana Cedis
        metadata: {
          custom_fields: [
            { display_name: "Donor Name", variable_name: "donor_name", value: memberName },
            { display_name: "Donation Type", variable_name: "donation_type", value: type }
          ]
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/donate/success`,
      }),
    });

    const data = await response.json();

    if (data.status) {
      return NextResponse.json({ url: data.data.authorization_url });
    } else {
      console.error("Paystack initialization failed:", data.message);
      return NextResponse.json({ error: data.message || 'Failed to initialize payment' }, { status: 500 });
    }
  } catch (error: any) {
    console.error("❌ Paystack API Error:", error.message);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}