import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth';
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

  if (now > graceCutoff) return 'vencido';
  if (now > endDate) return 'en_gracia';
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
      initialWeight: member.initialWeight,
      currentWeight: member.currentWeight,
      birthDate: member.birthDate,
      plan: latestSub?.plan.name ?? null,
      planId: latestSub?.planId ?? null,
      startDate: latestSub?.startDate ?? null,
      endDate: latestSub?.endDate ?? null,
      status: getStatus(latestSub?.endDate ?? null, graceDays),
    };
  });

  res.json(result);
});

// Crear un miembro
router.post('/', async (req: AuthRequest, res) => {
  if (!req.gymId) return res.status(401).json({ error: 'No autorizado' });
  const { fullName, cedula, phone, photoUrl, planId, startDate, method, reference } = req.body;

  if (!fullName || !cedula) {
    return res.status(400).json({ error: 'Nombre y cédula son requeridos' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const newMember = await tx.member.create({
        data: { gymId: req.gymId, fullName, cedula, phone, photoUrl },
      });

      let subscription = null;
      let transaction = null;

      if (planId) {
        const plan = await tx.plan.findFirst({ where: { id: planId, gymId: req.gymId } });

        if (plan) {
          const start = startDate ? new Date(startDate) : new Date();
          const end = new Date(start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

          let amountUsd: number | null = null;
          let amountBs: number | null = null;
          let exchangeRateUsed: number | null = null;

          if (method) {
            const settings = await tx.gymSettings.findUnique({ where: { gymId: req.gymId } });
            const rateType = settings?.rateType ?? 'BCV';
            const rate = await getCurrentRate();
            const activeRate = rateType === 'Euro' && rate.eurToBs ? rate.eurToBs : rate.usdToBs;

            const isBs = method !== 'Efectivo' && method !== 'Zelle' && method !== 'Binance';
            const targetUsd = isBs ? (plan.priceUsdBs ? Number(plan.priceUsdBs) : Number(plan.priceUsd)) : Number(plan.priceUsd);

            if (isBs) {
              amountBs = targetUsd * activeRate;
              exchangeRateUsed = activeRate;
            } else {
              amountUsd = targetUsd;
            }
          }

          const sub = await tx.subscription.create({
            data: { memberId: newMember.id, planId: plan.id, startDate: start, endDate: end },
          });

          if (method) {
            transaction = await tx.transaction.create({
              data: { subscriptionId: sub.id, amountUsd, amountBs, exchangeRateUsed, method, reference },
            });
          }

          subscription = sub;
        }
      }

      return { member: newMember, subscription, transaction };
    });

    res.status(201).json(result);

  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe un miembro con esta cédula en tu gimnasio.' });
    }
    console.error('Error al crear miembro:', err);
    res.status(500).json({ error: 'Ocurrió un error interno al registrar el miembro.' });
  }
});

// Buscar por cédula
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
    include: {
      subscriptions: { orderBy: { endDate: 'desc' }, take: 1, include: { plan: true } },
    },
    take: 10,
  });

  const result = members.map((member) => {
    const latestSub = member.subscriptions[0];
    return {
      id: member.id,
      fullName: member.fullName,
      cedula: member.cedula,
      initialWeight: member.initialWeight,
      currentWeight: member.currentWeight,
      birthDate: member.birthDate,
      plan: latestSub?.plan.name ?? null,
      planId: latestSub?.planId ?? null,
      startDate: latestSub?.startDate ?? null,
      endDate: latestSub?.endDate ?? null,
    };
  });

  res.json(result);
});

// Renovar (Con MEJORA 5: Idempotencia)
router.post('/:id/renew', async (req: AuthRequest, res) => {
  if (!req.gymId) return res.status(401).json({ error: 'No autorizado' });

  const memberId = req.params.id;
  if (typeof memberId !== 'string') return res.status(400).json({ error: 'ID inválido' });

  const { planId, startDate, payments } = req.body;

  if (!planId || !Array.isArray(payments) || payments.length === 0) {
    return res.status(400).json({ error: 'Plan y al menos un método de pago son requeridos' });
  }

  const missingReference = payments.some((p: any) => p.method !== 'Efectivo' && !p.reference?.trim());
  if (missingReference) {
    return res.status(400).json({ error: 'Todos los métodos de pago (excepto Efectivo) requieren un número de referencia.' });
  }

  const member = await prisma.member.findFirst({ where: { id: memberId, gymId: req.gymId } });
  if (!member) return res.status(404).json({ error: 'Miembro no encontrado' });

  const plan = await prisma.plan.findFirst({ where: { id: planId, gymId: req.gymId } });
  if (!plan) return res.status(404).json({ error: 'Plan no encontrado' });

  const start = startDate ? new Date(startDate) : new Date();

  // MEJORA 5: Verificar si ya existe una suscripción idéntica (mismo plan, misma fecha)
  // para evitar dobles cobros si el recepcionista hace doble clic por accidente.
  const existingSub = await prisma.subscription.findFirst({
    where: {
      memberId: member.id,
      planId: plan.id,
      startDate: start
    }
  });

  if (existingSub) {
    return res.status(409).json({ error: 'Ya se registró una renovación con este plan y fecha de inicio.' });
  }

  const settings = await prisma.gymSettings.findUnique({ where: { gymId: req.gymId } });
  const rateType = settings?.rateType ?? 'BCV';
  
  let rate;
  try {
    rate = await getCurrentRate();
  } catch {
    return res.status(503).json({ error: 'No se pudo obtener la tasa de cambio para procesar el pago' });
  }
  const activeRate = rateType === 'Euro' && rate.eurToBs ? rate.eurToBs : rate.usdToBs;

  const isUsdMethod = (method: string) => method === 'Efectivo' || method === 'Zelle' || method === 'Binance';

  const hasBs = payments.some(p => !isUsdMethod(p.method));
  const planPriceUsd = hasBs 
    ? (plan.priceUsdBs ? Number(plan.priceUsdBs) : Number(plan.priceUsd)) 
    : Number(plan.priceUsd);

  const resolvedPayments = payments.map((p: { method: string; amount?: number; reference?: string }) => {
    const isBs = !isUsdMethod(p.method);
    let amount = p.amount;
    if (amount === undefined) {
      amount = payments.length === 1 ? (isBs ? planPriceUsd * activeRate : planPriceUsd) : 0;
    }
    return { method: p.method, reference: p.reference, isBs, amount };
  });

  const totalUsdEquivalent = resolvedPayments.reduce((sum, p) => {
    const usdEq = p.isBs ? Math.round((p.amount / activeRate) * 1000) / 1000 : p.amount;
    return sum + usdEq;
  }, 0);

  if (Math.abs(totalUsdEquivalent - planPriceUsd) > 0.001) {
    return res.status(400).json({
      error: `El monto total abonado no coincide con el precio del plan. Verifica los decimales en los pagos divididos.`,
    });
  }

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
            exchangeRateUsed: p.isBs ? activeRate : null,
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

  const { fullName, cedula, phone, photoUrl, initialWeight, currentWeight, birthDate } = req.body;

  try {
    const member = await prisma.member.update({
      where: { id },
      data: { fullName, cedula, phone, photoUrl, initialWeight, currentWeight, birthDate: birthDate ? new Date(birthDate) : null },
    });
    res.json(member);
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe otro miembro con esta cédula en tu gimnasio.' });
    }
    throw err;
  }
});

// Eliminar un miembro (MEJORA 9: Solo el 'owner' puede borrar)
router.delete('/:id', requireRole('owner'), async (req: AuthRequest, res) => {
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