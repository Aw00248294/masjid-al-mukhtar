// scripts/create-admin.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@mosque.com';
  const plainPassword = 'admin123'; // You can change this later
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const admin = await prisma.member.upsert({
    where: { email },
    update: { password: hashedPassword, role: 'admin' },
    create: {
      email,
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Admin user created/updated successfully!');
  console.log('📧 Email:', admin.email);
  console.log('🔑 Password:', plainPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });