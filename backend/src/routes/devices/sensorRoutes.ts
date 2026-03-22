import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { Device } from '../../models/Device';
import { uuidParamSchema } from '../../validators/device';
import { generateSecurePassword } from '../../utils/crypto';
import { logger } from '../../config/logger';

const router = Router();

router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const devices = await Device.find({ owner: req.userId, type: 'sensor' });
    res.json(devices);
  } catch (err: unknown) {
    logger.error({ err }, 'Error fetching sensors');
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
});

router.get('/:uuid', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const paramResult = uuidParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return res.status(400).json({ errors: paramResult.error.issues });
    }

    const device = await Device.findOne({ uuid: paramResult.data.uuid, owner: req.userId });
    if (!device) return res.status(404).json({ message: 'Device not found' });

    res.json(device);
  } catch (err: unknown) {
    logger.error({ err }, 'Error fetching sensor');
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
});

router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });

    const uuid = uuidv4();
    const mqttUser = `dev_${uuid.slice(0, 6)}`;
    const mqttPass = generateSecurePassword();

    const device = new Device({
      uuid,
      name,
      type: 'sensor',
      mqttUser,
      mqttPass,
      owner: req.userId,
    });

    await device.save();
    res.status(201).json({ uuid, mqttUser, mqttPass, type: 'sensor' });
  } catch (err: unknown) {
    logger.error({ err }, 'Error creating sensor');
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
});

router.delete('/:uuid', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const paramResult = uuidParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return res.status(400).json({ errors: paramResult.error.issues });
    }

    const deleted = await Device.findOneAndDelete({
      uuid: paramResult.data.uuid,
      owner: req.userId,
    });
    if (!deleted) return res.status(404).json({ message: 'Device not found' });

    res.json({ message: 'Device deleted' });
  } catch (err: unknown) {
    logger.error({ err }, 'Error deleting sensor');
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
});

export default router;
