// src/app/api/donations/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET: Fetch recent donations for the admin dashboard
export async function GET() {
  try {
    const donations = await prisma.donation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { member: true }
    });
    return NextResponse.json(donations);
  } catch (error) {
    console.error("GET donations error:", error);
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}

// POST: Create a new donation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, type, memberName, memberEmail } = body;

    // Validate input
    if (!amount || !memberEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use upsert to safely find OR create the member in one atomic step
    const member = await prisma.member.upsert({
      where: { email: memberEmail.toLowerCase() },
      update: { 
        name: memberName
      },
      create: { 
        name: memberName, 
        email: memberEmail.toLowerCase(), 
        role: 'member' 
      }
    });

    const donation = await prisma.donation.create({
      data: {
        amount: parseFloat(amount),
        type: type || 'Sadaqah',
        memberId: member.id,
        status: 'approved'
      }
    });

    return NextResponse.json(donation, { status: 201 });
  } catch (error: any) {
    console.error("❌ POST donation error:", error.message);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// PUT: Update donation status (Admin only)
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const body = await request.json();
    const { status } = body;

    const updated = await prisma.donation.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT donation error:", error);
    return NextResponse.json({ error: 'Failed to update donation' }, { status: 500 });
  }
}

// DELETE: Delete a donation (Admin only)
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await prisma.donation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE donation error:", error);
    return NextResponse.json({ error: 'Failed to delete donation' }, { status: 500 });
  }
}