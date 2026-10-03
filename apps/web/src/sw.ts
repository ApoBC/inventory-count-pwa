/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Cache estrategia para APIs de inventario (NetworkFirst - intentar red primero)
registerRoute(
  ({ url }) => url.pathname.startsWith('/items') || url.pathname.startsWith('/products'),
  new NetworkFirst({
    cacheName: 'inventory-api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 3600, // 1 hora
      }),
    ],
  })
);

// Cache estrategia para auth (NetworkFirst)
registerRoute(
  ({ url }) => url.pathname.startsWith('/auth'),
  new NetworkFirst({
    cacheName: 'auth-api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 300, // 5 minutos
      }),
    ],
  })
);

// Cache estrategia para sessions/counting (NetworkFirst)
registerRoute(
  ({ url }) => url.pathname.startsWith('/sessions'),
  new NetworkFirst({
    cacheName: 'counting-api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 600, // 10 minutos
      }),
    ],
  })
);

// Cache estrategia para assets estáticos (CacheFirst)
registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'font',
  new CacheFirst({
    cacheName: 'assets-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 86400 * 30, // 30 días
      }),
    ],
  })
);

// Cache estrategia para CSS/JS (StaleWhileRevalidate)
registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'script',
  new StaleWhileRevalidate({
    cacheName: 'assets-cache',
  })
);

// Mensaje para actualización disponible
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
