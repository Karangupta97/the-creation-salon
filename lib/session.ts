import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';
import logger from '@/lib/logger';

export interface SessionData {
  adminId: string;
  ipAddress: string;
  userAgent?: string;
}

/**
 * Create a new session
 */
export async function createSession(data: SessionData) {
  try {
    const sessionToken = nanoid(64);
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

    // Parse user agent for device info
    const deviceInfo = parseUserAgent(data.userAgent);

    const session = await prisma.session.create({
      data: {
        adminId: data.adminId,
        token: sessionToken,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        deviceInfo,
        expiresAt,
      },
    });

    logger.info({ adminId: data.adminId, sessionId: session.id }, 'Session created');

    return session;
  } catch (error) {
    logger.error({ error, adminId: data.adminId }, 'Failed to create session');
    throw error;
  }
}

/**
 * Get active sessions for an admin
 */
export async function getActiveSessions(adminId: string) {
  return prisma.session.findMany({
    where: {
      adminId,
      isRevoked: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      lastActivity: 'desc',
    },
  });
}

/**
 * Revoke a specific session
 */
export async function revokeSession(sessionId: string, adminId: string) {
  try {
    await prisma.session.update({
      where: {
        id: sessionId,
        adminId, // Ensure admin can only revoke their own sessions
      },
      data: {
        isRevoked: true,
      },
    });

    logger.info({ sessionId, adminId }, 'Session revoked');
    return true;
  } catch (error) {
    logger.error({ error, sessionId, adminId }, 'Failed to revoke session');
    return false;
  }
}

/**
 * Revoke all sessions for an admin (except optionally the current one)
 */
export async function revokeAllSessions(adminId: string, exceptSessionId?: string) {
  try {
    await prisma.session.updateMany({
      where: {
        adminId,
        isRevoked: false,
        ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
      },
      data: {
        isRevoked: true,
      },
    });

    logger.info({ adminId, exceptSessionId }, 'All sessions revoked');
    return true;
  } catch (error) {
    logger.error({ error, adminId }, 'Failed to revoke all sessions');
    return false;
  }
}

/**
 * Update session last activity
 */
export async function updateSessionActivity(sessionToken: string) {
  try {
    await prisma.session.update({
      where: { token: sessionToken },
      data: { lastActivity: new Date() },
    });
  } catch (error) {
    logger.error(
      { error, sessionToken: sessionToken.substring(0, 10) },
      'Failed to update session activity'
    );
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions() {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    logger.info({ count: result.count }, 'Expired sessions cleaned up');
    return result.count;
  } catch (error) {
    logger.error({ error }, 'Failed to cleanup expired sessions');
    return 0;
  }
}

/**
 * Parse user agent to extract device info
 */
function parseUserAgent(userAgent?: string): string {
  if (!userAgent) return 'Unknown Device';

  // Simple parser - you can use a library like ua-parser-js for better results
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  // Detect browser
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  // Detect OS
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';

  return `${browser} on ${os}`;
}
