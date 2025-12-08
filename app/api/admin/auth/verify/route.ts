import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import logger from '@/lib/logger';

/**
 * GET /api/admin/auth/verify
 * Verify if the current access token is valid
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          ok: false,
          error: 'No access token provided',
        },
        { status: 401 }
      );
    }

    // Verify the access token
    const payload = await verifyAccessToken(accessToken);

    if (!payload) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid or expired token',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          roles: payload.roles,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ error }, 'Error verifying token');
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
