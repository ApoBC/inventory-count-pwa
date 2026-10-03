import { Router, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/AuthService.js';
import { logger } from '../config.js';
import { authMiddleware, type AuthRequest, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

export function createAuthRouter(prisma: PrismaClient): Router {
  const authService = new AuthService(prisma);

  // ===== POST /auth/login =====
  router.post('/login', async (req: AuthRequest, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'username and password are required',
        });
      }

      const result = await authService.login({ username, password });

      logger.info({ username }, 'Login successful');
      res.json(result);
    } catch (error) {
      logger.warn({ error: error instanceof Error ? error.message : 'Unknown' }, 'Login failed');
      res.status(401).json({
        error: 'Unauthorized',
        message: error instanceof Error ? error.message : 'Invalid credentials',
      });
    }
  });

  // ===== POST /auth/refresh =====
  router.post('/refresh', async (req: AuthRequest, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'refreshToken is required',
        });
      }

      const result = await authService.refreshToken({ refreshToken });
      res.json(result);
    } catch (error) {
      logger.warn({ error: error instanceof Error ? error.message : 'Unknown' }, 'Token refresh failed');
      res.status(401).json({
        error: 'Unauthorized',
        message: error instanceof Error ? error.message : 'Invalid refresh token',
      });
    }
  });

  // ===== POST /auth/logout =====
  router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await authService.logout(req.user.id);
      logger.info({ userId: req.user.id }, 'Logout successful');

      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      logger.error(error, 'Logout failed');
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ===== GET /auth/me =====
  router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await authService.getCurrentUser(req.user.id);
      res.json({ user });
    } catch (error) {
      logger.error(error, 'Failed to get current user');
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ===== GET /auth/health =====
  router.get('/health', async (req: AuthRequest, res: Response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({
        status: 'ok',
        service: 'auth-service',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(error, 'Health check failed');
      res.status(503).json({
        status: 'error',
        service: 'auth-service',
        message: 'Database connection failed',
      });
    }
  });

  return router;
}

export default router;
