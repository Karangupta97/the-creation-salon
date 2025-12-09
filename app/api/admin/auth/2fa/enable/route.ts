import { NextRequest, NextResponse } from 'next/server';
import { verifyTotpToken } from '@/lib/totp';
import { verifyAccessToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';
import { send2FAEnabledEmail } from '@/lib/email';
import { getUserAgent } from '@/lib/request-utils';

/**
 * POST /api/admin/auth/2fa/enable
 * Enable 2FA after verifying a valid token
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const accessToken = request.cookies.get('access_token')?.value;
    if (!accessToken) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAccessToken(accessToken);
    const adminId = payload.sub;

    // Get request body
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ ok: false, error: 'Token required' }, { status: 400 });
    }

    // Get admin user
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin || !admin.totpSecret) {
      return NextResponse.json(
        { ok: false, error: 'No 2FA setup found. Please setup 2FA first.' },
        { status: 400 }
      );
    }

    // Verify the token
    const isValid = verifyTotpToken(token, admin.totpSecret);

    if (!isValid) {
      logger.warn({ adminId }, 'Invalid 2FA token during enable');
      return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 400 });
    }

    // Enable 2FA
    await prisma.admin.update({
      where: { id: adminId },
      data: {
        twoFactorEnabled: true,
      },
    });

    logger.info({ adminId, email: admin.email }, '2FA enabled successfully');

    // Send notification email
    const userAgent = getUserAgent(request);
    await send2FAEnabledEmail(admin.email, userAgent);

    return NextResponse.json({
      ok: true,
      message: '2FA enabled successfully',
    });
  } catch (error) {
    logger.error({ error }, 'Error enabling 2FA');
    return NextResponse.json({ ok: false, error: 'Failed to enable 2FA' }, { status: 500 });
  }
}
