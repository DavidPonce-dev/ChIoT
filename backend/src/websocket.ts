import { WebSocket, WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { logger } from './config/logger';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

const clients = new Map<string, Set<AuthenticatedWebSocket>>();

export function setupWebSocket(wss: WebSocketServer): void {
  wss.on('connection', (ws: AuthenticatedWebSocket, _req) => {
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'auth') {
          const token = message.token;
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

  logger.info('WebSocket server initialized');
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
  return jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
}
