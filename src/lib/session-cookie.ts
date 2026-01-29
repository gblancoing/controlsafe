/**
 * Verificación de cookie de sesión (solo crypto).
 * Usado por middleware en Edge; no depende de bcrypt ni cookies().
 */
import crypto from 'crypto';

export const SESSION_COOKIE_NAME = 'controlsafe_session';

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return '';
  return secret;
}

function sign(value: string): string {
  const secret = getSessionSecret();
  if (!secret) return value;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(value);
  return value + '.' + hmac.digest('hex');
}

export function parseSessionCookie(raw: string): { userId: string; role?: string } | null {
  if (!raw || typeof raw !== 'string') return null;
  const lastDot = raw.lastIndexOf('.');
  if (lastDot === -1) return null;
  const value = raw.slice(0, lastDot);
  const expected = sign(value);
  try {
    if (!crypto.timingSafeEqual(Buffer.from(raw, 'utf8'), Buffer.from(expected, 'utf8'))) {
      return null;
    }
  } catch {
    return null;
  }
  try {
    const data = JSON.parse(value) as { userId: string; role?: string; exp: number };
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return { userId: data.userId, role: data.role };
  } catch {
    return null;
  }
}
