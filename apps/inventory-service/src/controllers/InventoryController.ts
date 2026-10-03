import { Router, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { InventoryService } from '../services/InventoryService.js';
import { CacheService } from '../services/CacheService.js';
import { logger } from '../config.js';

export function createInventoryRouter(prisma: PrismaClient, cache: CacheService): Router {
  const router = Router();
  const inventoryService = new InventoryService(prisma, cache);

  // ===== GET /items =====
  router.get('/items', async (req: Request, res: Response) => {
    try {
      const limit = Math.min(parseInt(String(req.query.limit) || '100', 10), 1000);
      const offset = parseInt(String(req.query.offset) || '0', 10);

      const result = await inventoryService.getProducts({ limit, offset });

      logger.debug({ limit, offset }, 'GET /items');
      res.json(result);
    } catch (error) {
      logger.error(error, 'GET /items failed');
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ===== GET /items/:id =====
  router.get('/items/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const product = await inventoryService.getProductById(id);

      if (!product) {
        return res.status(404).json({ error: 'Product not found', id });
      }

      logger.debug({ id }, 'GET /items/:id');
      res.json(product);
    } catch (error) {
      logger.error(error, 'GET /items/:id failed');
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ===== GET /items/barcode/:code =====
  router.get('/items/barcode/:code', async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const product = await inventoryService.getProductByCode(code);

      if (!product) {
        return res.status(404).json({ error: 'Product not found', code });
      }

      logger.debug({ code }, 'GET /items/barcode/:code');
      res.json(product);
    } catch (error) {
      logger.error(error, 'GET /items/barcode/:code failed');
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ===== GET /items/search?q=... =====
  router.get('/items/search', async (req: Request, res: Response) => {
    try {
      const query = String(req.query.q || '');

      if (!query || query.length < 2) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Query parameter must be at least 2 characters',
        });
      }

      const limit = Math.min(parseInt(String(req.query.limit) || '100', 10), 1000);
      const offset = parseInt(String(req.query.offset) || '0', 10);

      const result = await inventoryService.searchProducts(query, { limit, offset });

      logger.debug({ query, limit, offset }, 'GET /items/search');
      res.json(result);
    } catch (error) {
      logger.error(error, 'GET /items/search failed');
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ===== GET /stock?itemId=X&warehouse=Y =====
  router.get('/stock', async (req: Request, res: Response) => {
    try {
      const { itemId, warehouse } = req.query;

      const stocks = await inventoryService.getStockLevels(
        itemId as string | undefined,
        warehouse as string | undefined
      );

      logger.debug({ itemId, warehouse }, 'GET /stock');
      res.json({
        itemId: itemId || null,
        warehouse: warehouse || null,
        levels: stocks,
      });
    } catch (error) {
      logger.error(error, 'GET /stock failed');
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ===== POST /sync/catalog =====
  router.post('/sync/catalog', async (req: Request, res: Response) => {
    try {
      const result = await inventoryService.syncCatalogFromErp();

      logger.info(result, 'POST /sync/catalog');
      res.json(result);
    } catch (error) {
      logger.error(error, 'POST /sync/catalog failed');
      res.status(502).json({
        error: 'Bad Gateway',
        message: error instanceof Error ? error.message : 'Failed to sync from ERP',
      });
    }
  });

  // ===== POST /sync/stock =====
  router.post('/sync/stock', async (req: Request, res: Response) => {
    try {
      const result = await inventoryService.syncStockFromErp();

      logger.info(result, 'POST /sync/stock');
      res.json(result);
    } catch (error) {
      logger.error(error, 'POST /sync/stock failed');
      res.status(502).json({
        error: 'Bad Gateway',
        message: error instanceof Error ? error.message : 'Failed to sync from ERP',
      });
    }
  });

  // ===== GET /sync/logs =====
  router.get('/sync/logs', async (req: Request, res: Response) => {
    try {
      const limit = Math.min(parseInt(String(req.query.limit) || '10', 10), 100);
      const logs = await inventoryService.getSyncLogs(limit);

      logger.debug({ limit }, 'GET /sync/logs');
      res.json({ logs });
    } catch (error) {
      logger.error(error, 'GET /sync/logs failed');
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ===== GET /health =====
  router.get('/health', async (req: Request, res: Response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;

      res.json({
        status: 'ok',
        service: 'inventory-service',
        database: 'connected',
        cache: cache.isConnected() ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(error, 'Health check failed');
      res.status(503).json({
        status: 'error',
        service: 'inventory-service',
        database: 'disconnected',
      });
    }
  });

  return router;
}

export default createInventoryRouter;
