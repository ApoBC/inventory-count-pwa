import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { PORT, NODE_ENV, logger, ERP_PROVIDER, ERP_MOCK_URL } from './config.js';
import { MockAdapter } from './adapters/MockAdapter.js';
import { createGatewayRouter } from './routes/gateway.js';
import type { ErpAdapter } from './adapters/ErpAdapter.js';

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// ===== INICIALIZAR ADAPTADOR =====
let adapter: ErpAdapter;

switch (ERP_PROVIDER) {
  case 'mock':
    adapter = new MockAdapter(ERP_MOCK_URL);
    logger.info({ erpMockUrl: ERP_MOCK_URL }, 'Using MockAdapter');
    break;
  // Aquí irían otros adaptadores (ERPNext, D365) en el futuro
  default:
    logger.error({ erpProvider: ERP_PROVIDER }, 'Unknown ERP_PROVIDER');
    process.exit(1);
}

// ===== RUTAS =====
app.use('/', createGatewayRouter(adapter));

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
  logger.info(`✓ erp-gateway listening on ${PORT}`);
  logger.info(`✓ ERP Provider: ${ERP_PROVIDER}`);
  logger.info(`✓ NODE_ENV: ${NODE_ENV}`);
  logger.info(`✓ Health check: http://localhost:${PORT}/health`);
  logger.info(`✓ Get product: GET http://localhost:${PORT}/products/:code`);
  logger.info(`✓ Get stock: GET http://localhost:${PORT}/stock?itemId=PROD-001`);
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
