import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const gym = await prisma.gym.create({
    data: {
      name: 'CentralFit Demo',
      users: {
        create: {
          email: 'admin@centralfit.com',
          passwordHash,
          role: 'admin',
        },
      },
    },
  });

  console.log('✅ Gym y usuario de prueba creados:', gym.name);
  console.log('   Email: admin@centralfit.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());