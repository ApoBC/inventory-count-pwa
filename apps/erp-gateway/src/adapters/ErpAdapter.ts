export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface StockLevel {
  itemId: string;
  warehouse: string;
  location: string;
  qty: number;
}

export interface InventoryJournalLine {
  itemId: string;
  diff: number;
}

export interface InventoryJournal {
  id: string;
  journalNumber: string;
  status: string;
  createdAt: Date;
  lines: InventoryJournalLine[];
}

export interface ErpAdapter {
  /**
   * Obtener producto por código de barras
   */
  getProductByCode(code: string): Promise<Product | undefined>;

  /**
   * Obtener niveles de stock
   */
  getStockOnHand(itemId: string, warehouse?: string): Promise<StockLevel[]>;

  /**
   * Crear diario de inventario
   */
  postInventoryJournal(lines: InventoryJournalLine[]): Promise<{
    journalId: string;
    journalNumber: string;
    status: string;
  }>;

  /**
   * Obtener salud del adaptador (para healthchecks)
   */
  healthCheck(): Promise<boolean>;
}
