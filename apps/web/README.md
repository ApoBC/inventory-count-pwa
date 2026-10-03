# Inventory Count PWA

Aplicación PWA (Progressive Web App) para conteo de inventario con soporte offline-first.

## Características

- ✅ React 18 + TypeScript
- ✅ Vite para build rápido
- ✅ PWA con Service Workers (Workbox)
- ✅ Tailwind CSS para estilos
- ✅ IndexedDB para almacenamiento local (Dexie)
- ✅ React Router para navegación
- ✅ React Hook Form + Zod para validación
- ✅ TanStack Query para data fetching
- ✅ Zustand para state management
- ✅ Soporte para escaneo de códigos (próxima fase)
- ✅ Funcionamiento offline con sync automático

## Estructura

```
src/
├── components/          # Componentes reutilizables
├── pages/              # Páginas/pantallas
├── lib/                # Utilidades (API client, etc.)
├── store/              # Estado global (Zustand)
├── offline/            # IndexedDB + sync
├── types/              # Tipos TypeScript
├── App.tsx             # Aplicación principal
├── main.tsx            # Entry point
└── index.css           # Estilos globales
```

## Instalación

```bash
pnpm install
```

## Desarrollo

```bash
pnpm dev
# Abre http://localhost:5173
```

## Build

```bash
pnpm build
# Output en dist/
```

## Preview (producción)

```bash
pnpm preview
# Abre http://localhost:4173
```

## Variables de Entorno

Copia `.env.example` a `.env.local`:

```bash
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Inventory Count
```

## Usuarios de Prueba

- **Operario:** OP001 / pass123
- **Supervisor:** SV001 / pass123

## Flujo de Autenticación

1. Usuario ingresa en login
2. Credenciales se envían a `/auth/login`
3. API retorna `accessToken` + `refreshToken`
4. Tokens se guardan en `sessionStorage`
5. JWT se adjunta automáticamente en headers
6. Si token expira → se intenta refresh automático
7. Si refresh falla → redirige a login

## Almacenamiento Offline

### IndexedDB (Dexie)

- **products**: Caché de productos (TTL: 1 hora)
- **counts**: Conteos locales de la sesión
- **syncQueue**: Cola de operaciones pendientes

### Service Worker

- Caché de assets (CSS, JS, imágenes)
- Caché de APIs con estrategias:
  - NetworkFirst: inventario, auth (intentar red primero)
  - CacheFirst: imágenes, fuentes (caché primero)
  - StaleWhileRevalidate: CSS/JS (servir mientras actualiza)

## Pagos PWA

- **Login** (`/login`): Autenticación
- **Scanner** (`/scanner`): Escaneo para operarios
- **Dashboard** (`/dashboard`): Panel supervisor

## Próximas Fases

- [ ] FASE 6.1: Login & Auth (en progreso)
- [ ] FASE 6.2: Scanner con barcode
- [ ] FASE 6.3: Offline & sync queue
- [ ] FASE 7: Tests
- [ ] FASE 8: Docker & Deploy
- [ ] FASE 9: Demo

## Testing

```bash
pnpm test
pnpm test --watch
```

## Build para Docker

```bash
docker build -t inventory-count-web .
docker run -p 5173:5173 inventory-count-web
```
