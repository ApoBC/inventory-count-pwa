import pino from 'pino';

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Upstream services
export const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
export const INVENTORY_SERVICE_URL =
  process.env.INVENTORY_SERVICE_URL || 'http://localhost:3002';
export const COUNTING_SERVICE_URL = process.env.COUNTING_SERVICE_URL || 'http://localhost:3003';
export const ERP_GATEWAY_URL = process.env.ERP_GATEWAY_URL || 'http://localhost:3004';
export const ERP_MOCK_URL = process.env.ERP_MOCK_URL || 'http://localhost:3005';

// CORS
export const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Rate limiting
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
export const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

// Timeout for upstream requests
export const UPSTREAM_TIMEOUT_MS = 30 * 1000; // 30 segundos

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
