import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../data/store.js';

describe('OData Routes', () => {
  beforeEach(() => {
    store.reset();
  });

  describe('GET /data/Products', () => {
    it('should return array of products', () => {
      const products = store.getProducts();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBe(30);
    });

    it('should return product with all required fields', () => {
      const products = store.getProducts();
      const product = products[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('code');
      expect(product).toHaveProperty('name');
    });
  });

  describe('GET /data/ProductsV2 with $filter', () => {
    it('should find product by code', () => {
      const code = '8718053433147';
      const product = store.getProductByCode(code);
      expect(product).toBeDefined();
      expect(product?.code).toBe(code);
    });

    it('should return undefined for non-existent code', () => {
      const product = store.getProductByCode('9999999999999');
      expect(product).toBeUndefined();
    });
  });

  describe('GET /data/InventoryOnHandV2', () => {
    it('should return stock levels for item', () => {
      const stock = store.getStockOnHand('PROD-001');
      expect(Array.isArray(stock)).toBe(true);
      expect(stock.length).toBeGreaterThan(0);
    });

    it('should return stock for specific warehouse', () => {
      const allStock = store.getStockOnHand('PROD-006');
      const warehouseA = store.getStockOnHand('PROD-006').filter(
        s => s.warehouse === 'WAREHOUSE-A'
      );
      expect(warehouseA.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent item', () => {
      const stock = store.getStockOnHand('PROD-999');
      expect(stock).toEqual([]);
    });
  });

  describe('POST /data/InventoryCountingJournalHeaders', () => {
    it('should create journal with lines', () => {
      const lines = [
        { itemId: 'PROD-001', diff: 5 },
        { itemId: 'PROD-002', diff: -3 },
      ];
      const journal = store.createInventoryJournal(lines);
      expect(journal).toBeDefined();
      expect(journal.id).toBeTruthy();
      expect(journal.journalNumber).toBeTruthy();
      expect(journal.lines.length).toBe(2);
      expect(journal.status).toBe('Draft');
    });

    it('should generate unique journal IDs', () => {
      const journal1 = store.createInventoryJournal([{ itemId: 'PROD-001', diff: 5 }]);
      const journal2 = store.createInventoryJournal([{ itemId: 'PROD-002', diff: -3 }]);
      expect(journal1.id).not.toBe(journal2.id);
    });
  });

  describe('PATCH /data/InventoryCountingJournalHeaders', () => {
    it('should post journal and change status', () => {
      const lines = [{ itemId: 'PROD-001', diff: 5 }];
      const journal = store.createInventoryJournal(lines);
      const journalId = journal.id;

      expect(journal.status).toBe('Draft');

      const postedJournal = store.postJournal(journalId);
      expect(postedJournal?.status).toBe('Posted');
    });

    it('should return undefined for non-existent journal', () => {
      const postedJournal = store.postJournal('NONEXISTENT-ID');
      expect(postedJournal).toBeUndefined();
    });
  });

  describe('GET /data/InventoryCountingJournalHeaders/:id', () => {
    it('should retrieve journal by ID', () => {
      const lines = [{ itemId: 'PROD-001', diff: 5 }];
      const created = store.createInventoryJournal(lines);

      const retrieved = store.getJournalById(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.lines.length).toBe(1);
    });

    it('should return undefined for non-existent ID', () => {
      const journal = store.getJournalById('NONEXISTENT-ID');
      expect(journal).toBeUndefined();
    });
  });
});
