import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Leemos las credenciales desde el archivo .env
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ Debes definir SUPER_ADMIN_EMAIL y SUPER_ADMIN_PASSWORD en tu archivo .env');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Usamos upsert: si ya existe, ACTUALIZA la contraseña; si no existe, lo crea.
  const admin = await prisma.superAdmin.upsert({
    where: { email },
    update: { passwordHash }, // <--- Aquí le decimos que actualice la contraseña
    create: { email, passwordHash },
  });

  console.log('✅ SuperAdmin creado/verificado:', admin.email);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());