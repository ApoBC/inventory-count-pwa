import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SyncIndicator } from '@/components/SyncIndicator';
import { Login } from '@/pages/Login';
import { Scanner } from '@/pages/Scanner';
import { CountingForm } from '@/pages/CountingForm';
import { Dashboard } from '@/pages/Dashboard';
import { SessionsList } from '@/pages/SessionsList';
import { SessionDetailPage } from '@/pages/SessionDetail';
import { getProductByCode } from '@/offline/db';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { useSync } from '@/hooks/useSync';
import './index.css';

// Wrapper para CountingForm que obtiene el producto
function CountingFormWrapper() {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);

  const sessionId = searchParams.get('sessionId');
  const code = searchParams.get('code');

  useEffect(() => {
    if (!code) return;

    const loadProduct = async () => {
      try {
        // 1. Intentar obtener de caché local
        const cached = await getProductByCode(code);
        if (cached) {
          setProduct(cached);
          return;
        }

        // 2. Si no, obtener de API
        const data = await api.get<Product>(`/items/barcode/${code}`);
        setProduct(data);
      } catch (err) {
        console.error('Error obteniendo producto:', err);
      }
    };

    loadProduct();
  }, [code]);

  if (!sessionId || !code || !product) {
    return <Navigate to={`/scanner?sessionId=${sessionId}`} replace />;
  }

  return (
    <ProtectedRoute requiredRole="OPERATOR">
      <CountingForm
        product={product}
        code={code}
        sessionId={sessionId}
        operatorId={user?.id || ''}
      />
    </ProtectedRoute>
  );
}

export function App() {
  const { restoreSession } = useAuthStore();

  // Iniciar auto-sync cuando hay conexión
  useSync({
    autoSync: true,
    syncInterval: 30000, // Sincronizar cada 30 segundos
  });

  useEffect(() => {
    // Restaurar sesión al cargar la app
    restoreSession();

    // Registrar service worker para PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('Service Worker registrado:', registration);
        })
        .catch(error => {
          console.error('Error registrando Service Worker:', error);
        });
    }
  }, [restoreSession]);

  return (
    <BrowserRouter>
      <SyncIndicator />
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Operario - Scanner */}
        <Route
          path="/scanner"
          element={
            <ProtectedRoute requiredRole="OPERATOR">
              <Scanner />
            </ProtectedRoute>
          }
        />

        {/* Operario - Counting Form */}
        <Route
          path="/counting-form"
          element={<CountingFormWrapper />}
        />

        {/* Supervisor - Dashboard (deprecated) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="SUPERVISOR">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Supervisor - Sessions List */}
        <Route
          path="/supervisor-sessions"
          element={
            <ProtectedRoute requiredRole="SUPERVISOR">
              <SessionsList />
            </ProtectedRoute>
          }
        />

        {/* Supervisor - Session Detail */}
        <Route
          path="/session-detail/:sessionId"
          element={
            <ProtectedRoute requiredRole="SUPERVISOR">
              <SessionDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Root - redirigir según rol */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900">404</h1>
                <p className="text-gray-600 mt-2">Página no encontrada</p>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
