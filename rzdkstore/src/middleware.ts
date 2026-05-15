import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware proteksi route.
 *
 * Rules:
 * - /dashboard/* → hanya user yang sudah login (role: USER atau ADMIN)
 * - /admin/* → hanya user dengan role ADMIN
 * - /login, /register, /forgot-password, /reset-password → redirect ke dashboard/admin jika sudah login
 * - /api/admin/* → hanya ADMIN (API protection)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ambil token JWT dari session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const userRole = token?.role as string | undefined;

  // ============================================================
  // PROTEKSI: /dashboard/* — hanya untuk user yang sudah login
  // ============================================================
  if (pathname.startsWith('/dashboard')) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // User login → lanjut
    return NextResponse.next();
  }

  // ============================================================
  // PROTEKSI: /admin/* — hanya untuk role ADMIN
  // ============================================================
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userRole !== 'ADMIN') {
      // User bukan admin → redirect ke dashboard customer
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  }

  // ============================================================
  // PROTEKSI: /api/admin/* — hanya untuk role ADMIN (API)
  // ============================================================
  if (pathname.startsWith('/api/admin')) {
    if (!isLoggedIn || userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // ============================================================
  // REDIRECT: Auth pages → jika sudah login, redirect ke panel
  // ============================================================
  const authPages = ['/login', '/register', '/forgot-password', '/reset-password'];
  if (authPages.includes(pathname)) {
    if (isLoggedIn) {
      const redirectUrl = userRole === 'ADMIN' ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
};
