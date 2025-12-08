import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';
import { getClientIp } from '@/lib/request-utils';
import { createAuditLog } from '@/services/auth.service';
import { revokeAllSessions } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { ok: false, error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Find admin with valid reset token
    const admin = await prisma.admin.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!admin) {
      return NextResponse.json(
        { ok: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hash(password, 12);

    // Update password and clear reset token
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
        // Reset failed login attempts
        failedLoginAttempts: 0,
        isLocked: false,
        lockedUntil: null,
      },
    });

    // Revoke all existing refresh tokens for security
    await prisma.refreshToken.updateMany({
      where: { adminId: admin.id },
      data: { isRevoked: true },
    });

    // Revoke all sessions for security
    await revokeAllSessions(admin.id);

    // Audit log
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    await createAuditLog({
      email: admin.email,
      ipAddress,
      userAgent,
      action: 'PASSWORD_RESET_COMPLETED',
      metadata: { adminId: admin.id },
    });

    logger.info({ adminId: admin.id, email: admin.email }, 'Password reset completed');

    return NextResponse.json({
      ok: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    logger.error({ error }, 'Error resetting password');
    return NextResponse.json(
      { ok: false, error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
