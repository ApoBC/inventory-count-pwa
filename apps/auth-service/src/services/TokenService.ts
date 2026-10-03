import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN, logger } from '../config.js';

export interface TokenPayload {
  sub: string; // userId
  username: string;
  role: string;
  type: 'access' | 'refresh';
}

export class TokenService {
  /**
   * Generar access token (corta duración)
   */
  static generateAccessToken(userId: string, username: string, role: string): string {
    const payload: TokenPayload = {
      sub: userId,
      username,
      role,
      type: 'access',
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: 'HS256',
    });

    logger.debug({ userId, username }, 'Access token generated');
    return token;
  }

  /**
   * Generar refresh token (larga duración)
   */
  static generateRefreshToken(userId: string): string {
    const payload: TokenPayload = {
      sub: userId,
      username: '',
      role: '',
      type: 'refresh',
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      algorithm: 'HS256',
    });

    logger.debug({ userId }, 'Refresh token generated');
    return token;
  }

  /**
   * Verificar y decodificar token
   */
  static verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      logger.debug({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Token verification failed');
      return null;
    }
  }

  /**
   * Decodificar token sin verificar (solo para obtener payload)
   * ⚠️ No usar para validación, solo para lectura
   */
  static decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as TokenPayload | null;
      return decoded;
    } catch (error) {
      logger.debug({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Token decode failed');
      return null;
    }
  }
}
