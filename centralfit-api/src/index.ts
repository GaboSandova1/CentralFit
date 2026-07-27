import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import { requireAuth, AuthRequest } from './middleware/auth';
import plansRoutes from './routes/plans';
import membersRoutes from './routes/members';
import reportsRoutes from './routes/reports';
import adminRoutes from './routes/admin';
import exchangeRateRoutes from './routes/exchangeRate';
import settingsRoutes from './routes/settings';

const app = express();

app.use(cors());
app.use(express.json());

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

app.get('/', (_req, res) => {
  res.json({ status: 'CentralFit API funcionando 🏋️' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});