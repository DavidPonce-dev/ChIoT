import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

dotenv.config();

import { logger } from './config/logger';
import { swaggerSpec } from './config/swagger';
import { connectDB } from './config/db';
import { connectMQTT } from './mqttClient';
import { setupWebSocket } from './websocket';
import { validateEnvVariables } from './utils/crypto';

validateEnvVariables();

import authRoutes from './routes/authRoutes';
import deviceRoutes from './routes/deviceRoutes';
import ledStripRoutes from './routes/devices/ledStripRoutes';
import thermostatRoutes from './routes/devices/thermostatRoutes';
import sensorRoutes from './routes/devices/sensorRoutes';
import smartLockRoutes from './routes/devices/smartLockRoutes';
import healthRoutes from './routes/healthRoutes';
import pairingRoutes from './routes/pairingRoutes';
import historyRoutes from './routes/historyRoutes';
import rulesRoutes from './routes/rulesRoutes';

const PORT = process.env.PORT || 8080;

const app = express();
const httpServer = createServer(app);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'ws:', 'wss:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost',
      'http://localhost:80',
      'http://192.168.1.115:80',
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, intenta más tarde' },
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, intenta en 15 minutos' },
});

app.use('/api/', limiter);
app.use('/api/auth', strictLimiter);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/health', healthRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/leds', ledStripRoutes);
app.use('/api/thermostats', thermostatRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/locks', smartLockRoutes);
app.use('/api/pairing', pairingRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/rules', rulesRoutes);

const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
setupWebSocket(wss);

const start = async () => {
  try {
    await connectDB();
    await connectMQTT();
    httpServer.listen(PORT, () => {
      logger.info({ port: PORT }, 'Servidor activo');
    });
  } catch (err) {
    logger.error({ err }, 'Error al iniciar servidor');
    process.exit(1);
  }
};

start();

export { app };
