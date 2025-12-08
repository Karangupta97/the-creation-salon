import { describe, it, expect } from 'vitest';
import { generateTokenPair, verifyAccessToken, verifyRefreshToken } from '@/lib/jwt';

describe('JWT Utils', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'admin@example.com',
    name: 'Admin User',
    roles: ['admin'],
  };

  describe('generateTokenPair', () => {
    it('should generate access and refresh tokens', async () => {
      const tokens = await generateTokenPair(mockUser);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.refreshTokenJti).toBeDefined();
      expect(tokens.expiresAt).toBeInstanceOf(Date);
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should set expiresAt to 15 minutes from now', async () => {
      const before = new Date(Date.now() + 14 * 60 * 1000);
      const tokens = await generateTokenPair(mockUser);
      const after = new Date(Date.now() + 16 * 60 * 1000);

      expect(tokens.expiresAt.getTime()).toBeGreaterThan(before.getTime());
      expect(tokens.expiresAt.getTime()).toBeLessThan(after.getTime());
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', async () => {
      const tokens = await generateTokenPair(mockUser);
      const payload = await verifyAccessToken(tokens.accessToken);

      expect(payload.sub).toBe(mockUser.id);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.name).toBe(mockUser.name);
      expect(payload.roles).toEqual(mockUser.roles);
      expect(payload.type).toBe('access');
    });

    it('should reject refresh token as access token', async () => {
      const tokens = await generateTokenPair(mockUser);

      await expect(verifyAccessToken(tokens.refreshToken)).rejects.toThrow('Invalid token type');
    });

    it('should reject invalid token', async () => {
      await expect(verifyAccessToken('invalid-token')).rejects.toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', async () => {
      const tokens = await generateTokenPair(mockUser);
      const payload = await verifyRefreshToken(tokens.refreshToken);

      expect(payload.sub).toBe(mockUser.id);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.type).toBe('refresh');
      expect(payload.jti).toBeDefined();
    });

    it('should reject access token as refresh token', async () => {
      const tokens = await generateTokenPair(mockUser);

      await expect(verifyRefreshToken(tokens.accessToken)).rejects.toThrow('Invalid token type');
    });
  });
});
