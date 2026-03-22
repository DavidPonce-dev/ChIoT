import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { Device } from '../models/Device';
import { csrfMiddleware } from '../middleware/csrf';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { generateSecurePairingCode } from '../utils/crypto';

const router = Router();

const pairingCodes = new Map<string, { userId: string; expiresAt: Date; deviceUuid?: string }>();

const generateCodeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos, intenta en 1 minuto' },
});

const registerDeviceLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos de registro, intenta en 1 minuto' },
});

router.post(
  '/generate-code',
  generateCodeLimiter,
  verifyToken,
  csrfMiddleware,
  (req: AuthRequest, res: Response) => {
    const code = generateSecurePairingCode(6);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const userId = req.userId as string;

    pairingCodes.set(code, { userId, expiresAt });

    res.json({ code, expiresAt: expiresAt.toISOString() });
  }
);

router.post('/register-device', registerDeviceLimiter, async (req: Request, res: Response) => {
  const { code, uuid, name, type, mqttUser, mqttPass } = req.body;

  if (!code || !uuid || !name || !type) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const pairingData = pairingCodes.get((code as string).toUpperCase());
  if (!pairingData) {
    return res.status(400).json({ error: 'Código de emparejamiento inválido' });
  }

  if (new Date() > pairingData.expiresAt) {
    pairingCodes.delete(code.toUpperCase());
    return res.status(400).json({ error: 'Código expirado' });
  }

  try {
    const existingDevice = await Device.findOne({ uuid });
    if (existingDevice) {
      existingDevice.owner = pairingData.userId as unknown as import('mongoose').Types.ObjectId;
      existingDevice.mqttUser = mqttUser;
      existingDevice.mqttPass = mqttPass;
      await existingDevice.save();
    } else {
      await Device.create({
        uuid,
        name,
        type,
        mqttUser,
        mqttPass,
        owner: pairingData.userId,
      });
    }

    pairingCodes.delete(code.toUpperCase());

    res.json({
      success: true,
      message: 'Dispositivo registrado exitosamente',
      device: { uuid, name, type },
    });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
});

router.get('/verify-code/:code', (req: Request, res: Response) => {
  const code = req.params.code as string;
  const pairingData = pairingCodes.get(code.toUpperCase());

  if (!pairingData) {
    return res.json({ valid: false });
  }

  if (new Date() > pairingData.expiresAt) {
    pairingCodes.delete(code.toUpperCase());
    return res.json({ valid: false, reason: 'expired' });
  }

  res.json({ valid: true });
});

export default router;
