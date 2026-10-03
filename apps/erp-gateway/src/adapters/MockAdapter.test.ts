import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockAdapter } from './MockAdapter.js';

describe('MockAdapter', () => {
  let adapter: MockAdapter;

  beforeEach(() => {
    adapter = new MockAdapter('http://localhost:3005');
  });

  describe('getProductByCode', () => {
    it('should find product by valid code', async () => {
      const product = await adapter.getProductByCode('8718053433147');
      expect(product).toBeDefined();
      expect(product?.code).toBe('8718053433147');
      expect(product?.name).toBeTruthy();
    });

    it('should return undefined for non-existent code', async () => {
      const product = await adapter.getProductByCode('9999999999999');
      expect(product).toBeUndefined();
    });

    it('should return product with all required fields', async () => {
      const product = await adapter.getProductByCode('8718053433147');
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('code');
      expect(product).toHaveProperty('name');
    });
  });

  describe('getStockOnHand', () => {
    it('should return stock levels for valid item', async () => {
      const stock = await adapter.getStockOnHand('PROD-001');
      expect(Array.isArray(stock)).toBe(true);
      expect(stock.length).toBeGreaterThan(0);
    });

    it('should filter by warehouse when provided', async () => {
      const allStock = await adapter.getStockOnHand('PROD-006');
      const warehouseAStock = await adapter.getStockOnHand('PROD-006', 'WAREHOUSE-A');

      expect(warehouseAStock.length).toBeGreaterThan(0);
      expect(warehouseAStock.every(s => s.warehouse === 'WAREHOUSE-A')).toBe(true);
    });

    it('should return empty array for non-existent item', async () => {
      const stock = await adapter.getStockOnHand('PROD-999');
      expect(stock).toEqual([]);
    });

    it('should return stock with required fields', async () => {
      const stock = await adapter.getStockOnHand('PROD-001');
      if (stock.length > 0) {
        const item = stock[0];
        expect(item).toHaveProperty('itemId');
        expect(item).toHaveProperty('warehouse');
        expect(item).toHaveProperty('location');
        expect(item).toHaveProperty('qty');
      }
    });
  });

  describe('postInventoryJournal', () => {
    it('should create journal with lines', async () => {
      const lines = [
        { itemId: 'PROD-001', diff: 5 },
        { itemId: 'PROD-002', diff: -3 },
      ];

      const result = await adapter.postInventoryJournal(lines);

      expect(result).toHaveProperty('journalId');
      expect(result).toHaveProperty('journalNumber');
      expect(result).toHaveProperty('status');
      expect(result.status).toBe('Draft');
    });

    it('should generate unique journal IDs', async () => {
      const lines1 = [{ itemId: 'PROD-001', diff: 5 }];
      const lines2 = [{ itemId: 'PROD-002', diff: -3 }];

      const result1 = await adapter.postInventoryJournal(lines1);
      const result2 = await adapter.postInventoryJournal(lines2);

      expect(result1.journalId).not.toBe(result2.journalId);
    });
  });

  describe('healthCheck', () => {
    it('should return true for healthy ERP', async () => {
      const healthy = await adapter.healthCheck();
      expect(typeof healthy).toBe('boolean');
    });
  });
});
