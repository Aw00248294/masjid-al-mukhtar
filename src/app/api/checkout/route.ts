// src/app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Check if the key exists
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY is missing from .env file!");
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, type, memberName, memberEmail } = body;

    // Validate the amount
    if (!amount || isNaN(parseFloat(amount))) {
      return NextResponse.json({ error: 'Invalid donation amount' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Mosque Donation - ${type}`,
              description: `Donor: ${memberName} (${memberEmail})`,
            },
            unit_amount: Math.round(parseFloat(amount) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // ADD THESE TWO LINES to disable Stripe Tax/Managed Payments for simple donations
      automatic_tax: { enabled: false },
      managed_payments: { enabled: false },
      
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/donate/success?session_id={CHECKOUT_SESSION_ID}&name=${encodeURIComponent(memberName || '')}&email=${encodeURIComponent(memberEmail || '')}&amount=${amount}&type=${type}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/donate?canceled=true`,
      metadata: {
        memberName,
        memberEmail,
        type,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("❌ Stripe Checkout Error:", error.message);
    return NextResponse.json({ error: error.message || 'Failed to create checkout session' }, { status: 500 });
  }
}