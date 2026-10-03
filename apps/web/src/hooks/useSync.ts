import { useEffect, useRef } from 'react';
import { useOnline } from './useOnline';
import { useSyncStore } from '@/store/sync';

interface UseSyncOptions {
  autoSync?: boolean;
  syncInterval?: number; // ms
  onSyncComplete?: () => void;
}

export function useSync({
  autoSync = true,
  syncInterval = 30000, // 30 segundos
  onSyncComplete,
}: UseSyncOptions = {}) {
  const isOnline = useOnline();
  const { syncNow, isAutoSyncEnabled } = useSyncStore();
  const syncTimerRef = useRef<NodeJS.Timeout>();
  const lastSyncRef = useRef<number>(0);

  useEffect(() => {
    // Limpiar timer anterior
    if (syncTimerRef.current) {
      clearInterval(syncTimerRef.current);
    }

    // Si offline o auto-sync deshabilitado, no hacer nada
    if (!isOnline || !autoSync || !isAutoSyncEnabled) {
      return;
    }

    // Sincronizar inmediatamente si no se ha sincronizado recientemente
    const now = Date.now();
    if (now - lastSyncRef.current > 5000) { // Esperar 5s mínimo entre syncs
      syncNow().then(() => {
        lastSyncRef.current = now;
        onSyncComplete?.();
      });
    }

    // Configurar sincronización periódica
    syncTimerRef.current = setInterval(() => {
      syncNow().then(() => {
        lastSyncRef.current = Date.now();
        onSyncComplete?.();
      });
    }, syncInterval);

    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
    };
  }, [isOnline, autoSync, isAutoSyncEnabled, syncInterval, syncNow, onSyncComplete]);

  return {
    isOnline,
    syncNow,
    isAutoSyncEnabled,
  };
}
