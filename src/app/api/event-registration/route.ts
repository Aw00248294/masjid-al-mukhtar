// src/app/api/event-registration/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Register for an event (Open to public/guests)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📩 Registration request received:", body);
    
    const { eventId, memberName, memberEmail } = body;

    if (!eventId || !memberName || !memberEmail) {
      return NextResponse.json({ error: 'Missing name, email, or event ID' }, { status: 400 });
    }

    // 1. Find or create member safely
    const member = await prisma.member.upsert({
      where: { email: memberEmail.toLowerCase() },
      update: { name: memberName },
      create: {
        name: memberName,
        email: memberEmail.toLowerCase(),
        role: 'member'
      }
    });

    // 2. Check if event exists and get current registrations
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { registrations: true }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.registrations.length >= event.capacity) {
      return NextResponse.json({ error: 'Event is fully booked' }, { status: 400 });
    }

    // 3. Check if this person is already registered
    const existing = await prisma.eventRegistration.findUnique({
      where: {
        eventId_memberId: {
          eventId,
          memberId: member.id
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'You are already registered for this event' }, { status: 400 });
    }

    // 4. Create the registration
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        memberId: member.id
      }
    });

    console.log("✅ Registration successful for:", memberEmail);
    return NextResponse.json(registration, { status: 201 });
    
  } catch (error: any) {
    console.error("❌ POST registration error:", error.message);
    return NextResponse.json({ error: error.message || 'Failed to register' }, { status: 500 });
  }
}

// PUT: Mark attendance (Admin only)
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const body = await request.json();
    const { attended } = body;

    const updated = await prisma.eventRegistration.update({
      where: { id },
      data: { attended }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("❌ PUT registration error:", error.message);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}

// DELETE: Cancel registration
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await prisma.eventRegistration.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ DELETE registration error:", error.message);
    return NextResponse.json({ error: 'Failed to cancel registration' }, { status: 500 });
  }
}