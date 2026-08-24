import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import { requireAuth, AuthRequest } from './middleware/auth';
import plansRoutes from './routes/plans';
import membersRoutes from './routes/members';
import reportsRoutes from './routes/reports';
import adminRoutes from './routes/admin';
import exchangeRateRoutes from './routes/exchangeRate';
import settingsRoutes from './routes/settings';
import attendanceRoutes from './routes/attendance';

const app = express();

// 1. Configuración de CORS (Seguridad: Solo permite a tu frontend)
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: (origin, callback) => {
    // Si estamos en desarrollo local, permitimos TODO (localhost, IPs de red, Postman, etc.)
    if (!isProduction) {
      return callback(null, true);
    }
    // En producción, solo permitimos los orígenes exactos de la lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json({ limit: '1mb' })); // Limitamos a 1MB para evitar ataques

// 2. Limitador de intentos de Login/Registro (Seguridad: Anti-Fuerza Bruta)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Bloqueo de 15 minutos
  max: 10, // Máximo 10 intentos por IP cada 15 minutos
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de acceso. Tu IP ha sido bloqueada temporalmente por 15 minutos.' }
});

// Aplicamos el limitador SOLO a las rutas críticas de autenticación
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
app.use('/admin/login', authLimiter);

app.get('/me', requireAuth, (req: AuthRequest, res) => {
  res.json({ userId: req.userId, gymId: req.gymId });
});

app.use('/auth', authRoutes);
app.use('/plans', plansRoutes);
app.use('/members', membersRoutes);
app.use('/reports', reportsRoutes);
app.use('/admin', adminRoutes);
app.use('/exchange-rate', exchangeRateRoutes);
app.use('/settings', settingsRoutes);
app.use('/attendance', attendanceRoutes);

app.get('/', (_req, res) => {
  res.json({ status: 'CentralFit API funcionando 🏋️' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});