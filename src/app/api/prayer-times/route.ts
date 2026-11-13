// src/app/api/prayer-times/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetching current date and prayer times (using London as default, you can change city/country later)
    const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=London&country=UK&method=2');
    const data = await res.json();
    
    return NextResponse.json({
      success: true,
      data: data.data.timings,
      date: data.data.date.readable
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch prayer times' }, { status: 500 });
  }
}