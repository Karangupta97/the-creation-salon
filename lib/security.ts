import { NextRequest } from 'next/server';

/**
 * Check if IP address is in whitelist
 * Note: Uses environment variable because middleware runs in Edge Runtime
 * Config file loading (fs/path) is not supported in Edge Runtime
 */
export function isIpWhitelisted(clientIp: string): boolean {
  const whitelist = process.env.ADMIN_IP_WHITELIST?.trim();

  // Normalize IPv4-mapped IPv6 addresses (::ffff:192.168.0.101 -> 192.168.0.101)
  let normalizedIp = clientIp;
  if (clientIp.startsWith('::ffff:')) {
    normalizedIp = clientIp.substring(7);
  }

  // Debug logging
  console.log('🔍 IP Whitelist Debug:', {
    originalIp: clientIp,
    normalizedIp,
    hasWhitelist: !!whitelist,
    whitelistValue: whitelist || 'none (allowing all)',
  });

  // If no whitelist configured, allow all (with warning)
  if (!whitelist) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '⚠️ SECURITY WARNING: No IP whitelist configured in production - all IPs allowed. Set ADMIN_IP_WHITELIST to restrict access.'
      );
    } else {
      console.log('⚠️ No IP whitelist configured - allowing all IPs (development mode)');
    }
    return true;
  }

  const allowedIps = whitelist
    .split(',')
    .map((ip: string) => ip.trim())
    .filter(Boolean);

  console.log('📋 Allowed IPs:', allowedIps);

  // Check if normalized IP is in the whitelist
  const isAllowed = allowedIps.some((allowedIp: string) => {
    // Support wildcard
    if (allowedIp === '*') return true;

    // Exact match (check both original and normalized)
    return clientIp === allowedIp || normalizedIp === allowedIp;
  });

  console.log('✅ IP Check Result:', { originalIp: clientIp, normalizedIp, isAllowed });
  return isAllowed;
}

/**
 * Enforce HTTPS in production
 */
export function enforceHttps(request: NextRequest): Response | null {
  // Skip in development
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  const proto = request.headers.get('x-forwarded-proto');
  const host = request.headers.get('host');

  if (proto !== 'https') {
    const httpsUrl = `https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`;
    return Response.redirect(httpsUrl, 301);
  }

  return null;
}

/**
 * Generate CSRF token (Edge Runtime compatible)
 */
export function generateCsrfToken(): string {
  // Use crypto.randomUUID() which is available in Edge Runtime
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
}

/**
 * Verify CSRF token (constant-time comparison)
 */
export function verifyCsrfToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) {
    console.log('🔒 CSRF Debug - Missing tokens:', {
      hasToken: !!token,
      hasExpectedToken: !!expectedToken,
    });
    return false;
  }

  if (token.length !== expectedToken.length) {
    console.log('🔒 CSRF Debug - Length mismatch:', {
      tokenLength: token.length,
      expectedLength: expectedToken.length,
    });
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }

  const isValid = result === 0;
  console.log('🔒 CSRF Debug - Comparison result:', {
    isValid,
    headerToken: token.substring(0, 10) + '...',
    cookieToken: expectedToken.substring(0, 10) + '...',
  });

  return isValid;
}

/**
 * Get security headers
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Enable XSS protection
    'X-XSS-Protection': '1; mode=block',

    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval and unsafe-inline
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),

    // Strict Transport Security (HSTS)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // Permissions Policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}
