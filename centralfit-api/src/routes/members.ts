import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { getCurrentRate } from '../lib/exchangeRate';

const router = Router();

router.use(requireAuth);

function getStatus(
  endDate: Date | null,
  graceDays: number
): 'sin_plan' | 'activo' | 'por_vencer' | 'en_gracia' | 'vencido' {
  if (!endDate) return 'sin_plan';

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const graceCutoff = new Date(endDate.getTime() + graceDays * 24 * 60 * 60 * 1000);

  if (now > graceCutoff) return 'vencido';        // superó los días de gracia: no puede pasar
  if (now > endDate) return 'en_gracia';           // venció, pero todavía dentro de gracia: sí puede pasar
  if (endDate <= sevenDaysFromNow) return 'por_vencer';
  return 'activo';
}

// Listar miembros con su estado calculado
router.get('/', async (req: AuthRequest, res) => {
  if (!req.gymId) return res.status(401).json({ error: 'No autorizado' });

  const settings = await prisma.gymSettings.findUnique({ where: { gymId: req.gymId } });
  const graceDays = settings?.graceDays ?? 3;

  const members = await prisma.member.findMany({
    where: { gymId: req.gymId },
    include: {
      subscriptions: { orderBy: { endDate: 'desc' }, take: 1, include: { plan: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const result = members.map((member) => {
    const latestSub = member.subscriptions[0];
    return {
      id: member.id,
      fullName: member.fullName,
      cedula: member.cedula,
      phone: member.phone,
      photoUrl: member.photoUrl,
      plan: latestSub?.plan.name ?? null,
      endDate: latestSub?.endDate ?? null,
      status: getStatus(latestSub?.endDate ?? null, graceDays),
    };
  });

  res.json(result);
});

// Crear un miembro (opcionalmente con su primera suscripción + pago)
router.post('/', async (req: AuthRequest, res) => {
  if (!req.gymId) return res.status(401).json({ error: 'No autorizado' });
  const { fullName, cedula, phone, photoUrl, planId, startDate, method, reference } = req.body;

  if (!fullName || !cedula) {
    return res.status(400).json({ error: 'Nombre y cédula son requeridos' });
  }

  let member;
  try {
    member = await prisma.member.create({
      data: { gymId: req.gymId, fullName, cedula, phone, photoUrl },
    });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe un miembro con esta cédula en tu gimnasio.' });
    }
    throw err;
  }

  let subscription = null;
  let transaction = null;

  if (planId) {
    const plan = await prisma.plan.findFirst({ where: { id: planId, gymId: req.gymId } });

    if (plan) {
      const start = startDate ? new Date(startDate) : new Date();
      const end = new Date(start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

      let amountUsd: number | null = null;
      let amountBs: number | null = null;
      let exchangeRateUsed: number | null = null;

      if (method) {
        if (method === 'Efectivo') {
          amountUsd = Number(plan.priceUsd);
        } else {
          const rate = await getCurrentRate();
          amountBs = Number(plan.priceUsd) * rate.usdToBs;
          exchangeRateUsed = rate.usdToBs;
        }
      }

      const result = await prisma.$transaction(async (tx) => {
        const sub = await tx.subscription.create({
          data: { memberId: member.id, planId: plan.id, startDate: start, endDate: end },
        });

        const tr = method
          ? await tx.transaction.create({
              data: { subscriptionId: sub.id, amountUsd, amountBs, exchangeRateUsed, method, reference },
            })
          : null;

        return { sub, tr };
      });

      subscription = result.sub;
      transaction = result.tr;
    }
  }

  res.status(201).json({ member, subscription, transaction });
});

// Buscar por cédula (para tu campo de búsqueda del front)
router.get('/search', async (req: AuthRequest, res) => {
  if (!req.gymId) return res.status(401).json({ error: 'No autorizado' });

  const q = typeof req.query.q === 'string' ? req.query.q : '';

  const members = await prisma.member.findMany({
    where: {
      gymId: req.gymId,
      OR: [
        { fullName: { contains: q, mode: 'insensitive' } },
        { cedula: { contains: q } },
      ],
    },
    take: 10,
  });

  res.json(members);
});


// Renovar/registrar el pago de un miembro (crea Subscription + Transaction juntos)
router.post('/:id/renew', async (req: AuthRequest, res) => {
  if (!req.gymId) return res.status(401).json({ error: 'No autorizado' });

  const memberId = req.params.id;
  if (typeof memberId !== 'string') return res.status(400).json({ error: 'ID inválido' });

  const { planId, startDate, payments } = req.body;
  // payments: [{ method: string, amount?: number, reference?: string }]
  // "amount" es opcional: si se omite y hay un solo pago, se asume el precio completo del plan.
  // Efectivo => amount en USD. Cualquier otro método => amount en Bs.

  if (!planId || !Array.isArray(payments) || payments.length === 0) {
    return res.status(400).json({ error: 'Plan y al menos un método de pago son requeridos' });
  }

  const member = await prisma.member.findFirst({ where: { id: memberId, gymId: req.gymId } });
  if (!member) return res.status(404).json({ error: 'Miembro no encontrado' });

  const plan = await prisma.plan.findFirst({ where: { id: planId, gymId: req.gymId } });
  if (!plan) return res.status(404).json({ error: 'Plan no encontrado' });

  let rate;
  try {
    rate = await getCurrentRate();
  } catch {
    return res.status(503).json({ error: 'No se pudo obtener la tasa de cambio para procesar el pago' });
  }

  const planPriceUsd = Number(plan.priceUsd);

  const resolvedPayments = payments.map((p: { method: string; amount?: number; reference?: string }) => {
    const isBs = p.method !== 'Efectivo';
    let amount = p.amount;
    if (amount === undefined) {
      amount = payments.length === 1 ? (isBs ? planPriceUsd * rate.usdToBs : planPriceUsd) : 0;
    }
    return { method: p.method, reference: p.reference, isBs, amount };
  });

  const totalUsdEquivalent = resolvedPayments.reduce(
    (sum, p) => sum + (p.isBs ? p.amount / rate.usdToBs : p.amount),
    0
  );

  if (Math.abs(totalUsdEquivalent - planPriceUsd) > 0.05) {
    return res.status(400).json({
      error: `La suma de los pagos ($${totalUsdEquivalent.toFixed(2)} equivalentes) no coincide con el precio del plan ($${planPriceUsd.toFixed(2)})`,
    });
  }

  const start = startDate ? new Date(startDate) : new Date();
  const end = new Date(start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

  const result = await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.create({
      data: { memberId: member.id, planId: plan.id, startDate: start, endDate: end },
    });

    const transactions = await Promise.all(
      resolvedPayments.map((p) =>
        tx.transaction.create({
          data: {
            subscriptionId: subscription.id,
            amountUsd: p.isBs ? null : p.amount,
            amountBs: p.isBs ? p.amount : null,
            exchangeRateUsed: p.isBs ? rate.usdToBs : null,
            method: p.method,
            reference: p.reference,
          },
        })
      )
    );

    return { subscription, transactions };
  });

  res.status(201).json(result);
});

// Editar un miembro
router.patch('/:id', async (req: AuthRequest, res) => {
  if (!req.gymId) return res.status(401).json({ error: 'No autorizado' });

  const id = req.params.id;
  if (typeof id !== 'string') return res.status(400).json({ error: 'ID inválido' });

  const existing = await prisma.member.findFirst({
    where: { id, gymId: req.gymId },
  });
  if (!existing) return res.status(404).json({ error: 'Miembro no encontrado' });

  const { fullName, cedula, phone, photoUrl } = req.body;

  try {
    const member = await prisma.member.update({
      where: { id },
      data: { fullName, cedula, phone, photoUrl },
    });
    res.json(member);
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe otro miembro con esta cédula en tu gimnasio.' });
    }
    throw err;
  }

});

// Eliminar un miembro
router.delete('/:id', async (req: AuthRequest, res) => {
  if (!req.gymId) return res.status(401).json({ error: 'No autorizado' });

  const id = req.params.id;
  if (typeof id !== 'string') return res.status(400).json({ error: 'ID inválido' });

  const existing = await prisma.member.findFirst({
    where: { id, gymId: req.gymId },
  });
  if (!existing) return res.status(404).json({ error: 'Miembro no encontrado' });

  await prisma.member.delete({ where: { id } });
  res.status(204).send();
});

export default router;