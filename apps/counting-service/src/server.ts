import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { PrismaClient } from '@prisma/client';
import { PORT, NODE_ENV, logger, DATABASE_URL } from './config.js';
import { createCountingRouter } from './controllers/CountingController.js';

const app = express();
const prisma = new PrismaClient();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// ===== RUTAS =====
app.use('/', createCountingRouter(prisma));

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
  logger.info(`✓ counting-service listening on ${PORT}`);
  logger.info(`✓ NODE_ENV: ${NODE_ENV}`);
  logger.info(`✓ Database: ${DATABASE_URL}`);
  logger.info(`✓ Health check: http://localhost:${PORT}/health`);
  logger.info(`✓ Create session: POST http://localhost:${PORT}/sessions`);
  logger.info(`✓ Save counts: POST http://localhost:${PORT}/sessions/:id/counts/batch (CRÍTICO)`);
  logger.info(`✓ Get differences: GET http://localhost:${PORT}/sessions/:id/differences`);
  logger.info(`✓ Approve: POST http://localhost:${PORT}/sessions/:id/approve`);
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
