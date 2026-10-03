import { Router, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CountingService } from '../services/CountingService.js';
import { logger } from '../config.js';

export function createCountingRouter(prisma: PrismaClient): Router {
  const router = Router();
  const countingService = new CountingService(prisma);

  // ===== POST /sessions =====
  router.post('/sessions', async (req: Request, res: Response) => {
    try {
      const { warehouse, location, operatorId } = req.body;

      if (!warehouse || !operatorId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'warehouse and operatorId are required',
        });
      }

      const session = await countingService.createSession({
        warehouse,
        location,
        operatorId,
      });

      res.status(201).json(session);
    } catch (error) {
      logger.error(error, 'POST /sessions failed');
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ===== GET /sessions/:id =====
  router.get('/sessions/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const session = await countingService.getSession(id);

      if (!session) {
        return res.status(404).json({ error: 'Session not found', id });
      }

      res.json(session);
    } catch (error) {
      logger.error(error, 'GET /sessions/:id failed');
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ===== POST /sessions/:id/counts/batch (CRÍTICO: IDEMPOTENCIA) =====
  router.post('/sessions/:id/counts/batch', async (req: Request, res: Response) => {
    try {
      const { id: sessionId } = req.params;
      const { counts } = req.body;

      if (!Array.isArray(counts)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'counts array is required',
        });
      }

      const result = await countingService.saveCounts(sessionId, counts);

      logger.info({ sessionId, batch: result }, 'Batch counts saved');
      res.json(result);
    } catch (error) {
      logger.error(error, 'POST /sessions/:id/counts/batch failed');
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ===== GET /sessions/:id/differences =====
  router.get('/sessions/:id/differences', async (req: Request, res: Response) => {
    try {
      const { id: sessionId } = req.params;
      const differences = await countingService.getDifferences(sessionId);

      logger.info({ sessionId, count: differences.length }, 'Differences retrieved');
      res.json({
        sessionId,
        differences,
      });
    } catch (error) {
      logger.error(error, 'GET /sessions/:id/differences failed');
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ===== POST /sessions/:id/approve (SUPERVISOR APRUEBA) =====
  router.post('/sessions/:id/approve', async (req: Request, res: Response) => {
    try {
      const { id: sessionId } = req.params;
      const { supervisorId, adjustments } = req.body;

      if (!supervisorId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'supervisorId is required',
        });
      }

      const result = await countingService.approveCounting(sessionId, {
        supervisorId,
        adjustments,
      });

      logger.info({ sessionId, supervisorId, result }, 'Counting approved');
      res.json(result);
    } catch (error) {
      logger.error(error, 'POST /sessions/:id/approve failed');

      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        error: statusCode === 404 ? 'Not Found' : 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ===== GET /sessions/:id/counts (DEBUG: ver todos los conteos) =====
  router.get('/sessions/:id/counts', async (req: Request, res: Response) => {
    try {
      const { id: sessionId } = req.params;
      const counts = await countingService.getCountsBySession(sessionId);

      res.json({ sessionId, counts });
    } catch (error) {
      logger.error(error, 'GET /sessions/:id/counts failed');
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
        service: 'counting-service',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(error, 'Health check failed');
      res.status(503).json({
        status: 'error',
        service: 'counting-service',
        database: 'disconnected',
      });
    }
  });

  return router;
}

export default createCountingRouter;
