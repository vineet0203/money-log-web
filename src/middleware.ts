import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Emergency killswitch to break out of infinite redirect loops
  if (searchParams.has('clear')) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
  }

  // Read the HttpOnly cookie that our backend sets
  const hasToken = request.cookies.has('accessToken') || request.cookies.has('refreshToken');

  // Define route groupings
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/verify-otp');
  
  // Define protected routes (dashboard group)
  // These are routes that absolutely require authentication
  const protectedPrefixes = [
    '/dashboard',
    '/overview',
    '/transactions',
    '/subscriptions',
    '/acc-manage',
    '/payables',
    '/budget',
    '/goals',
    '/complete-profile'
  ];
  
  const isProtectedRoute = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

  // Logic 1: Unauthenticated users trying to access protected routes -> redirect to login
  if (isProtectedRoute && !hasToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Logic 2: Authenticated users trying to access auth pages (login) -> redirect to dashboard
  if (isAuthRoute && hasToken) {
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
