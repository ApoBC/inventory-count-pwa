import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/TokenService.js';
import { logger } from '../config.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

/**
 * Middleware para verificar JWT en Authorization header
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.debug('Missing or invalid Authorization header');
      return res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    const payload = TokenService.verifyToken(token);

    if (!payload || payload.type !== 'access') {
      logger.debug('Invalid or expired token');
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
    }

    // Adjuntar usuario al request
    req.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };

    next();
  } catch (error) {
    logger.error(error, 'Authentication middleware error');
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Verificar que el usuario tiene un rol específico
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn({ userId: req.user.id, role: req.user.role, requiredRoles: roles }, 'Insufficient permissions');
      return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
    }

    next();
  };
}
