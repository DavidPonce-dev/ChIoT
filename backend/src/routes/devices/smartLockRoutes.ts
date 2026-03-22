import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { Device } from '../../models/Device';
import { publishCommand, DeviceActions } from '../../mqttBridge';
import { uuidParamSchema } from '../../validators/device';
import { broadcastToUser } from '../../websocket';
import { generateSecurePassword } from '../../utils/crypto';
import { logger } from '../../config/logger';

const router = Router();

router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const devices = await Device.find({ owner: req.userId, type: 'smart_lock' });
    res.json(devices);
  } catch (err: unknown) {
    logger.error({ err }, 'Error fetching smart locks');
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
    logger.error({ err }, 'Error fetching smart lock');
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
      type: 'smart_lock',
      mqttUser,
      mqttPass,
      owner: req.userId,
      state: { locked: true },
    });

    await device.save();
    res.status(201).json({ uuid, mqttUser, mqttPass, type: 'smart_lock' });
  } catch (err: unknown) {
    logger.error({ err }, 'Error creating smart lock');
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
});

router.post('/:uuid/lock', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const paramResult = uuidParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return res.status(400).json({ errors: paramResult.error.issues });
    }

    const device = await Device.findOne({ uuid: paramResult.data.uuid, owner: req.userId });
    if (!device) return res.status(404).json({ message: 'Device not found' });

    await publishCommand({
      uuid: device.uuid,
      action: DeviceActions.SMART_LOCK.LOCK,
    });

    device.state = { ...device.state, locked: true };
    await device.save();

    broadcastToUser(req.userId!, 'device_state_changed', {
      uuid: device.uuid,
      state: device.state,
    });

    res.json({ success: true, locked: true });
  } catch (err: unknown) {
    logger.error({ err }, 'Error locking device');
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
});

router.post('/:uuid/unlock', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const paramResult = uuidParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return res.status(400).json({ errors: paramResult.error.issues });
    }

    const device = await Device.findOne({ uuid: paramResult.data.uuid, owner: req.userId });
    if (!device) return res.status(404).json({ message: 'Device not found' });

    await publishCommand({
      uuid: device.uuid,
      action: DeviceActions.SMART_LOCK.UNLOCK,
    });

    device.state = { ...device.state, locked: false };
    await device.save();

    broadcastToUser(req.userId!, 'device_state_changed', {
      uuid: device.uuid,
      state: device.state,
    });

    res.json({ success: true, locked: false });
  } catch (err: unknown) {
    logger.error({ err }, 'Error unlocking device');
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
    logger.error({ err }, 'Error deleting smart lock');
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
});

export default router;
