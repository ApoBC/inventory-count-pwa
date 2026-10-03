import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import axios from 'axios';
import {
  PORT,
  NODE_ENV,
  logger,
  CORS_ORIGIN,
  AUTH_SERVICE_URL,
  INVENTORY_SERVICE_URL,
  COUNTING_SERVICE_URL,
  ERP_GATEWAY_URL,
  ERP_MOCK_URL,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
} from './config.js';

const app = express();

// ===== MIDDLEWARE =====

// CORS
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(pinoHttp({ logger }));

// Rate limiting
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// ===== HEALTH CHECK ENDPOINT =====
app.get('/health', async (req: Request, res: Response) => {
  try {
    const [auth, inventory, counting, erpGateway, erpMock] = await Promise.allSettled([
      axios.get(`${AUTH_SERVICE_URL}/health`, { timeout: 5000 }),
      axios.get(`${INVENTORY_SERVICE_URL}/health`, { timeout: 5000 }),
      axios.get(`${COUNTING_SERVICE_URL}/health`, { timeout: 5000 }),
      axios.get(`${ERP_GATEWAY_URL}/health`, { timeout: 5000 }),
      axios.get(`${ERP_MOCK_URL}/health`, { timeout: 5000 }),
    ]);

    const upstream = {
      auth: auth.status === 'fulfilled' ? 'ok' : 'down',
      inventory: inventory.status === 'fulfilled' ? 'ok' : 'down',
      counting: counting.status === 'fulfilled' ? 'ok' : 'down',
      erpGateway: erpGateway.status === 'fulfilled' ? 'ok' : 'down',
      erpMock: erpMock.status === 'fulfilled' ? 'ok' : 'down',
    };

    const allHealthy = Object.values(upstream).every(s => s === 'ok');

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ok' : 'degraded',
      service: 'api-gateway',
      upstream,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(error, 'Health check error');
    res.status(503).json({
      status: 'error',
      service: 'api-gateway',
      message: 'Health check failed',
    });
  }
});

// ===== PROXY ROUTES =====

// Auth Service (puerto 3001)
app.use(
  '/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/auth': '' },
    logger: console,
    onError: (err, req, res) => {
      logger.error(err, 'Auth service error');
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'Failed to reach auth service',
      });
    },
  })
);

// Inventory Service (puerto 3002)
app.use(
  '/items',
  createProxyMiddleware({
    target: INVENTORY_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/items': '/items' },
    logger: console,
    onError: (err, req, res) => {
      logger.error(err, 'Inventory service error');
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'Failed to reach inventory service',
      });
    },
  })
);

app.use(
  '/stock',
  createProxyMiddleware({
    target: INVENTORY_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/stock': '/stock' },
    logger: console,
    onError: (err, req, res) => {
      logger.error(err, 'Inventory service error');
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'Failed to reach inventory service',
      });
    },
  })
);

app.use(
  '/sync',
  createProxyMiddleware({
    target: INVENTORY_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/sync': '/sync' },
    logger: console,
    onError: (err, req, res) => {
      logger.error(err, 'Inventory service error');
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'Failed to reach inventory service',
      });
    },
  })
);

// Counting Service (puerto 3003)
app.use(
  '/sessions',
  createProxyMiddleware({
    target: COUNTING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/sessions': '/sessions' },
    logger: console,
    onError: (err, req, res) => {
      logger.error(err, 'Counting service error');
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'Failed to reach counting service',
      });
    },
  })
);

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
  });
});

// ===== ERROR HANDLER =====
app.use((err: any, req: express.Request, res: express.Response, next: NextFunction) => {
  logger.error(err, 'Unhandled error');
  res.status(500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ===== INICIAR SERVIDOR =====
const server = app.listen(PORT, () => {
  logger.info(`✓ api-gateway listening on ${PORT}`);
  logger.info(`✓ NODE_ENV: ${NODE_ENV}`);
  logger.info(`✓ Auth Service: ${AUTH_SERVICE_URL}`);
  logger.info(`✓ Inventory Service: ${INVENTORY_SERVICE_URL}`);
  logger.info(`✓ Counting Service: ${COUNTING_SERVICE_URL}`);
  logger.info(`✓ ERP Gateway: ${ERP_GATEWAY_URL}`);
  logger.info(`✓ ERP Mock: ${ERP_MOCK_URL}`);
  logger.info(`✓ Health check: http://localhost:${PORT}/health`);
});

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default server;
