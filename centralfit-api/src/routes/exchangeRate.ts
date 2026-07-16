import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

const CACHE_HOURS = 6;

router.get('/', async (_req, res) => {
  const latest = await prisma.exchangeRate.findFirst({
    orderBy: { fetchedAt: 'desc' },
  });

  const isStale =
    !latest ||
    Date.now() - latest.fetchedAt.getTime() > CACHE_HOURS * 60 * 60 * 1000;

  if (!isStale) {
    return res.json({
      usdToBs: latest.usdToBs,
      eurToBs: latest.eurToBs,
      fetchedAt: latest.fetchedAt,
    });
  }

  try {
    const [usdResponse, eurResponse] = await Promise.all([
      fetch('https://ve.dolarapi.com/v1/dolares/oficial'),
      fetch('https://ve.dolarapi.com/v1/euros/oficial'),
    ]);

    // console.log('USD status:', usdResponse.status, usdResponse.ok);
    // console.log('EUR status:', eurResponse.status, eurResponse.ok);

    const usdData = await usdResponse.json();
    const eurData = await eurResponse.json();

    // console.log('USD data:', usdData);
    // console.log('EUR data:', eurData);

    const saved = await prisma.exchangeRate.create({
      data: { usdToBs: usdData.promedio, eurToBs: eurData.promedio },
    });

    res.json({ usdToBs: saved.usdToBs, eurToBs: saved.eurToBs, fetchedAt: saved.fetchedAt });
  } catch (err) {
    console.error('Error consultando tasas:', err);
    if (latest) {
      return res.json({
        usdToBs: latest.usdToBs,
        eurToBs: latest.eurToBs,
        fetchedAt: latest.fetchedAt,
        stale: true,
      });
    }
    res.status(503).json({ error: 'No se pudo obtener la tasa de cambio' });
  }
});

export default router;