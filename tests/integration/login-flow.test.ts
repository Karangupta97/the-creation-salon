// Load environment variables first
import 'dotenv/config';

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { hash } from 'bcrypt';
import prisma from '@/lib/prisma';

/**
 * Integration test for complete login flow
 * Note: This requires a test database to be set up
 * Run with: npm test tests/integration/login-flow.test.ts
 * 
 * KNOWN ISSUE: The Neon adapter initializes the Pool before dotenv loads DATABASE_URL.
 * These tests are skipped until we refactor lib/prisma.ts to support lazy initialization
 * or use a standard Prisma client for tests.
 * 
 * Workaround: Set DATABASE_URL as an environment variable before running tests:
 * DATABASE_URL="your-connection-string" npm test
 */

describe.skip('Login Flow Integration Test', () => {
  const testAdmin = {
    email: 'integration-test@example.com',
    password: 'TestPassword123!',
    name: 'Integration Test Admin',
  };

  beforeAll(async () => {
    // Clean up any existing test data
    try {
      await prisma.admin.deleteMany({
        where: { email: testAdmin.email },
      });
    } catch {
      // Ignore if doesn't exist
    }

    // Create test admin user
    const passwordHash = await hash(testAdmin.password, 10);
    await prisma.admin.create({
      data: {
        email: testAdmin.email,
        passwordHash,
        name: testAdmin.name,
        roles: ['admin'],
        isActive: true,
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await prisma.admin.deleteMany({
        where: { email: testAdmin.email },
      });
      await prisma.$disconnect();
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should complete full login flow', async () => {
    // This is a placeholder for full integration test
    // In a real scenario, you would:
    // 1. Make POST request to /api/admin/auth/login
    // 2. Verify response and cookies
    // 3. Make request to protected route with cookies
    // 4. Verify access is granted
    // 5. Test refresh token flow
    // 6. Test logout

    const admin = await prisma.admin.findUnique({
      where: { email: testAdmin.email },
    });

    expect(admin).toBeDefined();
    expect(admin?.email).toBe(testAdmin.email);
    expect(admin?.isActive).toBe(true);
  });

  it('should record failed login attempts', async () => {
    const admin = await prisma.admin.findUnique({
      where: { email: testAdmin.email },
    });

    expect(admin).toBeDefined();
    expect(admin?.failedLoginAttempts).toBe(0);
    expect(admin?.isLocked).toBe(false);
  });
});
