import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { Device } from '../../models/Device';
import { createLedStripSchema, updateLedStripSchema } from '../../validators/ledStrip';
import { uuidParamSchema } from '../../validators/device';
import { generateSecurePassword } from '../../utils/crypto';
import { logger } from '../../config/logger';
import { publishCommand, DeviceActions } from '../../mqttBridge';

const router = Router();

/**
 * @swagger
 * /api/leds:
 *   post:
 *     tags: [LED Strips]
 *     summary: Crear tira LED
 *     description: Crea una nueva tira LED para el usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, description: 'Nombre del dispositivo' }
 *               brightness: { type: number, description: 'Brillo inicial (0-100)' }
 *               color: { type: string, description: 'Color hex (#RRGGBB)' }
 *               mode: { type: string, enum: ['static', 'rainbow', 'fire', 'wave', 'candle'] }
 *               speed: { type: number, description: 'Velocidad de animación (1-255)' }
 *     responses:
 *       201:
 *         description: Tira LED creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceCreateResponse'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 */
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = createLedStripSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }

    const { name, brightness, color, mode, speed } = result.data;
    const uuid = uuidv4();
    const mqttUser = `dev_${uuid.slice(0, 6)}`;
    const mqttPass = generateSecurePassword();

    const device = new Device({
      uuid,
      name,
      type: 'LED_STRIP',
      mqttUser,
      mqttPass,
      owner: req.userId,
      state: { brightness, color, mode, speed },
    });

    await device.save();
    res.status(201).json({ uuid, mqttUser, mqttPass, type: 'LED_STRIP' });
  } catch (err: unknown) {
    logger.error({ err }, 'Error creating device');
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
});

/**
 * @swagger
 * /api/leds:
 *   get:
 *     tags: [LED Strips]
 *     summary: Listar tiras LED
 *     description: Obtiene todas las tiras LED del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tiras LED
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Device'
 *       401:
 *         description: No autenticado
 */
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const devices = await Device.find({ owner: req.userId, type: 'LED_STRIP' });
    res.json(devices);
  } catch (err: unknown) {
    logger.error({ err }, 'Error fetching devices');
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
});

/**
 * @swagger
 * /api/leds/{uuid}:
 *   get:
 *     tags: [LED Strips]
 *     summary: Obtener tira LED
 *     description: Obtiene los detalles de una tira LED específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalles de la tira LED
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Device'
 *       404:
 *         description: Dispositivo no encontrado
 */
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
    logger.error({ err }, 'Error fetching device');
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
});

/**
 * @swagger
 * /api/leds/{uuid}:
 *   put:
 *     tags: [LED Strips]
 *     summary: Actualizar tira LED
 *     description: Actualiza los parámetros de una tira LED y envía comandos MQTT
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LedStripUpdate'
 *     responses:
 *       200:
 *         description: Tira LED actualizada
 *       404:
 *         description: Dispositivo no encontrado
 */
router.put('/:uuid', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const paramResult = uuidParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return res.status(400).json({ errors: paramResult.error.issues });
    }

    const result = updateLedStripSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }

    const device = await Device.findOne({ uuid: paramResult.data.uuid, owner: req.userId });
    if (!device) return res.status(404).json({ message: 'Device not found' });

    const stateUpdate: Record<string, unknown> = {};
    if (result.data.name !== undefined) device.name = result.data.name;
    if (result.data.brightness !== undefined) stateUpdate.brightness = result.data.brightness;
    if (result.data.color !== undefined) stateUpdate.color = result.data.color;
    if (result.data.mode !== undefined) stateUpdate.mode = result.data.mode;
    if (result.data.speed !== undefined) stateUpdate.speed = result.data.speed;

    if (Object.keys(stateUpdate).length > 0) {
      device.state = { ...(device.state as Record<string, unknown>), ...stateUpdate };
    }

    await device.save();

    if (result.data.brightness !== undefined) {
      await publishCommand({
        uuid: device.uuid,
        action: DeviceActions.LED_STRIP.SET_BRIGHTNESS,
        payload: { value: result.data.brightness },
      });
    }
    if (result.data.color !== undefined) {
      await publishCommand({
        uuid: device.uuid,
        action: DeviceActions.LED_STRIP.SET_COLOR,
        payload: { color: result.data.color },
      });
    }
    if (result.data.mode !== undefined) {
      await publishCommand({
        uuid: device.uuid,
        action: DeviceActions.LED_STRIP.SET_MODE,
        payload: { mode: result.data.mode },
      });
    }
    if (result.data.speed !== undefined) {
      await publishCommand({
        uuid: device.uuid,
        action: DeviceActions.LED_STRIP.SET_SPEED,
        payload: { value: result.data.speed },
      });
    }

    res.json(device);
  } catch (err: unknown) {
    logger.error({ err }, 'Error updating device');
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
});

/**
 * @swagger
 * /api/leds/{uuid}:
 *   delete:
 *     tags: [LED Strips]
 *     summary: Eliminar tira LED
 *     description: Elimina una tira LED
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tira LED eliminada
 *       404:
 *         description: Dispositivo no encontrado
 */
router.delete('/:uuid', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const paramResult = uuidParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return res.status(400).json({ errors: paramResult.error.issues });
    }

    const deletedDevice = await Device.findOneAndDelete({
      uuid: paramResult.data.uuid,
      owner: req.userId,
    });
    if (!deletedDevice) return res.status(404).json({ message: 'Device not found' });

    res.json({ message: 'Device deleted successfully' });
  } catch (err: unknown) {
    logger.error({ err }, 'Error deleting device');
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
});

export default router;
