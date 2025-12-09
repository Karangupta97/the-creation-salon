import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import logger from './logger';

// Initialize Redis client
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/**
 * Tiered rate limiters for different endpoint sensitivities
 */

// Critical endpoints: Login, password reset
export const criticalRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes
      analytics: true,
      prefix: 'ratelimit:critical',
    })
  : null;

// Sensitive endpoints: 2FA setup, session management
export const sensitiveRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '15 m'), // 10 requests per 15 minutes
      analytics: true,
      prefix: 'ratelimit:sensitive',
    })
  : null;

// Standard endpoints: Dashboard access, data fetching
export const standardRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
      analytics: true,
      prefix: 'ratelimit:standard',
    })
  : null;

// Public endpoints: Health checks, static assets
export const publicRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
      analytics: true,
      prefix: 'ratelimit:public',
    })
  : null;

// Per-account rate limiting (prevents credential stuffing)
export const perAccountRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '5 m'), // 3 attempts per 5 minutes per account
      analytics: true,
      prefix: 'ratelimit:account',
    })
  : null;

// Global rate limiter (circuit breaker for DDoS)
export const globalRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1000, '1 m'), // 1000 requests per minute globally
      analytics: true,
      prefix: 'ratelimit:global',
    })
  : null;

/**
 * In-memory fallback when Redis is unavailable
 */
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function inMemoryRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || record.resetAt < now) {
    // Create new window
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: now + windowMs,
    };
  }

  if (record.count >= maxRequests) {
    // Rate limit exceeded
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: record.resetAt,
    };
  }

  // Increment counter
  record.count++;
  memoryStore.set(key, record);

  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - record.count,
    reset: record.resetAt,
  };
}

/**
 * Apply rate limiting with automatic fallback
 */
export async function applyRateLimit(
  identifier: string,
  tier: 'critical' | 'sensitive' | 'standard' | 'public' = 'standard'
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const limiters = {
    critical: { limiter: criticalRateLimiter, max: 5, window: 15 * 60 * 1000 },
    sensitive: { limiter: sensitiveRateLimiter, max: 10, window: 15 * 60 * 1000 },
    standard: { limiter: standardRateLimiter, max: 60, window: 60 * 1000 },
    public: { limiter: publicRateLimiter, max: 100, window: 60 * 1000 },
  };

  const { limiter, max, window } = limiters[tier];

  // Try Upstash Redis first
  if (limiter) {
    try {
      const result = await limiter.limit(identifier);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch (error) {
      logger.warn({ error, tier }, 'Redis rate limiter failed, falling back to in-memory');
    }
  }

  // Fallback to in-memory
  logger.info({ tier }, 'Using in-memory rate limiting');
  return inMemoryRateLimit(identifier, max, window);
}

/**
 * Check multiple rate limits (layered defense)
 */
export async function checkMultipleLimits(
  ipAddress: string,
  accountId?: string
): Promise<{ allowed: boolean; reason?: string }> {
  // Global rate limit (DDoS protection)
  if (globalRateLimiter) {
    const globalResult = await globalRateLimiter.limit('global');
    if (!globalResult.success) {
      logger.warn('Global rate limit exceeded - possible DDoS');
      return { allowed: false, reason: 'GLOBAL_RATE_LIMIT' };
    }
  }

  // IP-based rate limit
  const ipResult = await applyRateLimit(ipAddress, 'critical');
  if (!ipResult.success) {
    return { allowed: false, reason: 'IP_RATE_LIMIT' };
  }

  // Account-based rate limit (if account ID provided)
  if (accountId && perAccountRateLimiter) {
    const accountResult = await perAccountRateLimiter.limit(accountId);
    if (!accountResult.success) {
      return { allowed: false, reason: 'ACCOUNT_RATE_LIMIT' };
    }
  }

  return { allowed: true };
}

/**
 * Clean up old in-memory records (call periodically)
 */
export function cleanupMemoryStore(): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, record] of memoryStore.entries()) {
    if (record.resetAt < now) {
      memoryStore.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.debug({ cleaned }, 'Cleaned up expired rate limit records');
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupMemoryStore, 5 * 60 * 1000);
}
