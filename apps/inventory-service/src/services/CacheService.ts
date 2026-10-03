import { createClient, type RedisClientType } from 'redis';
import { REDIS_URL, logger } from '../config.js';

export class CacheService {
  private client: RedisClientType;
  private connected: boolean = false;

  constructor() {
    this.client = createClient({ url: REDIS_URL }) as RedisClientType;

    this.client.on('error', err => {
      logger.error(err, 'Redis connection error');
      this.connected = false;
    });

    this.client.on('connect', () => {
      logger.info('✓ Connected to Redis');
      this.connected = true;
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      logger.warn(error, 'Failed to connect to Redis, continuing without cache');
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      logger.error(error, 'Error disconnecting from Redis');
    }
  }

  /**
   * Obtener valor del caché
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.connected) return null;

    try {
      const value = await this.client.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      logger.debug({ key, error }, 'Cache get error');
      return null;
    }
  }

  /**
   * Guardar valor en caché con expiración
   */
  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    if (!this.connected) return;

    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      logger.debug({ key, ttl }, 'Value cached');
    } catch (error) {
      logger.debug({ key, error }, 'Cache set error');
    }
  }

  /**
   * Eliminar valor del caché
   */
  async delete(key: string): Promise<void> {
    if (!this.connected) return;

    try {
      await this.client.del(key);
      logger.debug({ key }, 'Cache deleted');
    } catch (error) {
      logger.debug({ key, error }, 'Cache delete error');
    }
  }

  /**
   * Invalidar múltiples claves por patrón
   */
  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.connected) return;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        logger.debug({ pattern, count: keys.length }, 'Cache pattern invalidated');
      }
    } catch (error) {
      logger.debug({ pattern, error }, 'Cache invalidation error');
    }
  }

  /**
   * Obtener estado de conexión
   */
  isConnected(): boolean {
    return this.connected;
  }
}

export const cacheService = new CacheService();
