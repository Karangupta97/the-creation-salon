import { NextRequest } from 'next/server';

/**
 * Get client IP address from request
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // For localhost/development
  // In development, Next.js doesn't provide IP in headers
  // Default to localhost
  return '127.0.0.1';
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  const allowedOrigins = (
    process.env.ALLOWED_ORIGINS ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'
  )
    .split(',')
    .map((o) => o.trim());

  return allowedOrigins.includes(origin);
}

/**
 * Get CSRF token from cookies
 */
export function getCsrfToken(request: NextRequest): string | undefined {
  return request.cookies.get('csrf-token')?.value;
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(request: NextRequest): boolean {
  const cookieToken = getCsrfToken(request);
  const headerToken = request.headers.get('x-csrf-token');

  if (!cookieToken || !headerToken) {
    return false;
  }

  return cookieToken === headerToken;
}
