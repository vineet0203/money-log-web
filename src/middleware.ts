import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const isClearRequested =
    searchParams.has('clear') || searchParams.has('unauthorized') || searchParams.has('logout');

  // Handle explicit clear/logout request
  if (isClearRequested) {
    // If accessing an auth page with clear flag, delete cookies and allow page to render directly
    if (
      pathname.startsWith('/login') ||
      pathname.startsWith('/signup') ||
      pathname.startsWith('/forgot-password') ||
      pathname.startsWith('/reset-password') ||
      pathname.startsWith('/verify-email')
    ) {
      const response = NextResponse.next();
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }
    // If clear was triggered on any other page, redirect to /login and strip cookies
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
  }

  // Read the HttpOnly cookie that our backend sets
  const hasToken = request.cookies.has('accessToken') || request.cookies.has('refreshToken');

  // Define route groupings
  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/verify-email');
  
  // Define protected routes (dashboard group)
  // These are routes that absolutely require authentication
  const protectedPrefixes = [
    '/dashboard',
    '/overview',
    '/transactions',
    '/subscriptions',
    '/payables',
    '/budget',
    '/goals',
    '/notifications',
    '/profile',
    '/settings',
    '/account',
    '/pos'
  ];
  
  const isProtectedRoute = protectedPrefixes.some(prefix => 
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // Logic 1: Unauthenticated users trying to access protected routes -> redirect to login
  if (isProtectedRoute && !hasToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Logic 2: Authenticated users trying to access auth pages (login) -> redirect to dashboard
  if (isAuthRoute && hasToken && !isClearRequested) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Allow all other requests (like the root '/' marketing page) to pass through independently
  return NextResponse.next();
}

export const config = {
  // Apply middleware to all paths except static files, api routes, and Next.js internals
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo|.*\\.png$).*)'],
};
