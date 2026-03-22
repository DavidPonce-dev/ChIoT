import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

const TOKEN_COOKIE_NAME = 'chiotplatform_token';

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  const cookies = req.cookies as Record<string, string> | undefined;
  if (cookies && TOKEN_COOKIE_NAME in cookies) {
    token = cookies[TOKEN_COOKIE_NAME];
  } else if (req.headers.authorization) {
    const header = req.headers.authorization;
    if (header.startsWith('Bearer ')) {
      token = header.slice(7);
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string, {
      algorithms: ['HS256'],
    }) as { id: string };
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}
