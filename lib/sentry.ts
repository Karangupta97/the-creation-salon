import * as Sentry from '@sentry/nextjs';

export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      debug: process.env.NODE_ENV === 'development',

      // Capture failed login spikes
      beforeSend(event) {
        // Add custom logic for monitoring failed login attempts
        if (event.tags && event.tags.failedLoginSpike) {
          event.level = 'warning';
        }
        return event;
      },
    });
  }
}

/**
 * Report failed login spike to Sentry
 */
export function reportFailedLoginSpike(email: string, attempts: number, ipAddress: string) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureMessage(`Failed login spike detected for ${email}`, {
      level: 'warning',
      tags: {
        failedLoginSpike: true,
        email,
        ipAddress,
      },
      extra: {
        attempts,
      },
    });
  }
}

/**
 * Report account lockout to Sentry
 */
export function reportAccountLockout(email: string, ipAddress: string, reason: string) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureMessage(`Account locked: ${email}`, {
      level: 'warning',
      tags: {
        accountLockout: true,
        email,
        ipAddress,
      },
      extra: {
        reason,
      },
    });
  }
}

/**
 * Report error to Sentry
 */
export function reportError(error: Error, context?: Record<string, unknown>) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
}

export default Sentry;
