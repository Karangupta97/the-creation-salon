import { NextRequest, NextResponse } from 'next/server';
import { logoutAdmin } from '@/services/auth.service';
import { getClientIp, getUserAgent } from '@/lib/request-utils';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value;
    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    // Logout and revoke refresh token
    await logoutAdmin(refreshToken, ipAddress, userAgent);

    // Clear cookies
    const response = NextResponse.json(
      {
        ok: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');

    return response;
  } catch (error) {
    logger.error({ error }, 'Unexpected error in logout route');

    // Still clear cookies even on error
    const response = NextResponse.json(
      {
        ok: false,
        error: 'An error occurred during logout',
      },
      { status: 500 }
    );

    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');

    return response;
  }
}
