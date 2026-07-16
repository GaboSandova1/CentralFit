import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res) => {
  if (!req.gymId) return res.status(401).json({ error: 'No autorizado' });

  const settings = await prisma.gymSettings.upsert({
    where: { gymId: req.gymId },
    create: { gymId: req.gymId },
    update: {},
  });

  res.json(settings);
});

router.patch('/', async (req: AuthRequest, res) => {
  if (!req.gymId) return res.status(401).json({ error: 'No autorizado' });

  const { graceDays } = req.body;
  if (typeof graceDays !== 'number' || graceDays < 0 || graceDays > 30) {
    return res.status(400).json({ error: 'graceDays debe ser un número entre 0 y 30' });
  }

  const settings = await prisma.gymSettings.upsert({
    where: { gymId: req.gymId },
    create: { gymId: req.gymId, graceDays },
    update: { graceDays },
  });

  res.json(settings);
});

export default router;