'use server';

import { cookies } from 'next/headers';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { SESSION_COOKIE_NAME } from '@/lib/session-cookie';
import { prisma } from '@/lib/db';

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días en segundos

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET debe estar definido en .env con al menos 32 caracteres');
  }
  return secret;
}

function sign(value: string): string {
  const secret = getSessionSecret();
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(value);
  return value + '.' + hmac.digest('hex');
}

function unsign(signed: string): string | null {
  const lastDot = signed.lastIndexOf('.');
  if (lastDot === -1) return null;
  const value = signed.slice(0, lastDot);
  const expected = sign(value);
  if (crypto.timingSafeEqual(Buffer.from(signed, 'utf8'), Buffer.from(expected, 'utf8'))) {
    return value;
  }
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Crear sesión y guardar en cookie (solo llamar tras validar credenciales). Incluye role para ACL en middleware. */
export async function createSession(userId: string, role: string): Promise<void> {
  const payload = JSON.stringify({
    userId,
    role,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  });
  const signed = sign(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/** Obtener userId desde la cookie de sesión; null si no hay sesión o es inválida. */
export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  const value = unsign(raw);
  if (!value) return null;
  try {
    const data = JSON.parse(value) as { userId: string; exp: number };
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data.userId;
  } catch {
    return null;
  }
}

/** Obtener el rol del usuario actual (para mostrar/ocultar opciones de administrador). */
export async function getCurrentUserRole(): Promise<string | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role ?? null;
}

/** Alcance del usuario para filtrar datos: SuperAdmin ve todo; Admin por proyecto; Supervisor/Técnico/Chofer por empresa. */
export type UserScope = {
  role: string;
  companyId: string | null;
  projectId: string | null;
};

export async function getCurrentUserScope(): Promise<UserScope | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, companyId: true, projectId: true },
  });
  if (!user) return null;
  return {
    role: user.role,
    companyId: user.companyId ?? null,
    projectId: user.projectId ?? null,
  };
}

/** Cerrar sesión (borrar cookie). */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
