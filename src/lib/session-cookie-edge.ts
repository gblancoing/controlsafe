/**
 * Verificación de cookie de sesión compatible con Edge Runtime.
 * Usa Web Crypto API (crypto.subtle) en lugar del módulo Node 'crypto'.
 * Solo usar desde middleware.ts.
 */
export const SESSION_COOKIE_NAME = 'controlsafe_session';

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return '';
  return secret;
}

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Comparación segura contra timing attacks para dos strings hex del mismo tamaño. */
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Parsea y verifica la cookie de sesión usando Web Crypto (Edge).
 * Debe usarse solo en middleware; para Server Components/Actions usar auth.ts + session-cookie.ts.
 */
export async function parseSessionCookieEdge(
  raw: string
): Promise<{ userId: string; role?: string } | null> {
  if (!raw || typeof raw !== 'string') return null;
  const lastDot = raw.lastIndexOf('.');
  if (lastDot === -1) return null;
  const value = raw.slice(0, lastDot);
  const signatureHex = raw.slice(lastDot + 1);
  const secret = getSessionSecret();
  if (!secret) return null;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(value)
  );

  const expectedHex = bytesToHex(signature);
  if (!timingSafeEqualHex(signatureHex, expectedHex)) return null;

  try {
    const data = JSON.parse(value) as { userId: string; role?: string; exp: number };
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return { userId: data.userId, role: data.role };
  } catch {
    return null;
  }
}
