import { Router, type Request, type Response } from 'express';
import { store } from '../data/store.js';
import { logger } from '../config.js';

const router = Router();

// ===== GET /data/Products =====
// Retorna lista de productos sin filtrar
router.get('/Products', (req: Request, res: Response) => {
  try {
    const { $top = '100', $skip = '0' } = req.query;
    const top = Math.min(parseInt(String($top), 10) || 100, 1000);
    const skip = parseInt(String($skip), 10) || 0;

    const allProducts = store.getProducts();
    const products = allProducts.slice(skip, skip + top);

    logger.info({ top, skip, count: products.length }, 'GET /data/Products');

    res.json({
      '@odata.context': "http://localhost:3005/$metadata#Products",
      value: products.map(p => ({
        Id: p.id,
        Code: p.code,
        Name: p.name,
        Description: p.description,
      })),
      '@odata.nextLink': skip + top < allProducts.length
        ? `http://localhost:3005/data/Products?$skip=${skip + top}&$top=${top}`
        : undefined,
    });
  } catch (error) {
    logger.error(error, 'GET /data/Products error');
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ===== GET /data/ProductsV2 con $filter =====
// Simula búsqueda por código EAN-13
router.get('/ProductsV2', (req: Request, res: Response) => {
  try {
    const { $filter, $top = '100' } = req.query;
    let results = store.getProducts();

    // Parse simple $filter: "Code eq '8718053433147'"
    if ($filter && typeof $filter === 'string') {
      const match = $filter.match(/Code\s+eq\s+'([^']+)'/);
      if (match) {
        const code = match[1];
        results = results.filter(p => p.code === code);
        logger.info({ code }, 'Filtered by code');
      }
    }

    const top = Math.min(parseInt(String($top), 10) || 100, 1000);
    const filtered = results.slice(0, top);

    res.json({
      '@odata.context': "http://localhost:3005/$metadata#ProductsV2",
      value: filtered.map(p => ({
        Id: p.id,
        Code: p.code,
        Name: p.name,
        Description: p.description,
      })),
    });
  } catch (error) {
    logger.error(error, 'GET /data/ProductsV2 error');
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ===== GET /data/InventoryOnHandV2 =====
// Retorna stock por warehouse + location
router.get('/InventoryOnHandV2', (req: Request, res: Response) => {
  try {
    const { $filter, $top = '100' } = req.query;
    let results = [];

    // Parse $filter: "ItemId eq 'PROD-001'"
    if ($filter && typeof $filter === 'string') {
      const match = $filter.match(/ItemId\s+eq\s+'([^']+)'/);
      if (match) {
        const itemId = match[1];
        results = store.getStockOnHand(itemId);
        logger.info({ itemId }, 'Stock query by itemId');
      }
    } else {
      // Si no hay filtro, retornar todo
      results = store.getProducts().flatMap(p =>
        store.getStockOnHand(p.id)
      );
    }

    const top = Math.min(parseInt(String($top), 10) || 100, 1000);
    const filtered = results.slice(0, top);

    res.json({
      '@odata.context': "http://localhost:3005/$metadata#InventoryOnHandV2",
      value: filtered.map(stock => ({
        ItemId: stock.itemId,
        Warehouse: stock.warehouse,
        Location: stock.location,
        QuantityOnHand: stock.qty,
        LastCountedDate: stock.lastCountedAt || null,
      })),
    });
  } catch (error) {
    logger.error(error, 'GET /data/InventoryOnHandV2 error');
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ===== POST /data/InventoryCountingJournalHeaders =====
// Crear nuevo diario de inventario
router.post('/InventoryCountingJournalHeaders', (req: Request, res: Response) => {
  try {
    const { Lines } = req.body;

    if (!Lines || !Array.isArray(Lines)) {
      logger.warn({ body: req.body }, 'Invalid request body');
      return res.status(400).json({ error: 'Lines array is required' });
    }

    const journalLines = Lines.map((line: any) => ({
      itemId: line.ItemId || line.itemId,
      diff: line.Diff || line.diff || 0,
    }));

    const journal = store.createInventoryJournal(journalLines);
    logger.info({ journalId: journal.id, lineCount: journal.lines.length }, 'Journal created');

    res.status(201).json({
      '@odata.context': "http://localhost:3005/$metadata#InventoryCountingJournalHeaders",
      Id: journal.id,
      JournalNumber: journal.journalNumber,
      Status: journal.status,
      CreatedDate: journal.createdAt,
      Lines: journal.lines.map(line => ({
        Id: line.id,
        ItemId: line.itemId,
        Diff: line.diff,
      })),
    });
  } catch (error) {
    logger.error(error, 'POST /data/InventoryCountingJournalHeaders error');
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ===== PATCH /data/InventoryCountingJournalHeaders('{id}') =====
// Cambiar estado a Posted
router.patch('/InventoryCountingJournalHeaders/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const journal = store.postJournal(id);

    if (!journal) {
      logger.warn({ id }, 'Journal not found');
      return res.status(404).json({ error: 'Journal not found' });
    }

    logger.info({ journalId: id, status: journal.status }, 'Journal posted');

    res.json({
      '@odata.context': "http://localhost:3005/$metadata#InventoryCountingJournalHeaders",
      Id: journal.id,
      JournalNumber: journal.journalNumber,
      Status: journal.status,
      CreatedDate: journal.createdAt,
    });
  } catch (error) {
    logger.error(error, 'PATCH /data/InventoryCountingJournalHeaders error');
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ===== GET /data/InventoryCountingJournalHeaders('{id}') =====
// Obtener detalle del diario
router.get('/InventoryCountingJournalHeaders/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const journal = store.getJournalById(id);

    if (!journal) {
      logger.warn({ id }, 'Journal not found');
      return res.status(404).json({ error: 'Journal not found' });
    }

    res.json({
      '@odata.context': "http://localhost:3005/$metadata#InventoryCountingJournalHeaders",
      Id: journal.id,
      JournalNumber: journal.journalNumber,
      Status: journal.status,
      CreatedDate: journal.createdAt,
      Lines: journal.lines.map(line => ({
        Id: line.id,
        ItemId: line.itemId,
        Diff: line.diff,
      })),
    });
  } catch (error) {
    logger.error(error, 'GET /data/InventoryCountingJournalHeaders error');
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
