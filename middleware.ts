import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { enforceHttps, getSecurityHeaders, isIpWhitelisted } from '@/lib/security';
import { getClientIp } from '@/lib/request-utils';
import logger from '@/lib/logger';

// Define protected routes that require authentication
const protectedPaths = ['/admin'];
const publicPaths = ['/admin/login', '/admin/forgot-password', '/admin/reset-password']; // Public admin paths
const authPaths = [
  '/api/admin/auth/login',
  '/api/admin/auth/refresh',
  '/api/admin/auth/logout',
  '/api/admin/auth/forgot-password',
  '/api/admin/auth/reset-password',
  '/api/csrf'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Enforce HTTPS in production
  const httpsRedirect = enforceHttps(request);
  if (httpsRedirect) {
    return httpsRedirect;
  }

  // Skip auth API paths and CSRF (these need to work before IP whitelist check)
  if (authPaths.some((path) => pathname.startsWith(path))) {
    const response = NextResponse.next();
    
    // Add security headers
    const headers = getSecurityHeaders();
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value as string);
    });
    
    return response;
  }

  // Check IP whitelist for admin routes (after allowing auth endpoints)
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const clientIp = getClientIp(request);
    
    if (!isIpWhitelisted(clientIp)) {
      logger.warn({ ip: clientIp, pathname }, 'Blocked request from non-whitelisted IP');
      
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { ok: false, error: 'Access denied' },
          { status: 403 }
        );
      }
      
      return new NextResponse('Access Denied', { status: 403 });
    }
  }

  // Handle login page - redirect to dashboard if already logged in
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    const accessToken = request.cookies.get('access_token')?.value;
    
    if (accessToken) {
      try {
        // Verify token is valid
        await verifyAccessToken(accessToken);
        // If valid, redirect to dashboard
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } catch {
        // Token invalid, allow access to login page
      }
    }
    
    const response = NextResponse.next();
    
    // Add security headers
    const headers = getSecurityHeaders();
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value as string);
    });
    
    return response;
  }

  // Check if path is protected
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // Get access token from cookies
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    logger.warn({ pathname }, 'Access attempt without token');

    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // For pages, redirect to admin login
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify access token
    const payload = await verifyAccessToken(accessToken);

    // Check if user has admin role
    if (!payload.roles.includes('admin')) {
      logger.warn({ userId: payload.sub, pathname }, 'Access denied: missing admin role');

      // For API routes, return 403
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { ok: false, error: 'Forbidden: Admin access required' },
          { status: 403 }
        );
      }

      // For pages, redirect to unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Add user info to request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.sub);
    requestHeaders.set('x-user-email', payload.email);
    requestHeaders.set('x-user-roles', payload.roles.join(','));

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Add security headers
    const headers = getSecurityHeaders();
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value as string);
    });

    return response;
  } catch (error) {
    logger.warn({ error, pathname }, 'Invalid or expired token');

    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      );
    }

    // For pages, redirect to admin login
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
