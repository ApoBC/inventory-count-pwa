export interface StockLevel {
  itemId: string;
  warehouse: string;
  location: string;
  qty: number;
  lastCountedAt?: Date;
}

export const STOCK_LEVELS: StockLevel[] = [
  // Warehouse A - Ubicación Shelf-1
  { itemId: 'PROD-001', warehouse: 'WAREHOUSE-A', location: 'SHELF-1', qty: 100 },
  { itemId: 'PROD-002', warehouse: 'WAREHOUSE-A', location: 'SHELF-1', qty: 80 },
  { itemId: 'PROD-003', warehouse: 'WAREHOUSE-A', location: 'SHELF-1', qty: 120 },
  { itemId: 'PROD-004', warehouse: 'WAREHOUSE-A', location: 'SHELF-1', qty: 50 },
  { itemId: 'PROD-005', warehouse: 'WAREHOUSE-A', location: 'SHELF-1', qty: 60 },

  // Warehouse A - Ubicación Shelf-2
  { itemId: 'PROD-006', warehouse: 'WAREHOUSE-A', location: 'SHELF-2', qty: 200 },
  { itemId: 'PROD-007', warehouse: 'WAREHOUSE-A', location: 'SHELF-2', qty: 150 },
  { itemId: 'PROD-008', warehouse: 'WAREHOUSE-A', location: 'SHELF-2', qty: 180 },
  { itemId: 'PROD-009', warehouse: 'WAREHOUSE-A', location: 'SHELF-2', qty: 170 },
  { itemId: 'PROD-010', warehouse: 'WAREHOUSE-A', location: 'SHELF-2', qty: 140 },

  // Warehouse A - Ubicación Shelf-3
  { itemId: 'PROD-011', warehouse: 'WAREHOUSE-A', location: 'SHELF-3', qty: 90 },
  { itemId: 'PROD-012', warehouse: 'WAREHOUSE-A', location: 'SHELF-3', qty: 75 },
  { itemId: 'PROD-013', warehouse: 'WAREHOUSE-A', location: 'SHELF-3', qty: 110 },
  { itemId: 'PROD-014', warehouse: 'WAREHOUSE-A', location: 'SHELF-3', qty: 95 },
  { itemId: 'PROD-015', warehouse: 'WAREHOUSE-A', location: 'SHELF-3', qty: 85 },

  // Warehouse B - Ubicación Rack-1
  { itemId: 'PROD-016', warehouse: 'WAREHOUSE-B', location: 'RACK-1', qty: 30 },
  { itemId: 'PROD-017', warehouse: 'WAREHOUSE-B', location: 'RACK-1', qty: 25 },
  { itemId: 'PROD-018', warehouse: 'WAREHOUSE-B', location: 'RACK-1', qty: 40 },
  { itemId: 'PROD-019', warehouse: 'WAREHOUSE-B', location: 'RACK-1', qty: 20 },
  { itemId: 'PROD-020', warehouse: 'WAREHOUSE-B', location: 'RACK-1', qty: 35 },

  // Warehouse B - Ubicación Rack-2
  { itemId: 'PROD-021', warehouse: 'WAREHOUSE-B', location: 'RACK-2', qty: 15 },
  { itemId: 'PROD-022', warehouse: 'WAREHOUSE-B', location: 'RACK-2', qty: 10 },
  { itemId: 'PROD-023', warehouse: 'WAREHOUSE-B', location: 'RACK-2', qty: 12 },
  { itemId: 'PROD-024', warehouse: 'WAREHOUSE-B', location: 'RACK-2', qty: 8 },
  { itemId: 'PROD-025', warehouse: 'WAREHOUSE-B', location: 'RACK-2', qty: 5 },

  // Warehouse B - Ubicación Bin-1
  { itemId: 'PROD-026', warehouse: 'WAREHOUSE-B', location: 'BIN-1', qty: 60 },
  { itemId: 'PROD-027', warehouse: 'WAREHOUSE-B', location: 'BIN-1', qty: 55 },
  { itemId: 'PROD-028', warehouse: 'WAREHOUSE-B', location: 'BIN-1', qty: 70 },
  { itemId: 'PROD-029', warehouse: 'WAREHOUSE-B', location: 'BIN-1', qty: 65 },
  { itemId: 'PROD-030', warehouse: 'WAREHOUSE-B', location: 'BIN-1', qty: 50 },
];
