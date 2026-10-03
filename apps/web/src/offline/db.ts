import Dexie, { Table } from 'dexie';
import { Product, Count, SyncQueueItem } from '@/types';

export interface LocalProduct extends Product {
  cachedAt: number;
}

export interface LocalCount extends Count {
  clientUuid: string;
}

export class InventoryDB extends Dexie {
  products!: Table<LocalProduct>;
  counts!: Table<LocalCount>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super('InventoryCountDB');
    this.version(1).stores({
      products: 'id, code, cachedAt',
      counts: 'id, sessionId, clientUuid, itemId',
      syncQueue: 'id, type, status, createdAt',
    });
  }
}

export const db = new InventoryDB();

// Utilidades para el caché de productos
export async function cacheProduct(product: Product) {
  const localProduct: LocalProduct = {
    ...product,
    cachedAt: Date.now(),
  };
  return db.products.put(localProduct);
}

export async function getProductByCode(code: string): Promise<LocalProduct | undefined> {
  return db.products.where('code').equals(code).first();
}

export async function getProductById(id: string): Promise<LocalProduct | undefined> {
  return db.products.get(id);
}

export async function clearProductCache() {
  return db.products.clear();
}

// Utilidades para conteos
export async function saveCounts(counts: LocalCount[]) {
  return db.counts.bulkAdd(counts, { allKeys: true });
}

export async function getCountsBySession(sessionId: string): Promise<LocalCount[]> {
  return db.counts.where('sessionId').equals(sessionId).toArray();
}

export async function getCountById(id: string): Promise<LocalCount | undefined> {
  return db.counts.get(id);
}

export async function updateCountSyncStatus(countId: string, synced: boolean) {
  return db.counts.update(countId, { synced });
}

export async function clearCountsBySession(sessionId: string) {
  return db.counts.where('sessionId').equals(sessionId).delete();
}

// Utilidades para sync queue
export async function addToSyncQueue(
  type: 'count' | 'session_approval',
  payload: unknown
): Promise<string> {
  const item: SyncQueueItem = {
    id: `${Date.now()}-${Math.random()}`,
    type,
    payload,
    status: 'pending',
    retryCount: 0,
    createdAt: Date.now(),
  };
  return db.syncQueue.add(item);
}

export async function getSyncQueueItems(): Promise<SyncQueueItem[]> {
  return db.syncQueue.where('status').anyOf(['pending', 'failed']).toArray();
}

export async function updateSyncQueueItem(
  id: string,
  update: Partial<SyncQueueItem>
) {
  return db.syncQueue.update(id, update);
}

export async function removeSyncQueueItem(id: string) {
  return db.syncQueue.delete(id);
}

export async function clearSyncQueue() {
  return db.syncQueue.clear();
}

// Transacción para sincronizar múltiples conteos
export async function syncCounts(
  sessionId: string,
  counts: Omit<LocalCount, 'clientUuid'>[]
) {
  return db.transaction('rw', db.counts, db.syncQueue, async () => {
    // Guardar conteos locales
    const countIds = await db.counts.bulkAdd(
      counts.map(c => ({
        ...c,
        clientUuid: `${Date.now()}-${Math.random()}`,
      })),
      { allKeys: true }
    );

    // Agregar a sync queue
    for (const count of counts) {
      await db.syncQueue.add({
        id: `${Date.now()}-${Math.random()}`,
        type: 'count',
        payload: count,
        status: 'pending',
        retryCount: 0,
        createdAt: Date.now(),
      });
    }

    return countIds;
  });
}
