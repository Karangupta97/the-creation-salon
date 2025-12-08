import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/services/auth.service';
import { getClientIp, getUserAgent } from '@/lib/request-utils';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          ok: false,
          error: 'No refresh token provided',
        },
        { status: 401 }
      );
    }

    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    // Refresh access token
    const result = await refreshAccessToken(refreshToken, ipAddress, userAgent);

    if (!result.success) {
      // Clear cookies on failure
      const response = NextResponse.json(
        {
          ok: false,
          error: result.error,
        },
        { status: 401 }
      );

      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');

      return response;
    }

    // Create response with new access token cookie
    const response = NextResponse.json(
      {
        ok: true,
        expiresAt: result.expiresAt.toISOString(),
      },
      { status: 200 }
    );

    // Set new access token cookie
    response.cookies.set('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    return response;
  } catch (error) {
    logger.error({ error }, 'Unexpected error in refresh route');

    return NextResponse.json(
      {
        ok: false,
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
