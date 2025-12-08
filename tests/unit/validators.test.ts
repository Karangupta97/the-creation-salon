import { describe, it, expect } from 'vitest';
import { loginSchema } from '@/lib/validators/auth.validator';

describe('Auth Validators', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'admin@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('admin@example.com');
        expect(result.data.password).toBe('password123');
      }
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email');
      }
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'admin@example.com',
        password: 'short',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8 characters');
      }
    });

    it('should reject missing email', () => {
      const invalidData = {
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'admin@example.com',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should lowercase and trim email', () => {
      const data = {
        email: '  ADMIN@EXAMPLE.COM  ',
        password: 'password123',
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('admin@example.com');
      }
    });
  });
});
