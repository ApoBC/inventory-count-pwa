import { PrismaClient } from '@prisma/client';
import { TokenService } from './TokenService.js';
import { PasswordService } from './PasswordService.js';
import { logger } from '../config.js';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Login con username + password
   */
  async login(req: LoginRequest): Promise<LoginResponse> {
    const { username, password } = req;

    // Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      logger.warn({ username }, 'User not found');
      throw new Error('Invalid username or password');
    }

    if (!user.active) {
      logger.warn({ username }, 'User is inactive');
      throw new Error('User is inactive');
    }

    // Verificar contraseña
    const isPasswordValid = await PasswordService.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      logger.warn({ username }, 'Invalid password');
      throw new Error('Invalid username or password');
    }

    // Generar tokens
    const accessToken = TokenService.generateAccessToken(user.id, user.username, user.role);
    const refreshToken = TokenService.generateRefreshToken(user.id);

    // Guardar refresh token en BD
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      },
    });

    logger.info({ userId: user.id, username }, 'User logged in');

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  /**
   * Refresh access token usando refresh token
   */
  async refreshToken(req: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const { refreshToken } = req;

    // Verificar refresh token
    const payload = TokenService.verifyToken(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      logger.warn('Invalid refresh token');
      throw new Error('Invalid refresh token');
    }

    // Verificar que existe en BD
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn({ userId: payload.sub }, 'Refresh token expired or not found');
      throw new Error('Refresh token expired');
    }

    const user = storedToken.user;

    // Generar nuevo access token
    const newAccessToken = TokenService.generateAccessToken(user.id, user.username, user.role);

    // Generar nuevo refresh token
    const newRefreshToken = TokenService.generateRefreshToken(user.id);

    // Actualizar refresh token en BD
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    logger.info({ userId: user.id }, 'Token refreshed');

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout (eliminar refresh token)
   */
  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    logger.info({ userId }, 'User logged out');
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        active: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Verificar si refresh token es válido
   */
  async validateRefreshToken(token: string): Promise<boolean> {
    try {
      const payload = TokenService.verifyToken(token);
      if (!payload || payload.type !== 'refresh') {
        return false;
      }

      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token },
      });

      return storedToken ? storedToken.expiresAt > new Date() : false;
    } catch (error) {
      return false;
    }
  }
}
