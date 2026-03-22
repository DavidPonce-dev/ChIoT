import crypto from 'crypto';

export function generateSecurePassword(length: number = 16): string {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}

export function sanitizeMqttUser(username: string): string {
  return username.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 32);
}

export function sanitizeShellArgument(arg: string): string {
  if (!arg) return '';
  return arg
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "'\\''")
    .replace(/"/g, '\\"')
    .replace(/\$/g, '\\$')
    .replace(/`/g, '\\`')
    .slice(0, 128);
}

export function generateSecurePairingCode(length: number = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

export function validateEnvVariables(): void {
  const required = ['JWT_SECRET', 'MONGO_URI', 'MQTT_BROKER'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('WARNING: JWT_SECRET should be at least 32 characters for security');
  }
}
