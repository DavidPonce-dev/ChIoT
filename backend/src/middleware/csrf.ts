import { Request, Response, NextFunction } from 'express';

const CSRF_COOKIE_NAME = 'chiotplatform_csrf';

export function csrfMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  const csrfToken = req.headers['x-csrf-token'] as string;
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

  if (!csrfToken || !cookieToken) {
    res.status(403).json({ error: 'CSRF token requerido' });
    return;
  }

  if (csrfToken !== cookieToken) {
    res.status(403).json({ error: 'CSRF token inválido' });
    return;
  }

  next();
}
