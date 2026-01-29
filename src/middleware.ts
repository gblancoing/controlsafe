import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  parseSessionCookieEdge,
} from '@/lib/session-cookie-edge';
import {
  isPathAllowedForRole,
  getDefaultRedirectForRole,
} from '@/lib/acl-routes';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/usuarios',
  '/flota',
  '/mantenimiento',
  '/torque',
  '/empresas',
  '/faenas',
  '/historial',
  '/reportes',
  '/configuracion',
  '/acl',
  '/regiones',
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isProtectedPath(pathname)) {
    const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!cookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    const session = await parseSessionCookieEdge(cookie);
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }
    // ACL: según el rol solo se permite ver/operar las pestañas permitidas
    if (session.role && !isPathAllowedForRole(pathname, session.role)) {
      const redirectTo = getDefaultRedirectForRole(session.role);
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/usuarios/:path*',
    '/flota/:path*',
    '/mantenimiento/:path*',
    '/torque/:path*',
    '/empresas/:path*',
    '/faenas/:path*',
    '/historial/:path*',
    '/reportes/:path*',
    '/configuracion/:path*',
    '/acl/:path*',
    '/regiones/:path*',
  ],
};
