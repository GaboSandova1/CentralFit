import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { requireSuperAdmin, SuperAdminRequest } from '../middleware/superAdminAuth';

const router = Router();

// Login del super admin (sin requireSuperAdmin, obviamente, es el que lo genera)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const admin = await prisma.superAdmin.findUnique({ where: { email } });
  if (!admin) return res.status(401).json({ error: 'Credenciales inválidas' });

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign(
    { adminId: admin.id },
    process.env.SUPER_ADMIN_JWT_SECRET as string,
    { expiresIn: '1d' }
  );

  res.json({ token });
});

// A partir de aquí, todo requiere el token de super admin
router.use(requireSuperAdmin);

// Lista todos los gimnasios con conteos
router.get('/gyms', async (_req: SuperAdminRequest, res) => {
  const gyms = await prisma.gym.findMany({
    include: {
      _count: { select: { users: true, members: true } },
      users: {
        where: { role: 'owner' },
        take: 1,
        select: { fullName: true, email: true, phone: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const result = gyms.map((gym) => ({
    id: gym.id,
    name: gym.name,
    address: gym.address,
    phone: gym.phone,
    status: gym.status,
    createdAt: gym.createdAt,
    memberCount: gym._count.members,
    userCount: gym._count.users,
    owner: gym.users[0] ?? null,
  }));

  res.json(result);
});

// Suspende o reactiva un gimnasio
router.patch('/gyms/:id/status', async (req: SuperAdminRequest, res) => {
  const id = req.params.id;
  if (typeof id !== 'string') return res.status(400).json({ error: 'ID inválido' });

  const { status } = req.body;
  if (!['active', 'suspended', 'trial'].includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  const gym = await prisma.gym.update({
    where: { id },
    data: { status },
  });

  res.json(gym);
});

// Estadísticas globales de la plataforma
router.get('/stats', async (_req: SuperAdminRequest, res) => {
  const [totalGyms, activeGyms, trialGyms, suspendedGyms, totalMembers] = await Promise.all([
    prisma.gym.count(),
    prisma.gym.count({ where: { status: 'active' } }),
    prisma.gym.count({ where: { status: 'trial' } }),
    prisma.gym.count({ where: { status: 'suspended' } }),
    prisma.member.count(),
  ]);

  res.json({ totalGyms, activeGyms, trialGyms, suspendedGyms, totalMembers });
});

export default router;