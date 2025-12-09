import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validators/auth.validator';
import { authenticateAdmin } from '@/services/auth.service';
import { getClientIp, getUserAgent } from '@/lib/request-utils';
import { verifyCsrfToken } from '@/lib/security';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Verify CSRF token
    const csrfTokenFromHeader = request.headers.get('x-csrf-token');
    const csrfTokenFromCookie = request.cookies.get('csrf-token')?.value;

    if (
      !csrfTokenFromHeader ||
      !csrfTokenFromCookie ||
      !verifyCsrfToken(csrfTokenFromHeader, csrfTokenFromCookie)
    ) {
      logger.warn('CSRF token validation failed');
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid CSRF token',
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Validation failed',
          details: validation.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    // Authenticate admin
    const result = await authenticateAdmin(email, password, ipAddress, userAgent);

    if (!result.success) {
      const status = result.lockoutDuration ? 423 : 401;
      return NextResponse.json(
        {
          ok: false,
          error: result.error,
          ...(result.lockoutDuration && { lockoutDuration: result.lockoutDuration }),
        },
        { status }
      );
    }

    // Check if 2FA is required
    if (result.requires2FA) {
      return NextResponse.json(
        {
          ok: true,
          requires2FA: true,
          user: result.user,
        },
        { status: 200 }
      );
    }

    // Create response with cookies (only if 2FA not required)
    const response = NextResponse.json(
      {
        ok: true,
        user: result.user,
        expiresAt: result.tokens!.expiresAt.toISOString(),
      },
      { status: 200 }
    );

    // Set access token cookie (HttpOnly, Secure, SameSite=Strict)
    response.cookies.set('access_token', result.tokens!.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60, // 60 minutes
    });

    // Set refresh token cookie (HttpOnly, Secure, SameSite=Strict)
    response.cookies.set('refresh_token', result.tokens!.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    logger.error({ error }, 'Unexpected error in login route');

    return NextResponse.json(
      {
        ok: false,
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
