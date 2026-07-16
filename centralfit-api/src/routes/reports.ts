// src/routes/reports.ts
import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/summary', async (req: AuthRequest, res) => {
  if (!req.gymId) return res.status(401).json({ error: 'No autorizado' });

  console.log('1. Empezando consulta de reportes para gymId:', req.gymId);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      createdAt: { gte: startOfMonth },
      subscription: { member: { gymId: req.gymId } },
    },
  });

  console.log('2. Transacciones encontradas:', transactions.length);

  const totalUsd = transactions.reduce((sum, t) => sum + Number(t.amountUsd), 0);
  const totalBs = transactions.reduce((sum, t) => sum + Number(t.amountBs), 0);
  const byMethod = transactions.reduce((acc, t) => {
    acc[t.method] = (acc[t.method] || 0) + Number(t.amountUsd);
    return acc;
  }, {} as Record<string, number>);

  console.log('3. Totales calculados');

  const subscriptionsThisMonth = await prisma.subscription.findMany({
    where: {
      startDate: { gte: startOfMonth },
      member: { gymId: req.gymId },
    },
    include: { member: { include: { subscriptions: true } } },
  });

  console.log('4. Suscripciones del mes encontradas:', subscriptionsThisMonth.length);

  const newMemberships = subscriptionsThisMonth.filter((s) => {
    const allSubsForMember = s.member.subscriptions;
    const earliestSub = allSubsForMember.reduce((earliest, current) =>
      current.startDate < earliest.startDate ? current : earliest
    );
    return earliestSub.id === s.id;
  }).length;

  console.log('5. Nuevas membresías calculadas:', newMemberships);

  const renewals = subscriptionsThisMonth.length - newMemberships;

  res.json({ totalUsd, totalBs, byMethod, newMemberships, renewals });
});

export default router;