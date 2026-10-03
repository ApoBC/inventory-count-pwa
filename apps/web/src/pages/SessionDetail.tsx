import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supervisorService, CountingDifference, SessionDetail } from '@/services/SupervisorService';
import { useAuthStore } from '@/store/auth';

export function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [differences, setDifferences] = useState<CountingDifference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    loadData();
  }, [sessionId]);

  const loadData = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);

      const [sessionData, diffsData] = await Promise.all([
        supervisorService.getSessionDetail(sessionId),
        supervisorService.getSessionDifferences(sessionId),
      ]);

      setSession(sessionData);
      setDifferences(diffsData || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar datos';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!sessionId || !user?.id) return;

    setApproving(true);
    try {
      const result = await supervisorService.approveSession(sessionId, user.id);
      alert(`✓ Sesión aprobada. Journal ID: ${result.journalId}`);
      navigate('/supervisor-sessions');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error aprobando sesión';
      setError(message);
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sesión No Encontrada</h1>
          <button
            onClick={() => navigate('/supervisor-sessions')}
            className="text-blue-600 hover:text-blue-900 font-medium"
          >
            ← Volver a sesiones
          </button>
        </div>
      </div>
    );
  }

  const summary = supervisorService.calculateSummary(differences);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detalles de Sesión</h1>
            <p className="text-sm text-gray-600 mt-1">ID: {session.id}</p>
          </div>
          <button
            onClick={() => navigate('/supervisor-sessions')}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Volver
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Session Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Almacén</p>
            <p className="text-lg font-bold text-gray-900">{session.warehouse}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Operario</p>
            <p className="text-lg font-bold text-gray-900">{session.operatorId}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Estado</p>
            <p className="text-lg font-bold text-blue-600">{session.status}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Creada</p>
            <p className="text-sm font-mono text-gray-900">
              {new Date(session.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 uppercase tracking-wide">Total Items</p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalItems}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 uppercase tracking-wide">Con Diferencia</p>
            <p className="text-2xl font-bold text-orange-600">
              {summary.itemsWithDifference}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 uppercase tracking-wide">Requieren Reconteo</p>
            <p className="text-2xl font-bold text-red-600">
              {summary.itemsRequiringRecount}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 uppercase tracking-wide">Diferencia Total</p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalDiff}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 uppercase tracking-wide">Promedio %</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary.avgDiffPercent.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Differences Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Diferencias Detectadas</h2>
          </div>

          {differences.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              <p className="mb-2">✓ Sin diferencias</p>
              <p className="text-sm">El conteo coincide perfectamente con el inventario teórico</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Teórico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Contado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Diferencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {differences.map(diff => (
                  <tr key={diff.itemId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{diff.name}</p>
                        <p className="text-sm text-gray-500">{diff.itemId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 font-medium">{diff.theoretical}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 font-medium">{diff.counted}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`font-bold ${
                          diff.diff > 0 ? 'text-red-600' : diff.diff < 0 ? 'text-orange-600' : ''
                        }`}
                      >
                        {diff.diff > 0 ? '+' : ''}{diff.diff}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`font-bold ${
                          Math.abs(diff.diffPercent) > 10 ? 'text-red-600' : 'text-gray-900'
                        }`}
                      >
                        {diff.diffPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {diff.requiresRecount ? (
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          ⚠️ Reconteo
                        </span>
                      ) : (
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          ✓ OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Action Buttons */}
        {session.status === 'CLOSED' && (
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              disabled={approving}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {approving ? '⏳ Aprobando...' : '✓ Aprobar y Enviar a ERP'}
            </button>
            <button
              onClick={() => navigate('/supervisor-sessions')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}

        {session.status === 'APPROVED' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">✓ Sesión ya aprobada</p>
            <p className="text-sm text-green-700 mt-1">
              Aprobada en: {session.approvedAt ? new Date(session.approvedAt).toLocaleString() : 'N/A'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
