import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

// Registrar entrada
router.post('/', async (req: AuthRequest, res) => {
  if (!req.gymId) return res.status(401).json({ error: 'No autorizado' });
  const { cedula } = req.body;

  if (!cedula) return res.status(400).json({ error: 'Cédula requerida' });

  const member = await prisma.member.findFirst({
    where: { cedula, gymId: req.gymId },
    include: { subscriptions: { orderBy: { endDate: 'desc' }, take: 1, include: { plan: true } } }
  });

  if (!member) return res.status(404).json({ error: 'Miembro no encontrado con esa cédula' });

  // Evitar dobles registros si escanean la misma cédula en menos de 1 minuto
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentAttendance = await prisma.attendance.findFirst({
    where: { memberId: member.id, createdAt: { gte: oneMinuteAgo } }
  });

  if (recentAttendance) {
    return res.status(409).json({ error: 'Entrada ya registrada recientemente', member });
  }

  const attendance = await prisma.attendance.create({
    data: { gymId: req.gymId, memberId: member.id }
  });

  const latestSub = member.subscriptions[0];
  const isActive = latestSub ? latestSub.endDate > new Date() : false;

  res.status(201).json({
    id: attendance.id,
    member: {
      id: member.id,
      fullName: member.fullName,
      photoUrl: member.photoUrl,
      plan: latestSub?.plan.name ?? null,
      status: isActive ? 'Activo' : 'Vencido'
    },
    createdAt: attendance.createdAt
  });
});

// Listar asistencias (de hoy o de una fecha específica)
router.get('/', async (req: AuthRequest, res) => {
  if (!req.gymId) return res.status(401).json({ error: 'No autorizado' });

  const dateStr = typeof req.query.date === 'string' ? req.query.date : null;
  let startDate, endDate;

  if (dateStr) {
    // Ajustamos la fecha para que coincida con la zona horaria local
    startDate = new Date(dateStr + "T00:00:00");
    endDate = new Date(dateStr + "T23:59:59");
  } else {
    // Si no mandan fecha, filtramos por hoy
    startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date();
  }

  const attendances = await prisma.attendance.findMany({
    where: { gymId: req.gymId, createdAt: { gte: startDate, lte: endDate } },
    include: {
      member: {
        include: { subscriptions: { orderBy: { endDate: 'desc' }, take: 1, include: { plan: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const result = attendances.map(a => {
    const latestSub = a.member.subscriptions[0];
    const isActive = latestSub ? latestSub.endDate > new Date() : false;
    return {
      id: a.id,
      memberName: a.member.fullName,
      cedula: a.member.cedula,
      memberPhoto: a.member.photoUrl,
      plan: latestSub?.plan.name ?? 'Sin plan',
      status: isActive ? 'Activo' : 'Vencido',
      time: a.createdAt
    };
  });

  res.json(result);
});

export default router;