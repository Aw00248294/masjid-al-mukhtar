// src/app/api/create-admin/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const email = 'admin@mosque.com';
    const password = 'admin123';
    
    // Check if admin already exists
    const existing = await prisma.member.findUnique({ where: { email } });
    
    if (existing) {
      // Update existing user to ensure role is admin and password is correct
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.member.update({
        where: { email },
        data: { 
          password: hashedPassword,
          role: 'admin',
          name: 'Masjid Admin'
        }
      });
      return NextResponse.json({ message: '✅ Admin user updated successfully!', email });
    }
    
    // Create new admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.member.create({
      data: {
        name: 'Masjid Admin',
        email,
        password: hashedPassword,
        role: 'admin'
      }
    });
    
    return NextResponse.json({ message: '✅ Admin user created successfully!', email });
  } catch (error: any) {
    return NextResponse.json({ error: '❌ Error: ' + error.message }, { status: 500 });
  }
}