import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { registerSchema, loginSchema } from '../validators/auth';
import { addTokenToBlacklist, generateToken } from '../utils/jwtBlacklist';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos, intenta en 15 minutos' },
});

const router = Router();

const TOKEN_COOKIE_NAME = 'chiotplatform_token';
const CSRF_COOKIE_NAME = 'chiotplatform_csrf';
const CSRF_MAX_AGE = 60 * 60 * 1000;
const TOKEN_MAX_AGE = 24 * 60 * 60 * 1000;

function generateCSRFToken(): string {
  return jwt.sign({ type: 'csrf' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
}

router.get('/csrf', (req, res) => {
  const csrfToken = generateCSRFToken();

  res.cookie(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CSRF_MAX_AGE,
    path: '/',
  });

  res.json({ csrfToken });
});

router.post('/register', authLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }

    const { email, password } = result.data;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ email, password: hashed });

    const csrfToken = generateCSRFToken();
    res.cookie(CSRF_COOKIE_NAME, csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: CSRF_MAX_AGE,
      path: '/',
    });

    res.status(201).json({ message: 'Usuario registrado', id: user._id });
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
});

router.post('/login', authLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, error: 'Datos inválidos' });
    }

    const { email, password } = result.data;
    const user = await User.findOne({ email }).select('+passwordHistory');
    if (!user) return res.status(401).json({ success: false, error: 'Credenciales inválidas' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    const token = generateToken(user._id.toString());

    const csrfToken = generateCSRFToken();

    res.cookie(CSRF_COOKIE_NAME, csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: CSRF_MAX_AGE,
      path: '/',
    });

    res.cookie(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: TOKEN_MAX_AGE,
      path: '/',
    });

    res.json({
      success: true,
      message: 'Login exitoso',
      user: { id: user._id, email: user.email },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Error interno' });
  }
});

router.post('/logout', async (req, res) => {
  const token = req.cookies?.[TOKEN_COOKIE_NAME];
  if (token) {
    await addTokenToBlacklist(token);
  }

  res.clearCookie(TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : false,
    path: '/',
  });
  res.clearCookie(CSRF_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  res.json({ success: true, message: 'Sesión cerrada' });
});

router.get('/me', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
});

export default router;
