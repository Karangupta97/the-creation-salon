import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';
import logger from '@/lib/logger';
import { getClientIp } from '@/lib/request-utils';
import { createAuditLog } from '@/services/auth.service';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ ok: false, error: 'Email is required' }, { status: 400 });
    }

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    // For security, always return success even if email doesn't exist
    // This prevents email enumeration attacks
    if (!admin) {
      logger.warn({ email }, 'Password reset requested for non-existent email');
      return NextResponse.json({
        ok: true,
        message: 'If an account exists with that email, a reset link has been sent',
      });
    }

    // Generate reset token
    const resetToken = nanoid(64);
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Audit log
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    await createAuditLog({
      email,
      ipAddress,
      userAgent,
      action: 'PASSWORD_RESET_REQUESTED',
      metadata: { adminId: admin.id },
    });

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(email, resetToken);

    if (emailSent) {
      logger.info({ adminId: admin.id, email }, 'Password reset email sent successfully');
    } else {
      logger.warn({ adminId: admin.id, email }, 'Failed to send password reset email');
      // Still return success to prevent email enumeration
    }

    return NextResponse.json({
      ok: true,
      message: 'If an account exists with that email, a reset link has been sent',
    });
  } catch (error) {
    logger.error({ error }, 'Error processing forgot password request');
    return NextResponse.json({ ok: false, error: 'Failed to process request' }, { status: 500 });
  }
}
