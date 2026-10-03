export interface Product {
  id: string;
  code: string; // EAN-13
  name: string;
  description?: string;
}

export const PRODUCTS: Product[] = [
  { id: 'PROD-001', code: '8718053433147', name: 'Widget A', description: 'Pieza estándar tipo A' },
  { id: 'PROD-002', code: '8718053433154', name: 'Widget B', description: 'Pieza estándar tipo B' },
  { id: 'PROD-003', code: '8718053433161', name: 'Widget C', description: 'Pieza estándar tipo C' },
  { id: 'PROD-004', code: '8718053433178', name: 'Bearing X1', description: 'Rodamiento de bola' },
  { id: 'PROD-005', code: '8718053433185', name: 'Bearing X2', description: 'Rodamiento de rolos' },
  { id: 'PROD-006', code: '8718053433192', name: 'Bolt M6', description: 'Tornillo M6x20' },
  { id: 'PROD-007', code: '8718053433209', name: 'Bolt M8', description: 'Tornillo M8x30' },
  { id: 'PROD-008', code: '8718053433216', name: 'Nut M6', description: 'Tuerca M6' },
  { id: 'PROD-009', code: '8718053433223', name: 'Nut M8', description: 'Tuerca M8' },
  { id: 'PROD-010', code: '8718053433230', name: 'Washer M6', description: 'Arandela M6' },
  { id: 'PROD-011', code: '8718053433247', name: 'Washer M8', description: 'Arandela M8' },
  { id: 'PROD-012', code: '8718053433254', name: 'Spring A', description: 'Resorte tipo A' },
  { id: 'PROD-013', code: '8718053433261', name: 'Spring B', description: 'Resorte tipo B' },
  { id: 'PROD-014', code: '8718053433278', name: 'Seal O-ring', description: 'Sello tipo O-ring' },
  { id: 'PROD-015', code: '8718053433285', name: 'Gasket A', description: 'Empaque tipo A' },
  { id: 'PROD-016', code: '8718053433292', name: 'Hose 1/4', description: 'Manguera 1/4 pulgada' },
  { id: 'PROD-017', code: '8718053433309', name: 'Hose 3/8', description: 'Manguera 3/8 pulgada' },
  { id: 'PROD-018', code: '8718053433316', name: 'Valve A', description: 'Válvula tipo A' },
  { id: 'PROD-019', code: '8718053433323', name: 'Pump B', description: 'Bomba tipo B' },
  { id: 'PROD-020', code: '8718053433330', name: 'Filter C', description: 'Filtro tipo C' },
  { id: 'PROD-021', code: '8718053433347', name: 'Cable 10m', description: 'Cable eléctrico 10m' },
  { id: 'PROD-022', code: '8718053433354', name: 'Connector A', description: 'Conector tipo A' },
  { id: 'PROD-023', code: '8718053433361', name: 'Connector B', description: 'Conector tipo B' },
  { id: 'PROD-024', code: '8718053433378', name: 'Motor 1HP', description: 'Motor eléctrico 1HP' },
  { id: 'PROD-025', code: '8718053433385', name: 'Motor 2HP', description: 'Motor eléctrico 2HP' },
  { id: 'PROD-026', code: '8718053433392', name: 'Gear A', description: 'Engranaje tipo A' },
  { id: 'PROD-027', code: '8718053433409', name: 'Gear B', description: 'Engranaje tipo B' },
  { id: 'PROD-028', code: '8718053433416', name: 'Belt A', description: 'Correa tipo A' },
  { id: 'PROD-029', code: '8718053433423', name: 'Belt B', description: 'Correa tipo B' },
  { id: 'PROD-030', code: '8718053433430', name: 'Frame A', description: 'Marco tipo A' },
];
