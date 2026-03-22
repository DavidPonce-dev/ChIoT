import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const CLEANUP_INTERVAL = 60 * 60 * 1000;

interface TokenInfo {
  jti: string;
  exp: number;
  iat: number;
}

const tokenStore = new Map<string, TokenInfo>();

setInterval(() => {
  const now = Date.now();
  for (const [jti, info] of tokenStore.entries()) {
    if (info.exp * 1000 < now) {
      tokenStore.delete(jti);
    }
  }
}, CLEANUP_INTERVAL);

export async function addTokenToBlacklist(token: string): Promise<void> {
  try {
    const decoded = jwt.decode(token) as TokenInfo & { id?: string };
    if (decoded && decoded.jti) {
      tokenStore.set(decoded.jti, {
        jti: decoded.jti,
        exp: decoded.exp,
        iat: decoded.iat,
      });
    }
  } catch {
    const hash = hashToken(token);
    tokenStore.set(hash, {
      jti: hash,
      exp: Math.floor(Date.now() / 1000) + 86400,
      iat: Math.floor(Date.now() / 1000),
    });
  }
}

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    const decoded = jwt.decode(token) as TokenInfo & { id?: string };
    if (decoded && decoded.jti) {
      return tokenStore.has(decoded.jti);
    }
  } catch {
    const hash = hashToken(token);
    return tokenStore.has(hash);
  }
  return false;
}

function hashToken(token: string): string {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function generateToken(userId: string): string {
  const jti = crypto.randomUUID();
  return jwt.sign({ id: userId, jti }, process.env.JWT_SECRET as string, { expiresIn: '24h' });
}
