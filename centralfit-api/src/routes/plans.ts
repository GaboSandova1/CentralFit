import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { getCurrentRate } from '../lib/exchangeRate';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res) => {
  if (!req.gymId) return res.status(401).json({ error: 'No autorizado' });

  const plans = await prisma.plan.findMany({
    where: { gymId: req.gymId },
    orderBy: { durationDays: 'asc' },
  });

  const counts = await prisma.subscription.groupBy({
    by: ['planId'],
    where: { endDate: { gte: new Date() }, plan: { gymId: req.gymId } },
    _count: true,
  });
  const countMap = new Map(counts.map((c) => [c.planId, c._count]));

  let rate: { usdToBs: number } | null = null;
  try {
    rate = await getCurrentRate();
  } catch {
    rate = null;
  }

  res.json(
    plans.map((plan) => ({
      ...plan,
      activeMemberCount: countMap.get(plan.id) ?? 0,
      priceBsEstimate: rate ? Number(plan.priceUsd) * rate.usdToBs : null,
    }))
  );
});

router.post('/', async (req: AuthRequest, res) => {
  if (!req.gymId) return res.status(401).json({ error: 'No autorizado' });
  const { name, durationDays, priceUsd, description } = req.body;

  if (!name || !durationDays || !priceUsd) {
    return res.status(400).json({ error: 'Nombre, duración y precio son requeridos' });
  }

  const plan = await prisma.plan.create({
    data: { gymId: req.gymId, name, durationDays, priceUsd, description },
  });

  res.status(201).json(plan);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  if (!req.gymId) return res.status(401).json({ error: 'No autorizado' });
  const id = req.params.id;
  if (typeof id !== 'string') return res.status(400).json({ error: 'ID inválido' });

  const existing = await prisma.plan.findFirst({ where: { id, gymId: req.gymId } });
  if (!existing) return res.status(404).json({ error: 'Plan no encontrado' });

  const { name, durationDays, priceUsd, description } = req.body;

  const plan = await prisma.plan.update({
    where: { id },
    data: { name, durationDays, priceUsd, description },
  });

  res.json(plan);
});

router.delete('/:id', async (req: AuthRequest, res) => {
  if (!req.gymId) return res.status(401).json({ error: 'No autorizado' });
  const id = req.params.id;
  if (typeof id !== 'string') return res.status(400).json({ error: 'ID inválido' });

  const existing = await prisma.plan.findFirst({ where: { id, gymId: req.gymId } });
  if (!existing) return res.status(404).json({ error: 'Plan no encontrado' });

  try {
    await prisma.plan.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2003') {
      return res.status(409).json({ error: 'No se puede eliminar este plan porque tiene miembros o historial de pagos asociado.' });
    }
    throw err;
  }
});

export default router;