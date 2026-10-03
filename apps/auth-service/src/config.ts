import pino from 'pino';

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// JWT Configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
export const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Database
export const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://counting:secret@localhost:5432/counting_dev';

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
