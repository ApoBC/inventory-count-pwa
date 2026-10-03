import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { PORT, NODE_ENV, logger } from './config.js';
import odataRouter from './routes/odata.js';

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// ===== RUTAS =====
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'erp-mock', timestamp: new Date().toISOString() });
});

app.use('/data', odataRouter);

// ===== MANEJO DE ERRORES =====
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
  });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err, 'Unhandled error');
  res.status(500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ===== INICIAR SERVIDOR =====
const server = app.listen(PORT, () => {
  logger.info(`✓ erp-mock listening on ${PORT}`);
  logger.info(`✓ NODE_ENV: ${NODE_ENV}`);
  logger.info(`✓ Health check: http://localhost:${PORT}/health`);
  logger.info(`✓ OData endpoint: http://localhost:${PORT}/data/Products`);
});

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default server;
