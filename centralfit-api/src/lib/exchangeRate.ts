import { prisma } from '../prisma';

const CACHE_HOURS = 6;

export async function getCurrentRate(): Promise<{ usdToBs: number; eurToBs: number | null }> {
  const latest = await prisma.exchangeRate.findFirst({ orderBy: { fetchedAt: 'desc' } });

  const isStale =
    !latest || Date.now() - latest.fetchedAt.getTime() > CACHE_HOURS * 60 * 60 * 1000;

  if (!isStale && latest) {
    return { usdToBs: Number(latest.usdToBs), eurToBs: latest.eurToBs ? Number(latest.eurToBs) : null };
  }

  try {
    const [usdResponse, eurResponse] = await Promise.all([
      fetch('https://ve.dolarapi.com/v1/dolares/oficial'),
      fetch('https://ve.dolarapi.com/v1/euros/oficial'),
    ]);
    const usdData = await usdResponse.json();
    const eurData = await eurResponse.json();

    const saved = await prisma.exchangeRate.create({
      data: { usdToBs: usdData.promedio, eurToBs: eurData.promedio },
    });

    return { usdToBs: Number(saved.usdToBs), eurToBs: saved.eurToBs ? Number(saved.eurToBs) : null };
  } catch {
    if (latest) {
      return { usdToBs: Number(latest.usdToBs), eurToBs: latest.eurToBs ? Number(latest.eurToBs) : null };
    }
    throw new Error('No se pudo obtener la tasa de cambio');
  }
}