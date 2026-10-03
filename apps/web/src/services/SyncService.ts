import { api } from '@/lib/api';
import {
  getSyncQueueItems,
  updateSyncQueueItem,
  removeSyncQueueItem,
  SyncQueueItem,
} from '@/offline/db';

const RETRY_DELAYS = [1000, 2000, 4000, 8000]; // ms
const MAX_RETRIES = RETRY_DELAYS.length;

export interface SyncProgress {
  total: number;
  synced: number;
  failed: number;
  pending: number;
  isRunning: boolean;
}

export class SyncService {
  private isSyncing = false;

  async syncQueue(): Promise<SyncProgress> {
    if (this.isSyncing) {
      return this.getProgress();
    }

    this.isSyncing = true;

    try {
      const items = await getSyncQueueItems();
      const progress: SyncProgress = {
        total: items.length,
        synced: 0,
        failed: 0,
        pending: 0,
        isRunning: true,
      };

      for (const item of items) {
        if (item.status === 'synced') {
          progress.synced++;
          continue;
        }

        const result = await this.syncItem(item);

        if (result) {
          progress.synced++;
          await removeSyncQueueItem(item.id);
        } else {
          progress.failed++;
        }
      }

      progress.pending = items.filter(i => i.status !== 'synced').length - progress.failed;
      progress.isRunning = false;

      return progress;
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncItem(item: SyncQueueItem): Promise<boolean> {
    try {
      const retryCount = item.retryCount || 0;

      if (retryCount >= MAX_RETRIES) {
        // Marcar como fallido permanentemente
        await updateSyncQueueItem(item.id, {
          status: 'failed',
          retryCount,
        });
        return false;
      }

      // Marcar como en progreso
      await updateSyncQueueItem(item.id, {
        status: 'syncing',
      });

      // Enviar según tipo
      let success = false;
      if (item.type === 'count') {
        success = await this.syncCount(item.payload as any);
      } else if (item.type === 'session_approval') {
        success = await this.syncSessionApproval(item.payload as any);
      }

      if (success) {
        // Marcar como sincronizado
        await updateSyncQueueItem(item.id, {
          status: 'synced',
          retryCount,
        });
        return true;
      } else {
        // Reintentar con backoff
        const delayMs = RETRY_DELAYS[retryCount] || 8000;
        await updateSyncQueueItem(item.id, {
          status: 'pending',
          retryCount: retryCount + 1,
          lastRetryAt: Date.now(),
        });

        // Esperar antes de siguiente intento (en background)
        setTimeout(() => {
          this.syncQueue(); // Intentar sincronizar nuevamente
        }, delayMs);

        return false;
      }
    } catch (error) {
      console.error('Error sincronizando item:', error);
      return false;
    }
  }

  private async syncCount(payload: {
    sessionId: string;
    clientId: string;
    itemId: string;
    qty: number;
  }): Promise<boolean> {
    try {
      // POST a /sessions/:id/counts/batch
      await api.post(`/sessions/${payload.sessionId}/counts/batch`, {
        counts: [
          {
            clientId: payload.clientId,
            itemId: payload.itemId,
            qty: payload.qty,
          },
        ],
      });

      return true;
    } catch (error) {
      console.error('Error sincronizando conteo:', error);
      return false;
    }
  }

  private async syncSessionApproval(payload: {
    sessionId: string;
    supervisorId: string;
  }): Promise<boolean> {
    try {
      // POST a /sessions/:id/approve
      await api.post(`/sessions/${payload.sessionId}/approve`, {
        supervisorId: payload.supervisorId,
      });

      return true;
    } catch (error) {
      console.error('Error sincronizando aprobación:', error);
      return false;
    }
  }

  private async getProgress(): Promise<SyncProgress> {
    const items = await getSyncQueueItems();
    return {
      total: items.length,
      synced: items.filter(i => i.status === 'synced').length,
      failed: items.filter(i => i.status === 'failed').length,
      pending: items.filter(i => i.status !== 'synced' && i.status !== 'failed').length,
      isRunning: this.isSyncing,
    };
  }

  isSyncRunning(): boolean {
    return this.isSyncing;
  }
}

export const syncService = new SyncService();
