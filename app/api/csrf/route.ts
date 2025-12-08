import { NextRequest, NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/security';

/**
 * GET /api/csrf
 * Generate and return a CSRF token
 */
export async function GET(request: NextRequest) {
  const token = generateCsrfToken();

  const response = NextResponse.json({
    ok: true,
    csrfToken: token,
  });

  // Set CSRF token in a cookie
  response.cookies.set('csrf_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });

  return response;
}
