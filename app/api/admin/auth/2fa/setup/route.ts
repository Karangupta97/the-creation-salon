import { NextRequest, NextResponse } from 'next/server';
import { generateTotpSecret, generateTotpQrCode, generateBackupCodes } from '@/lib/totp';
import { verifyAccessToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import { hash } from 'bcrypt';
import logger from '@/lib/logger';

/**
 * POST /api/admin/auth/2fa/setup
 * Generate 2FA setup QR code and backup codes
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

    // Get admin user
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Generate TOTP secret
    const totpSecret = generateTotpSecret();

    // Generate QR code
    const qrCodeDataUrl = await generateTotpQrCode(admin.email, totpSecret);

    // Generate backup codes
    const backupCodes = generateBackupCodes(8);
    const hashedBackupCodes = await Promise.all(backupCodes.map((code) => hash(code, 10)));

    // Store the secret temporarily (not enabled until verified)
    await prisma.admin.update({
      where: { id: adminId },
      data: {
        totpSecret,
        // Store backup codes
        totpBackupCodes: hashedBackupCodes,
      },
    });

    logger.info({ adminId, email: admin.email }, '2FA setup initiated');

    return NextResponse.json({
      ok: true,
      qrCode: qrCodeDataUrl,
      secret: totpSecret, // Show for manual entry
      backupCodes, // Show once, user must save them
    });
  } catch (error) {
    logger.error({ error }, 'Error setting up 2FA');
    return NextResponse.json({ ok: false, error: 'Failed to setup 2FA' }, { status: 500 });
  }
}
