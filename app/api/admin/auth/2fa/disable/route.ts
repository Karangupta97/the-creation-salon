import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import { getClientIp } from '@/lib/request-utils';
import { createAuditLog } from '@/services/auth.service';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Get access token from cookies
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const payload = await verifyAccessToken(accessToken);

    // Disable 2FA
    await prisma.admin.update({
      where: { id: payload.sub },
      data: {
        twoFactorEnabled: false,
        totpSecret: null,
        totpBackupCodes: [],
      },
    });

    // Audit log
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    await createAuditLog({
      email: payload.email,
      ipAddress,
      userAgent,
      action: '2FA_DISABLED',
      metadata: { adminId: payload.sub },
    });

    logger.info({ adminId: payload.sub }, '2FA disabled');

    return NextResponse.json({ ok: true, message: '2FA disabled successfully' });
  } catch (error) {
    logger.error({ error }, 'Error disabling 2FA');
    return NextResponse.json(
      { ok: false, error: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}
