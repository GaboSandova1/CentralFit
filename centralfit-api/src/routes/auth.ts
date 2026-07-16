import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);

  if (!validPassword) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = jwt.sign(
    { userId: user.id, gymId: user.gymId },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );

  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});



router.post('/register', async (req, res) => {
  const { gymName, email, password } = req.body;

  if (!gymName || !email || !password) {
    return res.status(400).json({ error: 'Nombre del gimnasio, email y contraseña son requeridos' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ error: 'Ese email ya está registrado' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const gym = await prisma.gym.create({
    data: {
      name: gymName,
      status: 'trial',
      users: {
        create: {
          email,
          passwordHash,
          role: 'owner',
        },
      },
    },
    include: { users: true },
  });

  const newUser = gym.users[0];
  if (!newUser) {
    return res.status(500).json({ error: 'Error creando el usuario' });
  }

  const token = jwt.sign(
    { userId: newUser.id, gymId: gym.id },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    token,
    user: { id: newUser.id, email: newUser.email, role: newUser.role },
    gym: { id: gym.id, name: gym.name, status: gym.status },
  });
});



export default router;