import { Router, Response } from 'express';
import { z } from 'zod';
import { Rule } from '../models/Rule';
import { Device } from '../models/Device';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = Router();

const conditionSchema = z.object({
  type: z.enum([
    'temperature_above',
    'temperature_below',
    'humidity_above',
    'humidity_below',
    'device_online',
    'device_offline',
    'time',
  ]),
  deviceUuid: z.string().optional(),
  value: z.number().optional(),
  time: z.string().optional(),
});

const actionSchema = z.object({
  type: z.enum(['turn_on', 'turn_off', 'set_color', 'set_temperature', 'send_notification']),
  deviceUuid: z.string().optional(),
  payload: z.any().optional(),
  message: z.string().optional(),
});

const createRuleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  conditions: z.array(conditionSchema).min(1),
  conditionLogic: z.enum(['AND', 'OR']).default('AND'),
  actions: z.array(actionSchema).min(1),
  enabled: z.boolean().default(true),
});

const updateRuleSchema = createRuleSchema.partial();

router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const rules = await Rule.find({ owner: req.userId }).sort({ createdAt: -1 }).lean();

    res.json({ rules });
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Error interno';
    res.status(500).json({ error });
  }
});

router.get('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const rule = await Rule.findOne({ _id: req.params.id, owner: req.userId });

    if (!rule) {
      return res.status(404).json({ error: 'Regla no encontrada' });
    }

    res.json({ rule });
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Error interno';
    res.status(500).json({ error });
  }
});

router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = createRuleSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }

    for (const condition of result.data.conditions) {
      if (condition.deviceUuid) {
        const device = await Device.findOne({ uuid: condition.deviceUuid, owner: req.userId });
        if (!device) {
          return res
            .status(400)
            .json({ error: `Dispositivo no encontrado: ${condition.deviceUuid}` });
        }
      }
    }

    for (const action of result.data.actions) {
      if (action.deviceUuid) {
        const device = await Device.findOne({ uuid: action.deviceUuid, owner: req.userId });
        if (!device) {
          return res.status(400).json({ error: `Dispositivo no encontrado: ${action.deviceUuid}` });
        }
      }
    }

    const rule = new Rule({
      ...result.data,
      owner: req.userId,
    });

    await rule.save();

    res.status(201).json({ rule });
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Error interno';
    res.status(500).json({ error });
  }
});

router.put('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = updateRuleSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }

    const rule = await Rule.findOne({ _id: req.params.id, owner: req.userId });
    if (!rule) {
      return res.status(404).json({ error: 'Regla no encontrada' });
    }

    Object.assign(rule, result.data);
    await rule.save();

    res.json({ rule });
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Error interno';
    res.status(500).json({ error });
  }
});

router.delete('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const rule = await Rule.findOneAndDelete({ _id: req.params.id, owner: req.userId });

    if (!rule) {
      return res.status(404).json({ error: 'Regla no encontrada' });
    }

    res.json({ success: true, message: 'Regla eliminada' });
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Error interno';
    res.status(500).json({ error });
  }
});

router.post('/:id/toggle', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const rule = await Rule.findOne({ _id: req.params.id, owner: req.userId });

    if (!rule) {
      return res.status(404).json({ error: 'Regla no encontrada' });
    }

    rule.enabled = !rule.enabled;
    await rule.save();

    res.json({ rule });
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Error interno';
    res.status(500).json({ error });
  }
});

export default router;
