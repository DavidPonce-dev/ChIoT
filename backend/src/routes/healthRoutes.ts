import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { mqttClient } from '../mqttClient';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const mqttStatus = mqttClient?.connected ? 'connected' : 'disconnected';

  const health = {
    status: mongoStatus === 'connected' && mqttStatus === 'connected' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoStatus,
      mqtt: mqttStatus,
    },
  };

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
