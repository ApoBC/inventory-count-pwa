import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { useScanner } from '@/hooks/useScanner';
import { api } from '@/lib/api';
import { Product, CountingSession } from '@/types';
import { getCountsBySession } from '@/offline/db';

export function Scanner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuthStore();

  const [sessionId, setSessionId] = useState<string | null>(
    searchParams.get('sessionId')
  );
  const [warehouse, setWarehouse] = useState('WAREHOUSE-A');
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState<any[]>([]);
  const [showCounts, setShowCounts] = useState(false);

  // Hook del scanner
  const scanner = useScanner({
    sessionId: sessionId || '',
    onCodeScanned: (product: Product) => {
      // Navegar al formulario de cantidad
      navigate(`/counting-form?sessionId=${sessionId}&code=${product.code}`);
    },
    onError: (error: Error) => {
      setApiError(error.message);
    },
  });

  useEffect(() => {
    if (sessionId) {
      loadCounts();
    }
  }, [sessionId]);

  const loadCounts = async () => {
    if (!sessionId) return;
    try {
      const data = await getCountsBySession(sessionId);
      setCounts(data);
    } catch (err) {
      console.error('Error cargando conteos:', err);
    }
  };

  const handleStartSession = async () => {
    setLoading(true);
    setApiError(null);
    try {
      // Crear sesión en API
      const response = await api.post<CountingSession>('/sessions', {
        warehouse,
        operatorId: user?.id,
      });

      setSessionId(response.id);
      setCounts([]);

      // Inicializar scanner después de crear sesión
      setTimeout(() => {
        scanner.initializeScanner();
      }, 500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear sesión';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    try {
      if (sessionId) {
        // TODO: cerrar sesión en API
        // await api.post(`/sessions/${sessionId}/close`, {});
      }
      await scanner.stopScanning();
      setSessionId(null);
      setCounts([]);
      setShowCounts(false);
    } catch (err) {
      console.error('Error finalizando sesión:', err);
    }
  };

  const handleApproveSession = async () => {
    try {
      if (sessionId) {
        // TODO: enviar para aprobación a supervisor
        // await api.post(`/sessions/${sessionId}/approve`, {
        //   supervisorId: user?.id,
        // });
        alert('Sesión enviada para aprobación (en desarrollo)');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error aprobando sesión';
      setApiError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📱 Escanear Código</h1>
            <p className="text-sm text-gray-600 mt-1">
              Usuario: {user?.username}
            </p>
          </div>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8 pb-20">
        {!sessionId ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Iniciar Nueva Sesión
            </h2>

            {apiError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{apiError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Almacén
                </label>
                <select
                  value={warehouse}
                  onChange={e => setWarehouse(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="WAREHOUSE-A">Almacén A</option>
                  <option value="WAREHOUSE-B">Almacén B</option>
                </select>
              </div>

              <button
                onClick={handleStartSession}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Creando sesión...' : '▶ Comenzar Conteo'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Session Info */}
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
              <p className="text-green-900 font-bold">
                ✓ Sesión activa: {sessionId.slice(0, 8)}...
              </p>
              <p className="text-sm text-green-800">
                Almacén: {warehouse}
              </p>
            </div>

            {/* Errores */}
            {scanner.error && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ {scanner.error}
                </p>
                <button
                  onClick={scanner.clearError}
                  className="text-xs text-yellow-600 hover:text-yellow-900 mt-2 font-medium"
                >
                  Descartar
                </button>
              </div>
            )}

            {/* Camera Preview */}
            <div className="bg-black rounded-lg shadow-lg overflow-hidden">
              <video
                ref={scanner.videoRef}
                autoPlay
                playsInline
                className="w-full aspect-video bg-black object-cover"
              />

              {!scanner.isScanning && !scanner.isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <button
                    onClick={scanner.initializeScanner}
                    disabled={scanner.isInitializing}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg"
                  >
                    📷 Iniciar Escaneo
                  </button>
                </div>
              )}

              {scanner.isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-blue-600 mb-2 mx-auto"></div>
                    <p>Inicializando cámara...</p>
                  </div>
                </div>
              )}

              {scanner.isScanning && (
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  EN VIVO
                </div>
              )}
            </div>

            {/* Último código escaneado */}
            {scanner.lastScannedCode && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 animate-pulse">
                <p className="text-sm text-blue-800 font-medium">Código detectado:</p>
                <p className="text-xl font-mono text-blue-700 mt-1">
                  {scanner.lastScannedCode}
                </p>
              </div>
            )}

            {/* Conteos realizados */}
            <div className="bg-white rounded-lg shadow">
              <button
                onClick={() => {
                  setShowCounts(!showCounts);
                  if (!showCounts) loadCounts();
                }}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 rounded-lg"
              >
                <h3 className="text-lg font-bold text-gray-900">
                  Conteos Realizados ({counts.length})
                </h3>
                <span className="text-2xl">{showCounts ? '▼' : '▶'}</span>
              </button>

              {showCounts && (
                <div className="px-6 pb-4 border-t border-gray-200">
                  {counts.length === 0 ? (
                    <p className="text-center text-gray-600 py-4">No hay conteos aún</p>
                  ) : (
                    <ul className="space-y-2">
                      {counts.map(count => (
                        <li
                          key={count.id}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm"
                        >
                          <span className="font-mono">{count.itemId.slice(0, 8)}</span>
                          <span className="font-bold text-blue-600">{count.qty} unidades</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            count.synced
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {count.synced ? '✓ Sincronizado' : '⧗ Local'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleApproveSession}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                ✓ Enviar para Aprobación
              </button>
              <button
                onClick={handleEndSession}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                ✕ Finalizar
              </button>
            </div>

            {/* Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <p className="font-bold text-blue-900 mb-2">💡 Consejos:</p>
              <ul className="space-y-1 text-blue-800 text-xs list-disc list-inside">
                <li>Mantén el código cerca de la cámara</li>
                <li>Los conteos se guardan localmente automáticamente</li>
                <li>Se sincronizarán cuando haya conexión</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
