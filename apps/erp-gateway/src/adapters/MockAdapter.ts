import axios from 'axios';
import { logger } from '../config.js';
import {
  type ErpAdapter,
  type Product,
  type StockLevel,
  type InventoryJournalLine,
} from './ErpAdapter.js';
import { retryAsync } from '../utils/retry.js';

export class MockAdapter implements ErpAdapter {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3005') {
    this.baseUrl = baseUrl;
  }

  async getProductByCode(code: string): Promise<Product | undefined> {
    try {
      const response = await retryAsync(
        () =>
          axios.get(`${this.baseUrl}/data/ProductsV2`, {
            params: { $filter: `Code eq '${code}'` },
          }),
        { logger }
      );

      const products = response.data.value || [];
      if (products.length === 0) {
        logger.debug({ code }, 'Product not found in ERP');
        return undefined;
      }

      const product = products[0];
      return {
        id: product.Id,
        code: product.Code,
        name: product.Name,
        description: product.Description,
      };
    } catch (error) {
      logger.error({ code, error }, 'Failed to get product by code');
      throw error;
    }
  }

  async getStockOnHand(itemId: string, warehouse?: string): Promise<StockLevel[]> {
    try {
      const filter = `ItemId eq '${itemId}'`;
      const response = await retryAsync(
        () =>
          axios.get(`${this.baseUrl}/data/InventoryOnHandV2`, {
            params: { $filter: filter, $top: 100 },
          }),
        { logger }
      );

      const stocks = response.data.value || [];
      return stocks
        .filter((stock: any) => !warehouse || stock.Warehouse === warehouse)
        .map((stock: any) => ({
          itemId: stock.ItemId,
          warehouse: stock.Warehouse,
          location: stock.Location,
          qty: stock.QuantityOnHand,
        }));
    } catch (error) {
      logger.error({ itemId, warehouse, error }, 'Failed to get stock on hand');
      throw error;
    }
  }

  async postInventoryJournal(
    lines: InventoryJournalLine[]
  ): Promise<{ journalId: string; journalNumber: string; status: string }> {
    try {
      const payload = {
        Lines: lines.map(line => ({
          ItemId: line.itemId,
          Diff: line.diff,
        })),
      };

      const response = await retryAsync(
        () =>
          axios.post(`${this.baseUrl}/data/InventoryCountingJournalHeaders`, payload),
        { logger }
      );

      const journal = response.data;
      logger.info(
        { journalId: journal.Id, journalNumber: journal.JournalNumber },
        'Journal posted to ERP'
      );

      return {
        journalId: journal.Id,
        journalNumber: journal.JournalNumber,
        status: journal.Status,
      };
    } catch (error) {
      logger.error({ lineCount: lines.length, error }, 'Failed to post inventory journal');
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      logger.warn({ error }, 'ERP Mock health check failed');
      return false;
    }
  }
}
