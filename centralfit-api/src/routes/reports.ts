// src/routes/reports.ts
import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

// Ruta /summary actualizada
router.get('/summary', async (req: AuthRequest, res) => {
  if (!req.gymId) return res.status(401).json({ error: 'No autorizado' });

  const { range, startDate: qStart, endDate: qEnd } = req.query;
  const dateFilter: any = {};

  if (qStart && qEnd) {
    // Rango personalizado
    const start = new Date(qStart as string);
    start.setHours(0, 0, 0, 0);
    const end = new Date(qEnd as string);
    end.setHours(23, 59, 59, 999);
    dateFilter.gte = start;
    dateFilter.lte = end;
  } else {
    // Rangos predefinidos
    let start = new Date();
    if (range === 'today') {
      start.setHours(0, 0, 0, 0);
    } else if (range === 'week') {
      start.setDate(start.getDate() - 7);
    } else if (range === 'year') {
      start = new Date(new Date().getFullYear(), 0, 1);
    } else {
      // month (default)
      start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    }
    dateFilter.gte = start;
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      createdAt: dateFilter,
      subscription: { member: { gymId: req.gymId } },
    },
  });

  const totalUsd = transactions.reduce((sum, t) => sum + (t.amountUsd ? Number(t.amountUsd) : 0), 0);
  const totalBs = transactions.reduce((sum, t) => sum + (t.amountBs ? Number(t.amountBs) : 0), 0);

  const byMethod = transactions.reduce((acc, t) => {
    acc[t.method] = (acc[t.method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const subscriptionsThisMonth = await prisma.subscription.findMany({
    where: {
      startDate: dateFilter,
      member: { gymId: req.gymId },
    },
    include: { member: { include: { subscriptions: true } } },
  });

  const newMemberships = subscriptionsThisMonth.filter((s) => {
    const allSubsForMember = s.member.subscriptions;
    const earliestSub = allSubsForMember.reduce((earliest, current) =>
      current.startDate < earliest.startDate ? current : earliest
    );
    return earliestSub.id === s.id;
  }).length;

  const renewals = subscriptionsThisMonth.length - newMemberships;

  res.json({ totalUsd, totalBs, byMethod, newMemberships, renewals });
});


// Ruta /transactions actualizada
router.get('/transactions', async (req: AuthRequest, res) => {
  if (!req.gymId) return res.status(401).json({ error: 'No autorizado' });

  const { method, planId, search, range, startDate: qStart, endDate: qEnd, limit } = req.query;

  const memberFilter: Record<string, unknown> = {};
  if (search && typeof search === 'string') {
    memberFilter.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { cedula: { contains: search } },
    ];
  }

  const subscriptionFilter: Record<string, unknown> = {
    member: { gymId: req.gymId, ...memberFilter },
  };
  if (planId && typeof planId === 'string') {
    subscriptionFilter.planId = planId;
  }

  const where: Record<string, unknown> = { subscription: subscriptionFilter };

  if (method && typeof method === 'string') {
    where.method = method;
  }

  const dateFilter: any = {};
  if (qStart && qEnd) {
    const start = new Date(qStart as string);
    start.setHours(0, 0, 0, 0);
    const end = new Date(qEnd as string);
    end.setHours(23, 59, 59, 999);
    dateFilter.gte = start;
    dateFilter.lte = end;
  } else if (range === 'today') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    dateFilter.gte = start;
  } else if (range === 'week') {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    dateFilter.gte = start;
  } else if (range === 'year') {
    const start = new Date(new Date().getFullYear(), 0, 1);
    dateFilter.gte = start;
  } else if (range === 'month' || !range) {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    dateFilter.gte = start;
  }

  where.createdAt = dateFilter;

  const transactions = await prisma.transaction.findMany({
    where,
    include: { subscription: { include: { member: true, plan: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit && typeof limit === 'string' ? parseInt(limit, 10) : 20,
  });

  const result = transactions.map((t) => ({
    id: t.id,
    memberName: t.subscription.member.fullName,
    memberCedula: t.subscription.member.cedula,
    plan: t.subscription.plan.name,
    planId: t.subscription.planId,
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
    select: { amountUsd: true, amountBs: true, exchangeRateUsed: true, createdAt: true },
  });

  const monthlyTotals: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyTotals[d.toLocaleDateString('es-VE', { month: 'short' })] = 0;
  }

  for (const t of transactions) {
    const key = t.createdAt.toLocaleDateString('es-VE', { month: 'short' });
    if (!(key in monthlyTotals)) continue;

    let usdEquivalent = 0;
    if (t.amountUsd) {
      usdEquivalent = Number(t.amountUsd);
    } else if (t.amountBs && t.exchangeRateUsed) {
      usdEquivalent = Number(t.amountBs) / Number(t.exchangeRateUsed);
    }

    monthlyTotals[key] = (monthlyTotals[key] ?? 0) + usdEquivalent;
  }

  res.json(Object.entries(monthlyTotals).map(([month, total]) => ({ month, total })));
});

export default router;