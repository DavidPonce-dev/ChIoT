import { IncomingMessage } from 'http';
import { URL } from 'url';
import { WebSocket, WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { logger } from './config/logger';
import { isTokenBlacklisted } from './utils/jwtBlacklist';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

const clients = new Map<string, Set<AuthenticatedWebSocket>>();

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost',
  'http://localhost:80',
  'http://127.0.0.1:3000',
  'http://127.0.0.1',
  'http://192.168.1.115:80',
];

function validateOrigin(origin: string | undefined): boolean {
  if (!origin) return false;

  try {
    const originUrl = new URL(origin);
    const allowed = ALLOWED_ORIGINS.some((allowed) => {
      try {
        const allowedUrl = new URL(allowed);
        return originUrl.hostname === allowedUrl.hostname && originUrl.port === allowedUrl.port;
      } catch {
        return false;
      }
    });
    return allowed;
  } catch {
    return false;
  }
}

export function setupWebSocket(wss: WebSocketServer): void {
  wss.on('connection', (ws: AuthenticatedWebSocket, req: IncomingMessage) => {
    const origin = req.headers.origin;

    if (!validateOrigin(origin)) {
      logger.warn({ origin }, 'WebSocket connection rejected - invalid origin');
      ws.close(1008, 'Invalid origin');
      return;
    }

    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'auth') {
          const token = message.token;

          if (await isTokenBlacklisted(token)) {
            ws.send(JSON.stringify({ type: 'auth', success: false, error: 'Token revocado' }));
            return;
          }

          try {
            const decoded = verifySocketToken(token);
            ws.userId = decoded.id;

            if (!clients.has(decoded.id)) {
              clients.set(decoded.id, new Set());
            }
            clients.get(decoded.id)!.add(ws);

            ws.send(JSON.stringify({ type: 'auth', success: true }));
            logger.info(
              { userId: decoded.id, connections: clients.get(decoded.id)?.size },
              'Cliente WebSocket autenticado'
            );
          } catch {
            ws.send(JSON.stringify({ type: 'auth', success: false, error: 'Token inválido' }));
          }
        }
      } catch (err) {
        logger.error({ err }, 'Error procesando mensaje WebSocket');
      }
    });

    ws.on('close', () => {
      if (ws.userId) {
        const userClients = clients.get(ws.userId);
        if (userClients) {
          userClients.delete(ws);
          if (userClients.size === 0) {
            clients.delete(ws.userId);
          }
        }
        logger.info({ userId: ws.userId }, 'Cliente WebSocket desconectado');
      }
    });

    ws.on('error', (err) => {
      logger.error({ err }, 'Error en WebSocket');
    });
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws: AuthenticatedWebSocket) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  logger.info({ allowedOrigins: ALLOWED_ORIGINS }, 'WebSocket server initialized');
}

export function notifyUser(userId: string, payload: object): void {
  const userClients = clients.get(userId);
  if (userClients) {
    userClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(payload));
      }
    });
  }
}

export function broadcastToUser(userId: string, event: string, data: object): void {
  notifyUser(userId, { type: 'event', event, data, timestamp: new Date().toISOString() });
}

function verifySocketToken(token: string): { id: string } {
  return jwt.verify(token, process.env.JWT_SECRET as string, {
    maxAge: '24h',
  }) as { id: string };
}
