import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

export interface AuthRequest extends Request {
  gymId?: string;
  userId?: string;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      gymId: string;
    };

    const gym = await prisma.gym.findUnique({ where: { id: payload.gymId } });
    if (!gym || gym.status === 'suspended') {
      return res.status(403).json({ error: 'Este gimnasio ha sido suspendido. Contacta a soporte.' });
    }

    req.userId = payload.userId;
    req.gymId = payload.gymId;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}