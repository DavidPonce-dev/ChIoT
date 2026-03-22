import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { Device } from '../models/Device';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { execSync } from 'child_process';
import { mqttClient } from '../mqttClient';
import { createDeviceSchema, uuidParamSchema, claimDeviceSchema } from '../validators/device';
import { generateSecurePassword, sanitizeMqttUser } from '../utils/crypto';
import { logger } from '../config/logger';

const router = Router();

router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const devices = await Device.find({ owner: req.userId }).select('-mqttPass');
    res.json(devices);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
});

router.get('/:uuid', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const paramResult = uuidParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return res.status(400).json({ errors: paramResult.error.issues });
    }

    const device = await Device.findOne({
      uuid: paramResult.data.uuid,
      owner: req.userId,
    }).select('-mqttPass');

    if (!device) return res.status(404).json({ message: 'No encontrado' });
    res.json(device);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
});

router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = createDeviceSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }

    const { name, type } = result.data;
    const uuid = uuidv4();
    const rawMqttUser = `dev_${uuid.slice(0, 6)}`;
    const mqttUser = sanitizeMqttUser(rawMqttUser);
    const mqttPass = generateSecurePassword();

    try {
      execSync(`mosquitto_passwd -b /etc/mosquitto/passwd "${mqttUser}" "${mqttPass}"`);
      logger.info({ mqttUser }, 'Usuario MQTT creado');
    } catch (err) {
      logger.warn({ err, mqttUser }, 'No se pudo registrar el usuario MQTT');
    }

    const device = new Device({
      uuid,
      name,
      type,
      mqttUser,
      mqttPass,
      owner: req.userId,
    });
    await device.save();

    mqttClient.publish(`devices/${uuid}/register`, JSON.stringify({ uuid, name, type }));

    res.json({
      uuid,
      name,
      type,
      mqttUser,
      mqttPass,
    });
  } catch (err: unknown) {
    logger.error({ err }, 'Error al crear dispositivo');
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
});

router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const result = createDeviceSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }

    const { name, type } = result.data;
    const uuid = uuidv4();
    const rawMqttUser = `dev_${uuid.slice(0, 6)}`;
    const mqttUser = sanitizeMqttUser(rawMqttUser);
    const mqttPass = generateSecurePassword();

    try {
      execSync(`mosquitto_passwd -b /etc/mosquitto/passwd "${mqttUser}" "${mqttPass}"`);
      logger.info({ mqttUser }, 'Usuario MQTT creado');
    } catch (err) {
      logger.warn({ err, mqttUser }, 'No se pudo registrar usuario MQTT');
    }

    const device = new Device({
      uuid,
      name,
      type,
      mqttUser,
      mqttPass,
      owner: null,
    });
    await device.save();

    mqttClient.publish(`devices/${uuid}/register`, JSON.stringify({ uuid, name, type }));

    res.json({
      uuid,
      name,
      type,
      mqttUser,
      mqttPass,
    });
  } catch (err: unknown) {
    logger.error({ err }, 'Error en registro de dispositivo');
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
});

router.post('/claim', verifyToken, async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  try {
    const result = claimDeviceSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }

    session.startTransaction();

    const device = await Device.findOneAndUpdate(
      { uuid: result.data.uuid, owner: null },
      { owner: req.userId },
      { new: true, session }
    );

    if (!device) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Dispositivo no encontrado o ya reclamado' });
    }

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Dispositivo reclamado exitosamente',
      device: {
        uuid: device.uuid,
        name: device.name,
        type: device.type,
      },
    });
  } catch (err: unknown) {
    await session.abortTransaction();
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  } finally {
    session.endSession();
  }
});

export default router;
