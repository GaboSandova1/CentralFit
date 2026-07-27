declare global {
  namespace Express {
    interface Request {
      userId?: string;
      gymId?: string;
      adminId?: string;
    }
  }
}

export {};