declare global {
  namespace Express {
    interface Request {
      userId?: string;
      gymId?: string;
      adminId?: string;
      userRole?: string;
    }
  }
}

export {};