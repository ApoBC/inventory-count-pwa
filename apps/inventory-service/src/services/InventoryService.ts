import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { CacheService } from './CacheService.js';
import { CACHE_TTL_PRODUCTS, CACHE_TTL_STOCK, ERP_GATEWAY_URL, logger } from '../config.js';

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export class InventoryService {
  constructor(
    private prisma: PrismaClient,
    private cache: CacheService
  ) {}

  /**
   * Obtener todos los productos con paginación
   */
  async getProducts(options: PaginationOptions = {}) {
    const { limit = 100, offset = 0 } = options;

    // Límite máximo
    const safeLimit = Math.min(limit, 1000);

    const cacheKey = `products:${offset}:${safeLimit}`;

    // Intentar obtener del caché
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      logger.debug({ cacheKey }, 'Products from cache');
      return cached;
    }

    // Obtener de BD
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        skip: offset,
        take: safeLimit,
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
        },
      }),
      this.prisma.product.count(),
    ]);

    const result = {
      items: products,
      pagination: {
        limit: safeLimit,
        offset,
        total,
        hasMore: offset + safeLimit < total,
      },
    };

    // Guardar en caché
    await this.cache.set(cacheKey, result, CACHE_TTL_PRODUCTS);

    return result;
  }

  /**
   * Obtener producto por ID
   */
  async getProductById(id: string) {
    const cacheKey = `product:${id}`;

    // Intentar obtener del caché
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      logger.debug({ id }, 'Product from cache');
      return cached;
    }

    // Obtener de BD
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        stockLevels: {
          select: {
            warehouse: true,
            location: true,
            qty: true,
          },
        },
      },
    });

    if (product) {
      await this.cache.set(cacheKey, product, CACHE_TTL_PRODUCTS);
    }

    return product;
  }

  /**
   * Obtener producto por código EAN-13
   */
  async getProductByCode(code: string) {
    const cacheKey = `product:code:${code}`;

    // Intentar obtener del caché
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      logger.debug({ code }, 'Product by code from cache');
      return cached;
    }

    // Obtener de BD
    const product = await this.prisma.product.findUnique({
      where: { code },
      include: {
        stockLevels: true,
      },
    });

    if (product) {
      await this.cache.set(cacheKey, product, CACHE_TTL_PRODUCTS);
    }

    return product;
  }

  /**
   * Buscar productos por nombre
   */
  async searchProducts(query: string, options: PaginationOptions = {}) {
    const { limit = 100, offset = 0 } = options;
    const safeLimit = Math.min(limit, 1000);

    const products = await this.prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query } },
        ],
      },
      skip: offset,
      take: safeLimit,
    });

    const total = await this.prisma.product.count({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query } },
        ],
      },
    });

    return {
      items: products,
      pagination: {
        limit: safeLimit,
        offset,
        total,
        hasMore: offset + safeLimit < total,
      },
    };
  }

  /**
   * Obtener niveles de stock
   */
  async getStockLevels(itemId?: string, warehouse?: string) {
    const cacheKey = `stock:${itemId || 'all'}:${warehouse || 'all'}`;

    // Intentar obtener del caché
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      logger.debug({ itemId, warehouse }, 'Stock from cache');
      return cached;
    }

    // Obtener de BD
    const stocks = await this.prisma.stockLevel.findMany({
      where: {
        ...(itemId && { productId: itemId }),
        ...(warehouse && { warehouse }),
      },
      include: {
        product: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });

    await this.cache.set(cacheKey, stocks, CACHE_TTL_STOCK);

    return stocks;
  }

  /**
   * Obtener stock de un producto por warehouse + location
   */
  async getStockByLocation(itemId: string, warehouse: string, location?: string) {
    const stock = await this.prisma.stockLevel.findFirst({
      where: {
        productId: itemId,
        warehouse,
        ...(location && { location }),
      },
    });

    return stock;
  }

  /**
   * Sincronizar catálogo desde ERP Gateway
   */
  async syncCatalogFromErp() {
    try {
      logger.info('Starting catalog sync from ERP');

      // Obtener productos del ERP Gateway
      const response = await axios.get(`${ERP_GATEWAY_URL}/products`, {
        params: { limit: 100 },
      });

      const erpProducts = response.data.value || [];

      // Upsert productos
      let upsertCount = 0;
      for (const erpProduct of erpProducts) {
        await this.prisma.product.upsert({
          where: { id: erpProduct.id },
          create: {
            id: erpProduct.id,
            code: erpProduct.code,
            name: erpProduct.name,
            description: erpProduct.description,
          },
          update: {
            name: erpProduct.name,
            description: erpProduct.description,
          },
        });
        upsertCount++;
      }

      logger.info({ count: upsertCount }, 'Catalog sync completed');

      // Invalidar caché de productos
      await this.cache.invalidatePattern('product:*');

      return { success: true, itemsCount: upsertCount };
    } catch (error) {
      logger.error(error, 'Catalog sync failed');
      throw error;
    }
  }

  /**
   * Sincronizar stock desde ERP Gateway
   */
  async syncStockFromErp() {
    try {
      logger.info('Starting stock sync from ERP');

      // Obtener stock del ERP Gateway
      const response = await axios.get(`${ERP_GATEWAY_URL}/stock`);

      const erpStocks = response.data.levels || [];

      // Upsert stock levels
      let upsertCount = 0;
      for (const erpStock of erpStocks) {
        await this.prisma.stockLevel.upsert({
          where: {
            productId_warehouse_location: {
              productId: erpStock.itemId,
              warehouse: erpStock.warehouse,
              location: erpStock.location,
            },
          },
          create: {
            productId: erpStock.itemId,
            warehouse: erpStock.warehouse,
            location: erpStock.location,
            qty: erpStock.qty,
          },
          update: {
            qty: erpStock.qty,
          },
        });
        upsertCount++;
      }

      logger.info({ count: upsertCount }, 'Stock sync completed');

      // Invalidar caché de stock
      await this.cache.invalidatePattern('stock:*');

      return { success: true, itemsCount: upsertCount };
    } catch (error) {
      logger.error(error, 'Stock sync failed');
      throw error;
    }
  }

  /**
   * Obtener logs de sincronización
   */
  async getSyncLogs(limit: number = 10) {
    return this.prisma.syncLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
