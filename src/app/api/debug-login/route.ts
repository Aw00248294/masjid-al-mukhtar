// src/app/api/debug-login/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const email = 'admin@mosque.com';
    const testPassword = 'admin123';

    // 1. Find the user
    const user = await prisma.member.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: '❌ User not found in database' }, { status: 404 });
    }

    // 2. Check if the password is actually hashed
    const isHashed = user.password?.startsWith('$2b$10$');

    // 3. Test the password match
    const isMatch = await bcrypt.compare(testPassword, user.password || '');

    return NextResponse.json({
      email: user.email,
      role: user.role,
      passwordIsHashed: isHashed,
      passwordStartsWith: user.password?.substring(0, 15) + '...',
      bcryptMatchResult: isMatch,
      message: isMatch 
        ? '✅ PASSWORD MATCHES! Login should work. Check for browser cookie issues.' 
        : '❌ PASSWORD DOES NOT MATCH. The hash in the database is wrong or plain text.'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}