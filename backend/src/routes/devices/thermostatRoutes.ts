import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken, AuthRequest } from '../../middleware/auth';
import { Device } from '../../models/Device';
import { uuidParamSchema } from '../../validators/device';
import { setTemperatureSchema } from '../../validators/thermostat';
import { publishCommand, DeviceActions } from '../../mqttBridge';
import { broadcastToUser } from '../../websocket';
import { generateSecurePassword } from '../../utils/crypto';
import { logger } from '../../config/logger';

const router = Router();

router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const devices = await Device.find({ owner: req.userId, type: 'thermostat' });
    res.json(devices);
  } catch (err: unknown) {
    logger.error({ err }, 'Error fetching thermostats');
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
    logger.error({ err }, 'Error fetching thermostat');
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
});

router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, temperature, mode } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });

    const uuid = uuidv4();
    const mqttUser = `dev_${uuid.slice(0, 6)}`;
    const mqttPass = generateSecurePassword();

    const device = new Device({
      uuid,
      name,
      type: 'thermostat',
      mqttUser,
      mqttPass,
      owner: req.userId,
      state: {
        temperature: temperature ?? 22,
        mode: mode ?? 'off',
      },
    });

    await device.save();
    res.status(201).json({ uuid, mqttUser, mqttPass, type: 'thermostat' });
  } catch (err: unknown) {
    logger.error({ err }, 'Error creating thermostat');
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
});

router.post('/:uuid/setTemp', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const paramResult = uuidParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return res.status(400).json({ errors: paramResult.error.issues });
    }

    const bodyResult = setTemperatureSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({ errors: bodyResult.error.issues });
    }

    const device = await Device.findOne({
      uuid: paramResult.data.uuid,
      owner: req.userId,
    });
    if (!device) return res.status(404).json({ message: 'Device not found' });

    await publishCommand({
      uuid: device.uuid,
      action: DeviceActions.THERMOSTAT.SET_TEMPERATURE,
      payload: {
        temperature: bodyResult.data.temperature,
        mode: bodyResult.data.mode,
      },
    });

    device.state = {
      ...(device.state as Record<string, unknown>),
      temperature: bodyResult.data.temperature,
      mode: bodyResult.data.mode,
    };
    await device.save();

    broadcastToUser(req.userId!, 'device_state_changed', {
      uuid: device.uuid,
      state: device.state,
    });

    res.json({ success: true, state: device.state });
  } catch (err: unknown) {
    logger.error({ err }, 'Error setting temperature');
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
});

router.post('/:uuid/mode', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const paramResult = uuidParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return res.status(400).json({ errors: paramResult.error.issues });
    }

    const { mode } = req.body;
    if (!mode || !['cool', 'heat', 'off'].includes(mode)) {
      return res.status(400).json({ message: 'Mode must be: cool, heat, or off' });
    }

    const device = await Device.findOne({
      uuid: paramResult.data.uuid,
      owner: req.userId,
    });
    if (!device) return res.status(404).json({ message: 'Device not found' });

    await publishCommand({
      uuid: device.uuid,
      action: DeviceActions.THERMOSTAT.SET_MODE,
      payload: { mode },
    });

    device.state = { ...(device.state as Record<string, unknown>), mode };
    await device.save();

    res.json({ success: true, mode });
  } catch (err: unknown) {
    logger.error({ err }, 'Error setting mode');
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
    logger.error({ err }, 'Error deleting thermostat');
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
});

export default router;
