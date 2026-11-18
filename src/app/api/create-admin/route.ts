// src/app/api/create-admin/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const email = 'admin@mosque.com';
    const password = 'admin123';
    
    const existing = await prisma.member.findUnique({ where: { email } });
    
    if (existing) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.member.update({
        where: { email },
        data: { password: hashedPassword, role: 'admin', name: 'Masjid Admin' }
      });
      return NextResponse.json({ message: '✅ Admin user updated successfully!', email });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.member.create({
      data: { name: 'Masjid Admin', email, password: hashedPassword, role: 'admin' }
    });
    
    return NextResponse.json({ message: '✅ Admin user created successfully!', email });
  } catch (error: any) {
    // This will show us the EXACT reason it failed
    return NextResponse.json({ 
      error: '❌ Failed to create admin', 
      details: error.message,
      code: error.code || 'UNKNOWN'
    }, { status: 500 });
  }
}