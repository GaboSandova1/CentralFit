import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getCurrentRate } from '../lib/exchangeRate';

const router = Router();
router.use(requireAuth);

router.get('/', async (_req, res) => {
  try {
    const rate = await getCurrentRate();
    res.json(rate);
  } catch {
    res.status(503).json({ error: 'No se pudo obtener la tasa de cambio' });
  }
});

export default router;