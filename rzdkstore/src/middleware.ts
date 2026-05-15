import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware untuk proteksi route.
 *
 * - /dashboard/* → hanya bisa diakses user yang sudah login (role: USER atau ADMIN)
 * - /admin/* → hanya bisa diakses user dengan role ADMIN
 * - /login, /register → redirect ke dashboard jika sudah login
 *
 * Implementasi penuh akan dilakukan di Fase 2 setelah NextAuth.js disetup.
 * Saat ini hanya placeholder yang membiarkan semua request lewat.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // TODO: Fase 2 — Implementasi auth check via NextAuth session/JWT
  // Untuk sekarang, biarkan semua request lewat
  // Ini akan diganti dengan logika:
  //
  // const token = await getToken({ req: request });
  //
  // if (pathname.startsWith('/dashboard') && !token) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }
  //
  // if (pathname.startsWith('/admin') && (!token || token.role !== 'ADMIN')) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }
  //
  // if ((pathname === '/login' || pathname === '/register') && token) {
  //   const redirectUrl = token.role === 'ADMIN' ? '/admin' : '/dashboard';
  //   return NextResponse.redirect(new URL(redirectUrl, request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
};
