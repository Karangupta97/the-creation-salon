import { NextRequest, NextResponse } from 'next/server';
import { verifyTotpToken } from '@/lib/totp';
import { verifyCsrfToken } from '@/lib/security';
import prisma from '@/lib/prisma';
import { compare } from 'bcrypt';
import logger from '@/lib/logger';
import { generateTokenPair } from '@/lib/jwt';
import { createSession } from '@/lib/session';
import { getClientIp, getUserAgent } from '@/lib/request-utils';

/**
 * POST /api/admin/auth/2fa/verify
 * Verify 2FA token during login
 */
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
      logger.warn('CSRF token validation failed on 2FA verify');
      return NextResponse.json({ ok: false, error: 'Invalid CSRF token' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, token, isBackupCode } = body;

    if (!userId || !token) {
      return NextResponse.json({ ok: false, error: 'User ID and token required' }, { status: 400 });
    }

    // Get admin user with 2FA details
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!admin || !admin.twoFactorEnabled || !admin.totpSecret) {
      return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    }

    let isValid = false;

    if (isBackupCode) {
      // Verify backup code
      if (!admin.totpBackupCodes || admin.totpBackupCodes.length === 0) {
        return NextResponse.json(
          { ok: false, error: 'No backup codes available' },
          { status: 400 }
        );
      }

      // Check each backup code
      for (const hashedCode of admin.totpBackupCodes) {
        if (await compare(token, hashedCode)) {
          isValid = true;

          // Remove used backup code
          const updatedCodes = admin.totpBackupCodes.filter((c) => c !== hashedCode);
          await prisma.admin.update({
            where: { id: admin.id },
            data: { totpBackupCodes: updatedCodes },
          });

          logger.info({ adminId: admin.id }, 'Backup code used for 2FA');
          break;
        }
      }
    } else {
      // Verify TOTP token
      isValid = verifyTotpToken(token, admin.totpSecret);
    }

    if (!isValid) {
      logger.warn({ adminId: admin.id, email: admin.email }, 'Invalid 2FA token');
      return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 400 });
    }

    logger.info({ adminId: admin.id, email: admin.email }, '2FA verification successful');

    // Generate tokens after successful 2FA
    const tokens = await generateTokenPair({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      roles: admin.roles,
    });

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        jti: tokens.refreshTokenJti,
        adminId: admin.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Create session for tracking
    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    await createSession({
      adminId: admin.id,
      ipAddress,
      userAgent,
    });

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: new Date(),
      },
    });

    // Create response with cookies
    const response = NextResponse.json({
      ok: true,
      message: '2FA verified successfully',
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        roles: admin.roles,
      },
      expiresAt: tokens.expiresAt.toISOString(),
    });

    // Set access token cookie
    response.cookies.set('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    // Set refresh token cookie
    response.cookies.set('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    logger.error({ error }, 'Error verifying 2FA');
    return NextResponse.json({ ok: false, error: 'Failed to verify 2FA' }, { status: 500 });
  }
}
