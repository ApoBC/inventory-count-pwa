import pino from 'pino';

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3003;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Database
export const DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://counting:secret@localhost:5432/counting_dev';

// Services
export const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3002';
export const ERP_GATEWAY_URL = process.env.ERP_GATEWAY_URL || 'http://localhost:3004';

// Diferencia umbral para marcar recuento
export const RECOUNT_THRESHOLD_PERCENT = 10; // 10%

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
