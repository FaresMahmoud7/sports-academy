import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Protect administrative routes
  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/players') ||
    pathname.startsWith('/coaches') ||
    pathname.startsWith('/categories') ||
    pathname.startsWith('/import') ||
    pathname.startsWith('/settings');

  if (isProtectedPath) {
    if (!token) {
      // Redirect to landing page with login query parameter
      const loginUrl = new URL('/?login=true', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect logged-in admin away from login page if they attempt to access it
  if (pathname === '/login') {
    if (token) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo.jpg).*)',
  ],
};
