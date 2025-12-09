import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hash } from 'bcrypt';
import { authenticateAdmin, createAuditLog } from '@/services/auth.service';
import prisma from '@/lib/prisma';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  default: {
    admin: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    session: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    authAuditLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/rate-limit', () => ({
  ipRateLimiter: {
    limit: vi.fn().mockResolvedValue({ success: true, remaining: 4, reset: Date.now() + 900000 }),
  },
  accountRateLimiter: {
    limit: vi.fn().mockResolvedValue({ success: true, remaining: 4, reset: Date.now() + 900000 }),
  },
}));

vi.mock('@/lib/sentry', () => ({
  reportFailedLoginSpike: vi.fn(),
  reportAccountLockout: vi.fn(),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAuditLog', () => {
    it('should create audit log entry', async () => {
      const logData = {
        email: 'admin@example.com',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser',
        action: 'LOGIN_SUCCESS',
        metadata: { adminId: 'test-id' },
      };

      await createAuditLog(logData);

      expect(prisma.authAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: logData.email,
          ipAddress: logData.ipAddress,
          action: logData.action,
        }),
      });
    });
  });

  describe('authenticateAdmin', () => {
    it('should successfully authenticate valid credentials', async () => {
      const password = 'TestPassword123';
      const passwordHash = await hash(password, 10);

      const mockAdmin = {
        id: 'admin-id',
        email: 'admin@example.com',
        passwordHash,
        name: 'Admin User',
        roles: ['admin'],
        isActive: true,
        isLocked: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.admin.findUnique).mockResolvedValue(mockAdmin);
      vi.mocked(prisma.admin.update).mockResolvedValue(mockAdmin);
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({
        id: 'token-id',
        token: 'refresh-token',
        jti: 'jti-123',
        adminId: mockAdmin.id,
        expiresAt: new Date(),
        isRevoked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.session.create).mockResolvedValue({
        id: 'session-id',
        adminId: mockAdmin.id,
        token: 'session-token',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser',
        deviceInfo: null,
        isRevoked: false,
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authenticateAdmin(
        'admin@example.com',
        password,
        '127.0.0.1',
        'Test Browser'
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.user.email).toBe('admin@example.com');
        expect(result.tokens.accessToken).toBeDefined();
        expect(result.tokens.refreshToken).toBeDefined();
      }
    });

    it('should fail with invalid password', async () => {
      const passwordHash = await hash('CorrectPassword123', 10);

      const mockAdmin = {
        id: 'admin-id',
        email: 'admin@example.com',
        passwordHash,
        name: 'Admin User',
        roles: ['admin'],
        isActive: true,
        isLocked: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.admin.findUnique).mockResolvedValue(mockAdmin);
      vi.mocked(prisma.admin.update).mockResolvedValue(mockAdmin);

      const result = await authenticateAdmin(
        'admin@example.com',
        'WrongPassword',
        '127.0.0.1',
        'Test Browser'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid credentials');
      }
    });

    it('should fail for non-existent user', async () => {
      vi.mocked(prisma.admin.findUnique).mockResolvedValue(null);

      const result = await authenticateAdmin(
        'nonexistent@example.com',
        'password123',
        '127.0.0.1',
        'Test Browser'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid credentials');
      }
    });

    it('should fail for inactive account', async () => {
      const mockAdmin = {
        id: 'admin-id',
        email: 'admin@example.com',
        passwordHash: await hash('password123', 10),
        name: 'Admin User',
        roles: ['admin'],
        isActive: false, // Inactive
        isLocked: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.admin.findUnique).mockResolvedValue(mockAdmin);

      const result = await authenticateAdmin(
        'admin@example.com',
        'password123',
        '127.0.0.1',
        'Test Browser'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Account is inactive');
      }
    });

    it('should fail for locked account', async () => {
      const mockAdmin = {
        id: 'admin-id',
        email: 'admin@example.com',
        passwordHash: await hash('password123', 10),
        name: 'Admin User',
        roles: ['admin'],
        isActive: true,
        isLocked: true,
        failedLoginAttempts: 5,
        lockedUntil: new Date(Date.now() + 30 * 60 * 1000), // Locked for 30 minutes
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.admin.findUnique).mockResolvedValue(mockAdmin);

      const result = await authenticateAdmin(
        'admin@example.com',
        'password123',
        '127.0.0.1',
        'Test Browser'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Account is locked');
        expect(result.lockoutDuration).toBeDefined();
      }
    });
  });
});
