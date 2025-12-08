import { beforeAll, afterAll } from 'vitest';

// Setup test environment
beforeAll(() => {
  // Set environment variables for testing
  process.env.DATABASE_URL =
    process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
  process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes-only';
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  process.env.LOG_LEVEL = 'silent';
});

afterAll(() => {
  // Cleanup
});
