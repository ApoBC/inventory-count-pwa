import { create } from 'zustand';
import { syncService, SyncProgress } from '@/services/SyncService';

interface SyncStore {
  progress: SyncProgress;
  lastSyncTime: number | null;
  isAutoSyncEnabled: boolean;
  error: string | null;

  // Acciones
  syncNow: () => Promise<void>;
  enableAutoSync: () => void;
  disableAutoSync: () => void;
  clearError: () => void;
}

export const useSyncStore = create<SyncStore>((set, get) => ({
  progress: {
    total: 0,
    synced: 0,
    failed: 0,
    pending: 0,
    isRunning: false,
  },
  lastSyncTime: null,
  isAutoSyncEnabled: true,
  error: null,

  syncNow: async () => {
    set({ error: null });
    try {
      const progress = await syncService.syncQueue();
      set({
        progress,
        lastSyncTime: Date.now(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error en sincronización';
      set({ error: message });
    }
  },

  enableAutoSync: () => {
    set({ isAutoSyncEnabled: true });
  },

  disableAutoSync: () => {
    set({ isAutoSyncEnabled: false });
  },

  clearError: () => {
    set({ error: null });
  },
}));
