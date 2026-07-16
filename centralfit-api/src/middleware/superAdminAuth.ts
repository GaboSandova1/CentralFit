import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface SuperAdminRequest extends Request {
  adminId?: string;
}

export function requireSuperAdmin(req: SuperAdminRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  try {
    const payload = jwt.verify(token, process.env.SUPER_ADMIN_JWT_SECRET as string) as {
      adminId: string;
    };
    req.adminId = payload.adminId;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}