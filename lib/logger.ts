import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

// Simplified logger without pino-pretty to avoid worker thread issues in Next.js
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
