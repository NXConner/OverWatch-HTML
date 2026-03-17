import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Original test user
  const hashed1 = await bcrypt.hash('johndoe123', 12);
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: { email: 'john@doe.com', password: hashed1, name: 'John Doe', role: 'operator' },
  });

  // Primary Admin user
  const hashed2 = await bcrypt.hash('Starkiller1138!', 12);
  await prisma.user.upsert({
    where: { email: 'n8ter8@gmail.com' },
    update: { password: hashed2, name: 'Admin', role: 'admin' },
    create: { email: 'n8ter8@gmail.com', password: hashed2, name: 'Admin', role: 'admin' },
  });

  console.log('Seed complete');
}

main().catch(console.error).finally(() => prisma.$disconnect());
