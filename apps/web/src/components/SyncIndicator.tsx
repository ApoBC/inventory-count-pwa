import { useOnline } from '@/hooks/useOnline';
import { useSyncStore } from '@/store/sync';

export function SyncIndicator() {
  const isOnline = useOnline();
  const { progress, lastSyncTime, error } = useSyncStore();

  // No mostrar si no hay items en sync queue
  if (progress.total === 0 && !error) {
    return null;
  }

  const isComplete = progress.synced + progress.failed === progress.total;
  const syncPercentage = progress.total > 0 ? (progress.synced / progress.total) * 100 : 0;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm z-50">
      {/* Status Indicator */}
      <div className={`rounded-lg shadow-lg p-4 text-white ${
        !isOnline
          ? 'bg-gray-600'
          : error
          ? 'bg-red-600'
          : progress.isRunning
          ? 'bg-blue-600'
          : isComplete && progress.synced > 0
          ? 'bg-green-600'
          : 'bg-gray-600'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {!isOnline ? (
            <>
              <span className="text-xl">📱</span>
              <span className="font-medium">Modo Offline</span>
            </>
          ) : error ? (
            <>
              <span className="text-xl">⚠️</span>
              <span className="font-medium">Error en Sync</span>
            </>
          ) : progress.isRunning ? (
            <>
              <span className="text-xl animate-spin">🔄</span>
              <span className="font-medium">Sincronizando...</span>
            </>
          ) : isComplete && progress.synced > 0 ? (
            <>
              <span className="text-xl">✓</span>
              <span className="font-medium">Sincronizado</span>
            </>
          ) : progress.pending > 0 ? (
            <>
              <span className="text-xl">⧗</span>
              <span className="font-medium">Pendiente de Sync</span>
            </>
          ) : null}
        </div>

        {/* Detalles */}
        {progress.total > 0 && (
          <div className="text-sm space-y-1">
            {progress.synced > 0 && (
              <p>✓ Sincronizados: {progress.synced}/{progress.total}</p>
            )}
            {progress.failed > 0 && (
              <p>✗ Fallidos: {progress.failed}</p>
            )}
            {progress.pending > 0 && (
              <p>⧗ Pendientes: {progress.pending}</p>
            )}

            {/* Progress Bar */}
            {!isComplete && (
              <div className="w-full bg-white/30 rounded-full h-2 mt-2">
                <div
                  className="bg-white rounded-full h-2 transition-all"
                  style={{ width: `${syncPercentage}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-sm mt-2 p-2 bg-red-900/30 rounded">
            {error}
          </div>
        )}

        {/* Last Sync Time */}
        {lastSyncTime && (
          <p className="text-xs mt-2 opacity-75">
            Última sync: {new Date(lastSyncTime).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Offline Warning */}
      {!isOnline && (
        <div className="mt-2 bg-gray-700 text-white rounded-lg p-3 text-sm">
          <p className="font-medium mb-1">🚫 Sin conexión</p>
          <p>Los conteos se guardan localmente y se sincronizarán cuando hay conexión.</p>
        </div>
      )}
    </div>
  );
}
