import { Router, Request, Response } from 'express';
import { StateHistory } from '../models/StateHistory';
import { Device } from '../models/Device';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = Router();

function verifyDeviceApiKey(req: Request, res: Response, next: () => void) {
  const apiKey = req.headers['x-device-key'] as string;
  const deviceUuid = req.params.uuid;

  if (!apiKey || !deviceUuid) {
    return res.status(401).json({ error: 'API key requerida' });
  }

  Device.findOne({ uuid: deviceUuid, mqttPass: apiKey })
    .then((device) => {
      if (!device) {
        return res.status(401).json({ error: 'API key inválida' });
      }
      next();
    })
    .catch(() => {
      res.status(500).json({ error: 'Error interno' });
    });
}

router.get('/:uuid', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { uuid } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    const query: Record<string, unknown> = { deviceUuid: uuid };

    if (req.query.startDate) {
      const startDate = new Date(req.query.startDate as string);
      query.timestamp = { ...(query.timestamp as object), $gte: startDate };
    }
    if (req.query.endDate) {
      const endDate = new Date(req.query.endDate as string);
      query.timestamp = { ...(query.timestamp as object), $lte: endDate };
    }

    const device = await Device.findOne({ uuid, owner: req.userId });
    if (!device) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }

    const history = await StateHistory.find(query).sort({ timestamp: -1 }).limit(limit).exec();

    const formattedHistory = history.map((record) => ({
      state: Object.fromEntries(record.state as unknown as Map<string, unknown>),
      timestamp: record.timestamp,
    }));

    res.json({
      deviceUuid: uuid,
      count: formattedHistory.length,
      history: formattedHistory,
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Error interno';
    res.status(500).json({ error });
  }
});

router.post('/record/:uuid', verifyDeviceApiKey, async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;
    const { state } = req.body;

    if (!state || typeof state !== 'object') {
      return res.status(400).json({ error: 'Estado requerido' });
    }

    const device = await Device.findOne({ uuid });
    if (!device) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }

    const record = await StateHistory.create({
      deviceId: device._id,
      deviceUuid: uuid,
      state,
      timestamp: new Date(),
    });

    res.json({
      success: true,
      recordId: record._id,
      timestamp: record.timestamp,
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Error interno';
    res.status(500).json({ error });
  }
});

router.delete('/:uuid', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { uuid } = req.params;
    const olderThan = req.query.olderThan ? new Date(req.query.olderThan as string) : new Date();

    const device = await Device.findOne({ uuid, owner: req.userId });
    if (!device) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }

    const result = await StateHistory.deleteMany({
      deviceUuid: uuid,
      timestamp: { $lt: olderThan },
    });

    res.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Error interno';
    res.status(500).json({ error });
  }
});

export default router;
