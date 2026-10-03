import pino from 'pino';

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3002;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Database
export const DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://counting:secret@localhost:5432/counting_dev';

// Redis
export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// ERP Gateway
export const ERP_GATEWAY_URL = process.env.ERP_GATEWAY_URL || 'http://localhost:3004';

// Cache TTL (in seconds)
export const CACHE_TTL_PRODUCTS = 3600; // 1 hour
export const CACHE_TTL_STOCK = 1800; // 30 minutes

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
