import { prisma } from '../prisma';

const CACHE_HOURS = 6;

export async function getCurrentRate(): Promise<{ usdToBs: number; eurToBs: number | null }> {
  const latest = await prisma.exchangeRate.findFirst({ orderBy: { fetchedAt: 'desc' } });

  const isStale =
    !latest || Date.now() - latest.fetchedAt.getTime() > CACHE_HOURS * 60 * 60 * 1000;

  // Si la tasa actual sigue vigente, la usamos
  if (!isStale && latest) {
    return { usdToBs: Number(latest.usdToBs), eurToBs: latest.eurToBs ? Number(latest.eurToBs) : null };
  }

  try {
    const [usdResponse, eurResponse] = await Promise.all([
      fetch('https://ve.dolarapi.com/v1/dolares/oficial'),
      fetch('https://ve.dolarapi.com/v1/euros/oficial'),
    ]);

    // NUEVO: Verificar que las respuestas sean HTTP 200
    if (!usdResponse.ok || !eurResponse.ok) throw new Error("API del BCV no responde OK");

    const usdData = await usdResponse.json();
    const eurData = await eurResponse.json();

    // NUEVO: Verificar que los datos existan y sean números válidos
    if (!usdData?.promedio || typeof usdData.promedio !== 'number') throw new Error("Formato de USD inválido");
    if (!eurData?.promedio || typeof eurData.promedio !== 'number') throw new Error("Formato de EUR inválido");

    const saved = await prisma.exchangeRate.create({
      data: { usdToBs: usdData.promedio, eurToBs: eurData.promedio },
    });

    return { usdToBs: Number(saved.usdToBs), eurToBs: saved.eurToBs ? Number(saved.eurToBs) : null };
    
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    // Si falla, usamos la última tasa guardada (si existe)
    if (latest) {
      return { usdToBs: Number(latest.usdToBs), eurToBs: latest.eurToBs ? Number(latest.eurToBs) : null };
    }
    throw new Error('No se pudo obtener la tasa de cambio y no hay historial guardado');
  }
}