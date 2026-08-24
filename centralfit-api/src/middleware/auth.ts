import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

export type AuthRequest = Request;

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

    // MEJORA 8: Verificar que el usuario realmente exista y pertenezca al gimnasio
    const user = await prisma.user.findFirst({
      where: { id: payload.userId, gymId: payload.gymId }
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no válido o eliminado.' });
    }

    req.userId = payload.userId;
    req.gymId = payload.gymId;
    req.userRole = user.role; // MEJORA 9: Guardamos el rol para usarlo después
    
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// MEJORA 9: Middleware factory para validar roles
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.userRole;
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ error: 'No tienes los permisos necesarios para realizar esta acción.' });
    }
    next();
  };
}