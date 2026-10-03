import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { PrismaClient } from '@prisma/client';
import { PORT, NODE_ENV, logger, DATABASE_URL } from './config.js';
import { cacheService } from './services/CacheService.js';
import { createInventoryRouter } from './controllers/InventoryController.js';

const app = express();
const prisma = new PrismaClient();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// ===== CONECTAR REDIS =====
cacheService.connect().catch(error => {
  logger.warn(error, 'Redis connection failed, continuing without cache');
});

// ===== RUTAS =====
app.use('/', createInventoryRouter(prisma, cacheService));

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
  logger.info(`✓ inventory-service listening on ${PORT}`);
  logger.info(`✓ NODE_ENV: ${NODE_ENV}`);
  logger.info(`✓ Database: ${DATABASE_URL}`);
  logger.info(`✓ Health check: http://localhost:${PORT}/health`);
  logger.info(`✓ Get items: GET http://localhost:${PORT}/items`);
  logger.info(`✓ Get by barcode: GET http://localhost:${PORT}/items/barcode/:code`);
  logger.info(`✓ Get stock: GET http://localhost:${PORT}/stock`);
});

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  server.close(async () => {
    logger.info('Server closed');
    await prisma.$disconnect();
    await cacheService.disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down');
  server.close(async () => {
    logger.info('Server closed');
    await prisma.$disconnect();
    await cacheService.disconnect();
    process.exit(0);
  });
});

export default server;
