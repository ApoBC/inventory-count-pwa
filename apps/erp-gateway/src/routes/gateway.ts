import { Router, type Request, type Response } from 'express';
import { logger } from '../config.js';
import type { ErpAdapter } from '../adapters/ErpAdapter.js';

export function createGatewayRouter(adapter: ErpAdapter): Router {
  const router = Router();

  // ===== GET /products/:code =====
  router.get('/products/:code', async (req: Request, res: Response) => {
    try {
      const { code } = req.params;

      const product = await adapter.getProductByCode(code);

      if (!product) {
        logger.warn({ code }, 'Product not found');
        return res.status(404).json({ error: 'Product not found', code });
      }

      logger.debug({ code, productId: product.id }, 'Product found');
      res.json(product);
    } catch (error) {
      logger.error({ code: req.params.code, error }, 'Failed to get product');
      res.status(502).json({
        error: 'Bad Gateway',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ===== GET /stock?itemId=PROD-001&warehouse=WAREHOUSE-A =====
  router.get('/stock', async (req: Request, res: Response) => {
    try {
      const { itemId, warehouse } = req.query;

      if (!itemId || typeof itemId !== 'string') {
        return res.status(400).json({ error: 'itemId query parameter is required' });
      }

      const stock = await adapter.getStockOnHand(itemId, warehouse as string | undefined);

      logger.debug({ itemId, warehouse, count: stock.length }, 'Stock retrieved');
      res.json({
        itemId,
        warehouse,
        levels: stock,
      });
    } catch (error) {
      logger.error({ query: req.query, error }, 'Failed to get stock');
      res.status(502).json({
        error: 'Bad Gateway',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ===== POST /inventory-journals =====
  router.post('/inventory-journals', async (req: Request, res: Response) => {
    try {
      const { lines } = req.body;

      if (!lines || !Array.isArray(lines)) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'lines array is required',
        });
      }

      const result = await adapter.postInventoryJournal(lines);

      logger.info({ journalId: result.journalId }, 'Journal posted');
      res.status(201).json({
        journalId: result.journalId,
        journalNumber: result.journalNumber,
        status: result.status,
        postedAt: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ error }, 'Failed to post inventory journal');
      res.status(502).json({
        error: 'Bad Gateway',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ===== GET /health =====
  router.get('/health', async (req: Request, res: Response) => {
    try {
      const erp_healthy = await adapter.healthCheck();
      const status = erp_healthy ? 'ok' : 'degraded';

      res.json({
        status,
        service: 'erp-gateway',
        erp_provider: process.env.ERP_PROVIDER || 'mock',
        erp_healthy,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ error }, 'Health check error');
      res.status(503).json({
        status: 'error',
        service: 'erp-gateway',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}
