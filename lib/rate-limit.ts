import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import logger from './logger';

// In-memory rate limiter fallback for development
class InMemoryRateLimiter {
  private requests: Map<string, { count: number; resetAt: number }> = new Map();

  async limit(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): Promise<{
    success: boolean;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || entry.resetAt < now) {
      this.requests.set(identifier, {
        count: 1,
        resetAt: now + windowMs,
      });
      return {
        success: true,
        remaining: maxRequests - 1,
        reset: now + windowMs,
      };
    }

    if (entry.count >= maxRequests) {
      return {
        success: false,
        remaining: 0,
        reset: entry.resetAt,
      };
    }

    entry.count++;
    return {
      success: true,
      remaining: maxRequests - entry.count,
      reset: entry.resetAt,
    };
  }

  async reset(identifier: string): Promise<void> {
    this.requests.delete(identifier);
  }
}

// Initialize Redis client if credentials are available
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Create rate limiter with Redis or fallback to in-memory
const inMemoryLimiter = new InMemoryRateLimiter();

export const createRateLimiter = (config: {
  maxRequests: number;
  windowMs: number;
  prefix?: string;
}) => {
  const { maxRequests, windowMs, prefix = 'ratelimit' } = config;

  if (redis) {
    logger.info('Using Upstash Redis for rate limiting');
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs}ms`),
      prefix,
      analytics: true,
    });
  }

  logger.warn('Redis not configured, using in-memory rate limiting (not suitable for production)');

  return {
    limit: async (identifier: string) => {
      const result = await inMemoryLimiter.limit(identifier, maxRequests, windowMs);
      return {
        success: result.success,
        limit: maxRequests,
        remaining: result.remaining,
        reset: result.reset,
        pending: Promise.resolve(),
      };
    },
    resetKey: async (identifier: string) => {
      await inMemoryLimiter.reset(identifier);
    },
  };
};

// Rate limiters for different scenarios
// In development, use much higher limits to avoid blocking during testing
const isDevelopment = process.env.NODE_ENV === 'development';

export const ipRateLimiter = createRateLimiter({
  maxRequests: isDevelopment ? 1000 : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5', 10),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  prefix: 'ratelimit:ip',
});

export const accountRateLimiter = createRateLimiter({
  maxRequests: isDevelopment ? 1000 : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5', 10),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  prefix: 'ratelimit:account',
});

export { redis };
