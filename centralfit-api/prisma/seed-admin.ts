import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'sandovalgabo24@gmail.com'; // 👈 cambia esto por tu correo real
  const password = 'Money99'; // 👈 y esto también

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.superAdmin.create({
    data: { email, passwordHash },
  });

  console.log('✅ SuperAdmin creado:', admin.email);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());