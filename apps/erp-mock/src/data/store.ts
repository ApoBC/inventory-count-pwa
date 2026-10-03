import { PRODUCTS, type Product } from './products.js';
import { STOCK_LEVELS, type StockLevel } from './stock.js';

export interface InventoryJournal {
  id: string;
  journalNumber: string;
  status: 'Draft' | 'Posted';
  createdAt: Date;
  lines: InventoryJournalLine[];
}

export interface InventoryJournalLine {
  id: string;
  itemId: string;
  diff: number;
}

class Store {
  private products: Map<string, Product>;
  private stockLevels: StockLevel[];
  private journals: Map<string, InventoryJournal>;
  private journalCounter: number;

  constructor() {
    this.products = new Map();
    this.stockLevels = [...STOCK_LEVELS];
    this.journals = new Map();
    this.journalCounter = 1000;

    // Cargar productos
    PRODUCTS.forEach(p => this.products.set(p.id, p));
  }

  // ===== PRODUCTOS =====
  getProducts(): Product[] {
    return Array.from(this.products.values());
  }

  getProductByCode(code: string): Product | undefined {
    return Array.from(this.products.values()).find(p => p.code === code);
  }

  getProductById(id: string): Product | undefined {
    return this.products.get(id);
  }

  // ===== STOCK =====
  getStockOnHand(itemId: string, warehouse?: string): StockLevel[] {
    return this.stockLevels.filter(s => {
      if (s.itemId !== itemId) return false;
      if (warehouse && s.warehouse !== warehouse) return false;
      return true;
    });
  }

  getStockByWarehouse(warehouse: string): StockLevel[] {
    return this.stockLevels.filter(s => s.warehouse === warehouse);
  }

  // ===== DIARIOS DE INVENTARIO =====
  createInventoryJournal(lines: Array<{ itemId: string; diff: number }>): InventoryJournal {
    const id = `JRN-${Date.now()}`;
    const journalNumber = `JRN-2026-${String(this.journalCounter++).padStart(3, '0')}`;

    const journal: InventoryJournal = {
      id,
      journalNumber,
      status: 'Draft',
      createdAt: new Date(),
      lines: lines.map((line, idx) => ({
        id: `JRN-LINE-${id}-${idx}`,
        itemId: line.itemId,
        diff: line.diff,
      })),
    };

    this.journals.set(id, journal);
    return journal;
  }

  getJournalById(id: string): InventoryJournal | undefined {
    return this.journals.get(id);
  }

  postJournal(id: string): InventoryJournal | undefined {
    const journal = this.journals.get(id);
    if (journal) {
      journal.status = 'Posted';
    }
    return journal;
  }

  // ===== RESET (para testing) =====
  reset(): void {
    this.products.clear();
    this.stockLevels = [...STOCK_LEVELS];
    this.journals.clear();
    this.journalCounter = 1000;

    PRODUCTS.forEach(p => this.products.set(p.id, p));
  }
}

export const store = new Store();
