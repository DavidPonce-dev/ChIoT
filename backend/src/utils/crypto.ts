import crypto from 'crypto';

export function generateSecurePassword(length: number = 16): string {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

export function sanitizeMqttUser(username: string): string {
  return username.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 32);
}
