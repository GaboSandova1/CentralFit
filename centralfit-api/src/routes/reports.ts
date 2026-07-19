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


// Lista de transacciones recientes (tabla "Resumen de Transacciones")
router.get('/transactions', async (req: AuthRequest, res) => {
  if (!req.gymId) return res.status(401).json({ error: 'No autorizado' });

  const transactions = await prisma.transaction.findMany({
    where: { subscription: { member: { gymId: req.gymId } } },
    include: { subscription: { include: { member: true, plan: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const result = transactions.map((t) => ({
    id: t.id,
    memberName: t.subscription.member.fullName,
    plan: t.subscription.plan.name,
    method: t.method,
    amountUsd: t.amountUsd,
    amountBs: t.amountBs,
    reference: t.reference,
    createdAt: t.createdAt,
  }));

  res.json(result);
});

// Ingresos por mes, últimos 6 meses en USD (gráfico "Ingresos Mensuales")
router.get('/monthly', async (req: AuthRequest, res) => {
  if (!req.gymId) return res.status(401).json({ error: 'No autorizado' });

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      createdAt: { gte: sixMonthsAgo },
      subscription: { member: { gymId: req.gymId } },
    },
    select: { amountUsd: true, createdAt: true },
  });

  const monthlyTotals: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyTotals[d.toLocaleDateString('es-VE', { month: 'short' })] = 0;
  }

  for (const t of transactions) {
    const key = t.createdAt.toLocaleDateString('es-VE', { month: 'short' });
    if (key in monthlyTotals) {
      monthlyTotals[key] = (monthlyTotals[key] ?? 0) + Number(t.amountUsd);
    }
  }

  res.json(Object.entries(monthlyTotals).map(([month, total]) => ({ month, total })));
});


export default router;