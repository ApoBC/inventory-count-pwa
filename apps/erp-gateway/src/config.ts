import pino from 'pino';

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3004;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// ERP Configuration
export const ERP_PROVIDER = process.env.ERP_PROVIDER || 'mock';
export const ERP_MOCK_URL = process.env.ERP_MOCK_URL || 'http://localhost:3005';

// Retry policy
export const MAX_RETRIES = 3;
export const RETRY_DELAY_MS = 1000;

export const logger = pino({
  level: LOG_LEVEL,
  transport:
    NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: false,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});
