import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { PrismaClient } from '@prisma/client';
import { PORT, NODE_ENV, logger, DATABASE_URL } from './config.js';
import { createAuthRouter } from './controllers/AuthController.js';

const app = express();
const prisma = new PrismaClient();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// ===== RUTAS =====
app.use('/auth', createAuthRouter(prisma));

// ===== HEALTH CHECK =====
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      service: 'auth-service',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(error, 'Health check failed');
    res.status(503).json({
      status: 'error',
      service: 'auth-service',
      database: 'disconnected',
    });
  }
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
  });
});

// ===== ERROR HANDLER =====
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err, 'Unhandled error');
  res.status(500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ===== INICIAR SERVIDOR =====
const server = app.listen(PORT, () => {
  logger.info(`✓ auth-service listening on ${PORT}`);
  logger.info(`✓ NODE_ENV: ${NODE_ENV}`);
  logger.info(`✓ Database: ${DATABASE_URL}`);
  logger.info(`✓ Health check: http://localhost:${PORT}/health`);
  logger.info(`✓ Login: POST http://localhost:${PORT}/auth/login`);
  logger.info(`✓ Current user: GET http://localhost:${PORT}/auth/me (with Authorization header)`);
});

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  server.close(async () => {
    logger.info('Server closed');
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down');
  server.close(async () => {
    logger.info('Server closed');
    await prisma.$disconnect();
    process.exit(0);
  });
});

export default server;
