import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-jwt-key-rms-white-label-2025-secure-token'
);

const COOKIE_NAME = 'rms_auth_token';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore public paths, assets, and APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api') ||
    pathname === '/admin/login' ||
    pathname === '/super-admin/login'
  ) {
    return NextResponse.next();
  }

  // Check Admin Routes
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string;
      if (!['SUPER_ADMIN', 'RESTAURANT_ADMIN', 'STAFF'].includes(role)) {
        return NextResponse.redirect(new URL('/admin/login?error=unauthorized', req.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // Check Kitchen Routes
  if (pathname.startsWith('/kitchen')) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string;
      if (!['SUPER_ADMIN', 'RESTAURANT_ADMIN', 'KITCHEN'].includes(role)) {
        return NextResponse.redirect(new URL('/admin/login?error=unauthorized', req.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // Check Super Admin Routes
  if (pathname.startsWith('/super-admin')) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL('/super-admin/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string;
      if (role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/super-admin/login?error=unauthorized', req.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/super-admin/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/kitchen/:path*', '/super-admin/:path*'],
};