import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Product, Count } from '@/types';
import { saveCounts, addToSyncQueue } from '@/offline/db';
import { soundPlayer } from '@/lib/sound';

const countingSchema = z.object({
  quantity: z.coerce.number().min(0, 'La cantidad debe ser >= 0').max(99999),
});

type CountingForm = z.infer<typeof countingSchema>;

interface CountingFormProps {
  product: Product;
  code: string;
  sessionId: string;
  operatorId: string;
  onCountSaved?: () => void;
}

export function CountingForm({
  product,
  code,
  sessionId,
  operatorId,
  onCountSaved,
}: CountingFormProps) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CountingForm>({
    resolver: zodResolver(countingSchema),
  });

  const onSubmit = async (data: CountingForm) => {
    setSaving(true);
    setError(null);

    try {
      // Crear ID único del cliente para idempotencia
      const clientId = `${Date.now()}-${Math.random()}`;

      // Preparar conteo
      const count: Omit<Count, 'id'> = {
        sessionId,
        clientId,
        itemId: product.id,
        qty: data.quantity,
        synced: false,
        timestamp: new Date().toISOString(),
      };

      // Guardar en IndexedDB
      const countId = await saveCounts([{
        ...count,
        id: clientId, // Usar clientId como ID temporal
      }]);

      // Agregar a sync queue
      await addToSyncQueue('count', {
        sessionId,
        clientId,
        itemId: product.id,
        qty: data.quantity,
      });

      // Sonido de éxito
      soundPlayer.playSuccessSound();

      // Reset formulario
      reset();
      setError(null);

      // Callback
      onCountSaved?.();

      // Redirigir de vuelta al scanner
      setTimeout(() => {
        navigate(`/scanner?sessionId=${sessionId}`);
      }, 500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar conteo';
      setError(message);
      soundPlayer.playErrorSound();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Ingresar Cantidad</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Producto Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Código de Barras:</p>
            <p className="text-lg font-mono text-blue-600 mb-4">{code}</p>

            <p className="text-sm text-gray-600 mb-1">Producto:</p>
            <p className="text-xl font-bold text-gray-900">{product.name}</p>

            {product.description && (
              <>
                <p className="text-sm text-gray-600 mt-3 mb-1">Descripción:</p>
                <p className="text-sm text-gray-700">{product.description}</p>
              </>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad Contada
              </label>
              <input
                {...register('quantity')}
                type="number"
                inputMode="numeric"
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                autoFocus
                disabled={saving}
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Quick buttons */}
              {[1, 5, 10, 25].map(qty => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => {
                    const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                    if (input) {
                      input.value = String(qty);
                      input.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                  }}
                  disabled={saving}
                  className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  {qty}
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {saving ? 'Guardando...' : '✓ Guardar Conteo'}
              </button>

              <button
                type="button"
                onClick={() => navigate(`/scanner?sessionId=${sessionId}`)}
                disabled={saving}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                ← Cancelar
              </button>
            </div>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
            <p className="mb-2 font-medium">💡 Consejos:</p>
            <ul className="space-y-1 text-xs list-disc list-inside">
              <li>Usa los botones rápidos para cantidades comunes</li>
              <li>El conteo se guarda localmente</li>
              <li>Se sincronizará cuando haya conexión</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
