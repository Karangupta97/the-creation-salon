import { compare } from 'bcrypt';
import prisma from '@/lib/prisma';
import { generateTokenPair } from '@/lib/jwt';
import { ipRateLimiter, accountRateLimiter } from '@/lib/rate-limit';
import logger from '@/lib/logger';
import { reportFailedLoginSpike, reportAccountLockout } from '@/lib/sentry';
import { createSession } from '@/lib/session';
import { sendSuspiciousLoginEmail } from '@/lib/email';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export type LoginResult =
  | {
    success: false;
    error: string;
    lockoutDuration?: number;
  }
  | {
    success: true;
    requires2FA?: boolean;
    user: {
      id: string;
      name: string;
      email: string;
      roles: string[];
    };
    tokens?: {
      accessToken: string;
      refreshToken: string;
      refreshTokenJti: string;
      expiresAt: Date;
    };
  };

export interface AuditLogData {
  email: string;
  ipAddress: string;
  userAgent?: string;
  action: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.authAuditLog.create({
      data: {
        adminId: data.metadata?.adminId as string | undefined,
        email: data.email,
        action: data.action,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        reason: data.reason,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
      },
    });
  } catch (error) {
    logger.error({ error, data }, 'Failed to create audit log');
  }
}

/**
 * Check if account is locked
 */
function isAccountLocked(admin: { isLocked: boolean; lockedUntil: Date | null }): boolean {
  if (!admin.isLocked) return false;

  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    return true;
  }

  return false;
}

/**
 * Reset failed login attempts
 */
async function resetFailedAttempts(adminId: string): Promise<void> {
  await prisma.admin.update({
    where: { id: adminId },
    data: {
      failedLoginAttempts: 0,
      isLocked: false,
      lockedUntil: null,
    },
  });
}

/**
 * Increment failed login attempts and lock account if needed
 */
async function incrementFailedAttempts(
  admin: { id: string; email: string; failedLoginAttempts: number },
  ipAddress: string
): Promise<{ locked: boolean; attempts: number }> {
  const attempts = admin.failedLoginAttempts + 1;

  if (attempts >= MAX_FAILED_ATTEMPTS) {
    const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        failedLoginAttempts: attempts,
        isLocked: true,
        lockedUntil,
      },
    });

    // Report to Sentry
    reportAccountLockout(
      admin.email,
      ipAddress,
      `Account locked after ${attempts} failed login attempts`
    );

    logger.warn(
      {
        adminId: admin.id,
        email: admin.email,
        attempts,
        lockedUntil,
      },
      'Account locked due to failed login attempts'
    );

    return { locked: true, attempts };
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      failedLoginAttempts: attempts,
    },
  });

  // Report spike to Sentry if approaching limit
  if (attempts >= MAX_FAILED_ATTEMPTS - 2) {
    reportFailedLoginSpike(admin.email, attempts, ipAddress);
  }

  return { locked: false, attempts };
}

/**
 * Authenticate admin user
 */
export async function authenticateAdmin(
  email: string,
  password: string,
  ipAddress: string,
  userAgent?: string
): Promise<LoginResult> {
  try {
    // Rate limit by IP
    const ipLimit = await ipRateLimiter.limit(ipAddress);
    if (!ipLimit.success) {
      logger.warn({ ipAddress }, 'IP rate limit exceeded');
      await createAuditLog({
        email,
        ipAddress,
        userAgent,
        action: 'LOGIN_FAILED',
        reason: 'IP_RATE_LIMIT_EXCEEDED',
      });

      return {
        success: false,
        error: 'Too many requests. Please try again later.',
      };
    }

    // Rate limit by account
    const accountLimit = await accountRateLimiter.limit(email);
    if (!accountLimit.success) {
      logger.warn({ email }, 'Account rate limit exceeded');
      await createAuditLog({
        email,
        ipAddress,
        userAgent,
        action: 'LOGIN_FAILED',
        reason: 'ACCOUNT_RATE_LIMIT_EXCEEDED',
      });

      return {
        success: false,
        error: 'Too many login attempts. Please try again later.',
      };
    }

    // Find admin user
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      logger.warn({ email }, 'Login attempt for non-existent admin');
      await createAuditLog({
        email,
        ipAddress,
        userAgent,
        action: 'LOGIN_FAILED',
        reason: 'INVALID_CREDENTIALS',
      });

      return {
        success: false,
        error: 'Invalid credentials',
      };
    }

    // Check if account is active
    if (!admin.isActive) {
      logger.warn({ adminId: admin.id, email }, 'Login attempt for inactive admin');
      await createAuditLog({
        email,
        ipAddress,
        userAgent,
        action: 'LOGIN_FAILED',
        reason: 'ACCOUNT_INACTIVE',
        metadata: { adminId: admin.id },
      });

      return {
        success: false,
        error: 'Account is inactive',
      };
    }

    // Check if account is locked
    if (isAccountLocked(admin)) {
      const remainingTime = admin.lockedUntil
        ? Math.ceil((admin.lockedUntil.getTime() - Date.now()) / 1000 / 60)
        : 30;

      logger.warn(
        { adminId: admin.id, email, lockedUntil: admin.lockedUntil },
        'Login attempt for locked admin'
      );
      await createAuditLog({
        email,
        ipAddress,
        userAgent,
        action: 'LOGIN_FAILED',
        reason: 'ACCOUNT_LOCKED',
        metadata: { adminId: admin.id, lockedUntil: admin.lockedUntil },
      });

      return {
        success: false,
        error: `Account is locked. Please try again in ${remainingTime} minutes.`,
        lockoutDuration: remainingTime,
      };
    }

    // Verify password
    const isPasswordValid = await compare(password, admin.passwordHash);

    if (!isPasswordValid) {
      logger.warn({ adminId: admin.id, email }, 'Invalid password attempt');

      const { locked, attempts } = await incrementFailedAttempts(admin, ipAddress);

      await createAuditLog({
        email,
        ipAddress,
        userAgent,
        action: locked ? 'ACCOUNT_LOCKED' : 'LOGIN_FAILED',
        reason: 'INVALID_PASSWORD',
        metadata: { adminId: admin.id, failedAttempts: attempts },
      });

      // Send suspicious login email after 3 failed attempts
      if (attempts >= 3) {
        await sendSuspiciousLoginEmail(
          admin.email,
          ipAddress,
          userAgent || 'Unknown',
          new Date()
        );
      }

      if (locked) {
        return {
          success: false,
          error: `Account locked due to too many failed attempts. Please try again in 30 minutes.`,
          lockoutDuration: 30,
        };
      }

      return {
        success: false,
        error: 'Invalid credentials',
      };
    }

    // Reset failed attempts on successful password verification
    if (admin.failedLoginAttempts > 0) {
      await resetFailedAttempts(admin.id);
    }

    // Check if 2FA is enabled
    if (admin.twoFactorEnabled) {
      logger.info({ adminId: admin.id, email }, 'Login requires 2FA');

      return {
        success: true,
        requires2FA: true,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          roles: admin.roles,
        },
      };
    }

    // Generate tokens
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
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Create session for tracking
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

    // Create audit log
    await createAuditLog({
      email,
      ipAddress,
      userAgent,
      action: 'LOGIN_SUCCESS',
      metadata: { adminId: admin.id },
    });

    logger.info({ adminId: admin.id, email }, 'Successful admin login');

    return {
      success: true,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        roles: admin.roles,
      },
      tokens,
    };
  } catch (error) {
    logger.error({ error, email }, 'Error during authentication');

    return {
      success: false,
      error: 'An error occurred during authentication',
    };
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
  ipAddress: string,
  userAgent?: string
): Promise<
  { success: true; accessToken: string; expiresAt: Date } | { success: false; error: string }
> {
  try {
    // Find refresh token in database
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { admin: true },
    });

    if (!tokenRecord || tokenRecord.isRevoked) {
      logger.warn(
        { refreshToken: refreshToken.substring(0, 20) },
        'Invalid or revoked refresh token'
      );
      return {
        success: false,
        error: 'Invalid refresh token',
      };
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      logger.warn({ jti: tokenRecord.jti }, 'Expired refresh token');
      return {
        success: false,
        error: 'Refresh token expired',
      };
    }

    // Check if admin is active
    if (!tokenRecord.admin.isActive) {
      logger.warn({ adminId: tokenRecord.admin.id }, 'Token refresh for inactive admin');
      return {
        success: false,
        error: 'Account is inactive',
      };
    }

    // Generate new access token
    const { generateAccessToken } = await import('@/lib/jwt');
    const accessToken = await generateAccessToken({
      sub: tokenRecord.admin.id,
      email: tokenRecord.admin.email,
      name: tokenRecord.admin.name,
      roles: tokenRecord.admin.roles,
    });

    // Create audit log
    await createAuditLog({
      email: tokenRecord.admin.email,
      ipAddress,
      userAgent,
      action: 'TOKEN_REFRESH',
      metadata: { adminId: tokenRecord.admin.id, jti: tokenRecord.jti },
    });

    logger.info({ adminId: tokenRecord.admin.id }, 'Access token refreshed');

    return {
      success: true,
      accessToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    };
  } catch (error) {
    logger.error({ error }, 'Error refreshing access token');

    return {
      success: false,
      error: 'Failed to refresh token',
    };
  }
}

/**
 * Logout user and revoke refresh token
 */
export async function logoutAdmin(
  refreshToken: string | undefined,
  ipAddress: string,
  userAgent?: string
): Promise<{ success: boolean }> {
  try {
    if (refreshToken) {
      const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { admin: true },
      });

      if (tokenRecord) {
        // Revoke refresh token
        await prisma.refreshToken.update({
          where: { id: tokenRecord.id },
          data: { isRevoked: true },
        });

        // Create audit log
        await createAuditLog({
          email: tokenRecord.admin.email,
          ipAddress,
          userAgent,
          action: 'LOGOUT',
          metadata: { adminId: tokenRecord.admin.id, jti: tokenRecord.jti },
        });

        logger.info({ adminId: tokenRecord.admin.id }, 'Admin logged out');
      }
    }

    return { success: true };
  } catch (error) {
    logger.error({ error }, 'Error during logout');
    return { success: false };
  }
}
