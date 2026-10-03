# 📦 Módulos del Proyecto 05 - Checklist de Implementación

**Objetivo:** Guía paso a paso de los módulos a implementar en orden de dependencias.

---

## FASE 0: Setup Inicial (1 día)

### ✅ Infraestructura Base

- [ ] **Docker Compose**
  - [ ] Configurar PostgreSQL 16
  - [ ] Configurar Redis
  - [ ] Configurar Nginx básico
  - Archivo: `infra/docker-compose.yml` ✓ (ya existe)

- [ ] **Monorepo pnpm**
  - [ ] Root `package.json` con workspaces ✓ (ya existe)
  - [ ] `.env.example` ✓ (ya existe)
  - [ ] `.gitignore` (agregar `/node_modules`, `/dist`, `.env.local`)

- [ ] **CI/CD básico**
  - [ ] `.github/workflows/test.yml` (lint + test en push)
  - [ ] `.github/workflows/build.yml` (build en PR)

- [ ] **Shared types**
  - [ ] `packages/shared/src/types.ts` (User, Product, StockLevel, CountingSession, etc.)
  - [ ] `packages/shared/src/dtos.ts` (request/response payloads)
  - [ ] `packages/shared/tsconfig.json`
  - [ ] `packages/shared/package.json`

**Entregable:** `docker compose up` levanta PostgreSQL + Redis sin errores.

---

## FASE 1: ERP Mock & Gateway (1 día)

### 📦 apps/erp-mock

**Responsabilidad:** Simular OData v4 con datos semilla.

**Módulos a crear:**

- [ ] **Estructura base**
  - [ ] `src/server.ts` (Express básico)
  - [ ] `src/config.ts` (puerto, logging)
  - [ ] `package.json` con scripts: `dev`, `build`, `test`
  - [ ] `tsconfig.json`
  - [ ] `Dockerfile` (Node.js 20-alpine)

- [ ] **Datos semilla (seed)**
  - [ ] `src/data/products.ts` (30 productos con EAN-13)
    ```typescript
    export const PRODUCTS = [
      { id: 'PROD-001', code: '8718053433147', name: 'Widget A', description: '...' },
      // ... 29 más
    ];
    ```
  - [ ] `src/data/stock.ts` (stock por warehouse)
  - [ ] `src/data/store.ts` (singleton para guardar estado en memoria)

- [ ] **Rutas OData**
  - [ ] `GET /data/Products?$top=100` → lista de productos
  - [ ] `GET /data/ProductsV2?$filter=Code eq 'EAN-123'` → filtrar por código
  - [ ] `GET /data/InventoryOnHandV2?$filter=ItemId eq 'PROD-001'` → stock por ubicación
  - [ ] `POST /data/InventoryCountingJournalHeaders` → crear diario (dummy)
  - [ ] Error handling: 404, 400, 500

**Tests:**
- [ ] Test que `GET /data/Products` retorna array
- [ ] Test que filtro `$filter` funciona
- [ ] Test que POST crea diario con ID único

**Entregable:** `localhost:3005/data/Products` retorna JSON válido.

---

### 📦 apps/erp-gateway

**Responsabilidad:** Abstraer adaptadores ERP (mock, ERPNext, D365).

**Módulos a crear:**

- [ ] **Estructura base**
  - [ ] `src/server.ts`
  - [ ] `src/config.ts`
  - [ ] `package.json`, `tsconfig.json`, `Dockerfile`

- [ ] **Interfaz de adaptador**
  - [ ] `src/adapters/ErpAdapter.ts` (interface TypeScript)
  ```typescript
  export interface ErpAdapter {
    getProductByCode(code: string): Promise<Product>;
    getStockOnHand(itemId: string, warehouse?: string): Promise<StockLevel[]>;
    postInventoryJournal(journal: InventoryJournal): Promise<{ journalId: string }>;
  }
  ```

- [ ] **Adaptador Mock**
  - [ ] `src/adapters/MockAdapter.ts` (calls erp-mock)
  - [ ] Método para cargar productos + stock desde ERP Mock
  - [ ] Retry logic (3 intentos con backoff)

- [ ] **Rutas del Gateway**
  - [ ] `GET /products/:code` → llama MockAdapter
  - [ ] `GET /stock?itemId=X&warehouse=Y`
  - [ ] `POST /inventory-journals` → crea diario
  - [ ] Health check: `GET /health` → { status: 'ok' }

- [ ] **Error handling**
  - [ ] ERP inaccesible → return 503 Service Unavailable
  - [ ] Producto no encontrado → return 404
  - [ ] Producto mal formado → return 400

**Tests:**
- [ ] MockAdapter retorna producto válido
- [ ] MockAdapter retorna stock correcto
- [ ] Retry funciona tras fallos temporales
- [ ] Logs incluyen timestamps y stack traces

**Entregable:** `localhost:3004/products/8718053433147` retorna producto del mock.

---

## FASE 2: Auth Service (1 día)

### 📦 apps/auth-service

**Responsabilidad:** Autenticación JWT, gestión de usuarios.

**Módulos a crear:**

- [ ] **Estructura base**
  - [ ] `src/server.ts`
  - [ ] `src/config.ts`
  - [ ] `package.json`, `tsconfig.json`, `Dockerfile`
  - [ ] `src/database.ts` (Prisma connection)

- [ ] **Prisma setup**
  - [ ] `prisma/schema.prisma`
    ```prisma
    model User {
      id        String   @id @default(cuid())
      username  String   @unique
      password  String
      role      String   // 'OPERATOR' | 'SUPERVISOR'
      createdAt DateTime @default(now())
    }
    ```
  - [ ] `prisma/.env` (DATABASE_URL)
  - [ ] Migration: `prisma migrate dev --name init`

- [ ] **Controlador de Auth**
  - [ ] `src/controllers/AuthController.ts`
    - [ ] POST `/auth/login` → genera JWT
    - [ ] POST `/auth/refresh` → refresh token
    - [ ] GET `/auth/me` → usuario actual
    - [ ] POST `/auth/logout` → (opcional)

- [ ] **Servicio de JWT**
  - [ ] `src/services/TokenService.ts`
    - [ ] Generar access token (24h)
    - [ ] Generar refresh token (7d, guardado en BD)
    - [ ] Verificar tokens
    - [ ] Leer claims (userId, role)

- [ ] **Hash de contraseñas**
  - [ ] `src/services/PasswordService.ts`
    - [ ] Hash con bcrypt (rounds: 10)
    - [ ] Verificar con bcrypt

- [ ] **Middleware de autenticación**
  - [ ] `src/middleware/auth.ts`
    - [ ] Extraer JWT de header Authorization
    - [ ] Verificar firma
    - [ ] Retornar 401 si inválido

- [ ] **Seed de usuarios de prueba**
  - [ ] `prisma/seed.ts`
    ```typescript
    // Crear 3 operarios + 2 supervisores
    const users = [
      { username: 'OP001', password: 'pass123', role: 'OPERATOR' },
      // ...
    ];
    ```
  - [ ] Script: `pnpm prisma db seed`

**Tests:**
- [ ] Login con credenciales correctas → retorna token
- [ ] Login con credenciales incorrectas → 401
- [ ] GET /auth/me con token válido → retorna usuario
- [ ] GET /auth/me sin token → 401
- [ ] Refresh token genera nuevo access token
- [ ] Token expirado rechazado

**Entregable:** `POST localhost:3001/auth/login { username: 'OP001', password: 'pass123' }` retorna JWT válido.

---

## FASE 3: Inventory Service (1-2 días)

### 📦 apps/inventory-service

**Responsabilidad:** Catálogo de productos + niveles de stock.

**Módulos a crear:**

- [ ] **Estructura base**
  - [ ] `src/server.ts`, `src/config.ts`
  - [ ] `package.json`, `tsconfig.json`, `Dockerfile`
  - [ ] `src/database.ts` (Prisma)

- [ ] **Prisma schema**
  - [ ] `prisma/schema.prisma`
    ```prisma
    model Product {
      id          String   @id @default(cuid())
      code        String   @unique  // EAN-13
      name        String
      description String?
      createdAt   DateTime @default(now())
      stockLevels StockLevel[]
    }

    model StockLevel {
      id        String   @id @default(cuid())
      productId String
      product   Product  @relation(fields: [productId], references: [id])
      warehouse String
      location  String?
      qty       Int
      lastCountedAt DateTime?
      updatedAt DateTime @default(now())
      @@unique([productId, warehouse, location])
    }
    ```

- [ ] **Controlador de Productos**
  - [ ] `src/controllers/ProductController.ts`
    - [ ] `GET /items` → lista paginada
    - [ ] `GET /items/:id` → detalle
    - [ ] `GET /items/barcode/:code` → por código (con caché Redis)
    - [ ] `GET /items/search?q=widget` → búsqueda

- [ ] **Controlador de Stock**
  - [ ] `src/controllers/StockController.ts`
    - [ ] `GET /stock?itemId=X&warehouse=Y` → niveles
    - [ ] `PATCH /stock/:id` → actualizar (solo backend)

- [ ] **Servicio de caché**
  - [ ] `src/services/CacheService.ts`
    - [ ] `get(key)` → obtener de Redis
    - [ ] `set(key, value, ttl)` → guardar con expiración
    - [ ] Invalidar caché al actualizar stock

- [ ] **Sincronización con ERP**
  - [ ] `src/tasks/SyncFromErpTask.ts`
    - [ ] Job cron: cada 1 hora
    - [ ] Llama ERP Gateway: GET /products, GET /stock
    - [ ] Upsert en BD
    - [ ] Logging de cambios

- [ ] **Seed inicial**
  - [ ] Cargar 30 productos + stock desde ERP Mock
  - [ ] Comando: `pnpm seed:products`

**Tests:**
- [ ] GET /items?limit=10 retorna array paginado
- [ ] GET /items/barcode/8718053433147 retorna producto
- [ ] GET /stock filtra por warehouse
- [ ] Caché Redis funciona (hit/miss)
- [ ] Búsqueda por nombre funciona
- [ ] Cron sync actualiza stock

**Entregable:** `GET localhost:3002/items/barcode/8718053433147` retorna producto con stock.

---

## FASE 4: Counting Service (2-3 días)

### 📦 apps/counting-service

**Responsabilidad:** Sesiones de conteo, upsert idempotente, cálculo de diferencias.

**Módulos a crear:**

- [ ] **Estructura base**
  - [ ] `src/server.ts`, `src/config.ts`
  - [ ] `package.json`, `tsconfig.json`, `Dockerfile`

- [ ] **Prisma schema**
  - [ ] `prisma/schema.prisma`
    ```prisma
    model CountingSession {
      id          String   @id @default(cuid())
      warehouse   String
      location    String?
      operatorId  String
      status      String   // 'OPEN' | 'CLOSED' | 'APPROVED'
      createdAt   DateTime @default(now())
      closedAt    DateTime?
      approvedAt  DateTime?
      supervisorId String?
      counts      Count[]
    }

    model Count {
      id        String   @id @default(cuid())
      sessionId String
      session   CountingSession @relation(fields: [sessionId], references: [id])
      clientId  String   // UUID del celular
      itemId    String
      qty       Int
      synced    Boolean  @default(false)
      timestamp DateTime @default(now())
      @@unique([sessionId, clientId, itemId])  // Idempotencia
    }

    model InventoryJournal {
      id        String   @id @default(cuid())
      sessionId String
      session   CountingSession @relation(fields: [sessionId], references: [id])
      erpJournalId String?
      status    String   // 'DRAFT' | 'POSTED'
      lines     InventoryJournalLine[]
      createdAt DateTime @default(now())
    }

    model InventoryJournalLine {
      id        String   @id @default(cuid())
      journalId String
      itemId    String
      diff      Int
    }
    ```

- [ ] **Controlador de Sesiones**
  - [ ] `src/controllers/SessionController.ts`
    - [ ] `POST /sessions` → crear nueva sesión
    - [ ] `GET /sessions/:id` → detalles
    - [ ] `GET /sessions` → listar activas
    - [ ] `PATCH /sessions/:id` → cambiar status

- [ ] **Controlador de Conteos**
  - [ ] `src/controllers/CountController.ts`
    - [ ] **`POST /sessions/:id/counts/batch`** ← CRÍTICO
      - [ ] Recibe array de { clientId, itemId, qty }
      - [ ] Upsert en BD por (sessionId, clientId, itemId)
      - [ ] Retorna { accepted, errors }
    - [ ] `GET /sessions/:id/counts` → lista de conteos

- [ ] **Controlador de Diferencias**
  - [ ] `src/controllers/DifferenceController.ts`
    - [ ] **`GET /sessions/:id/differences`** ← CRÍTICO
      - [ ] Calcula: theoretical vs counted
      - [ ] Retorna array con diff, diff%, flagged
    - [ ] Marcar como "requiere doble conteo" si diff% > 10%

- [ ] **Controlador de Aprobación**
  - [ ] `src/controllers/ApprovalController.ts`
    - [ ] **`POST /sessions/:id/approve`** ← CRÍTICO
      - [ ] Crear InventoryJournal con líneas
      - [ ] Llamar ERP Gateway: POST /inventory-journals
      - [ ] Guardar erpJournalId
      - [ ] Marcar sesión como APPROVED
      - [ ] Retornar { success, journalId }

- [ ] **Servicio de diferencias**
  - [ ] `src/services/DifferenceService.ts`
    - [ ] Obtener stock teórico de inventory-service
    - [ ] Sumar conteos de BD
    - [ ] Calcular diff, diff%
    - [ ] Determinar si requiere recuento

- [ ] **Transacciones DB**
  - [ ] Usar `prisma.$transaction()` en `/approve` para garantizar ACID

**Tests (CRÍTICOS):**
- [ ] Idempotencia: enviar 2x el mismo conteo → solo cuenta 1
- [ ] Batch con errores: algunos aceptados, otros rechazados
- [ ] Diferencias calculadas correctamente: (counted - theoretical)
- [ ] Diario creado en ERP al aprobar
- [ ] Sesión no puede ser aprobada 2 veces

**Entregable:**
```bash
POST localhost:3003/sessions
{ warehouse: "WAREHOUSE-A", operatorId: "OP001" }
→ { sessionId: "sess-123" }

POST localhost:3003/sessions/sess-123/counts/batch
{ counts: [{ clientId: "client-uuid", itemId: "prod-001", qty: 95 }] }
→ { accepted: [...], errors: [] }

GET localhost:3003/sessions/sess-123/differences
→ [{ itemId: "prod-001", theoretical: 100, counted: 95, diff: -5 }]
```

---

## ✅ FASE 5: API Gateway (1 día) - COMPLETADA

### 📦 apps/api-gateway

**Responsabilidad:** Punto único de entrada, enrutamiento, rate limiting.

**Módulos creados:**

- [x] **Estructura base** ✅
  - [x] `src/server.ts`
  - [x] `src/config.ts`
  - [x] `package.json`, `tsconfig.json`, `Dockerfile`

- [x] **Enrutamiento** ✅
  - [x] Proxy `/auth/*` → auth-service (3001)
  - [x] Proxy `/items/*` → inventory-service (3002)
  - [x] Proxy `/stock/*` → inventory-service (3002)
  - [x] Proxy `/sync/*` → inventory-service (3002)
  - [x] Proxy `/sessions/*` → counting-service (3003)
  - [x] Health check: `GET /health` con verificación de 5 servicios

- [x] **Middleware** ✅
  - [x] CORS completo (origin configurable)
  - [x] Rate limiting (100 req/min por cliente)
  - [x] Logging con Pino
  - [x] Error handling (404, 502, 500)

- [x] **Proxy a servicios** ✅
  - [x] http-proxy-middleware para redirección transparente
  - [x] Timeout: 30s (implícito en axios)
  - [x] Reintentos: manejados por servicios aguas arriba

**Tests realizados:**
- [x] GET /health retorna 200 + estado de servicios
- [x] Ruta no existente retorna 404
- [x] Rate limit rechaza >100 req/min
- [x] Error en servicio backend retorna 502/503
- [x] CORS headers presentes

**Entregable:** ✅ `GET localhost:3000/health` retorna `{ status: 'ok', upstream: {...} }`

---

## ✅ FASE 6: PWA Frontend - Estructura Base (1 día) - COMPLETADA

### 📦 apps/web

**Responsabilidad:** UI, escaneo, offline sync.

**Módulos creados:**

- [x] **Estructura Vite + React** ✅
  - [x] `vite.config.ts` (con vite-plugin-pwa)
  - [x] `package.json` (scripts: dev, build, preview)
  - [x] `src/main.tsx` (entry point)
  - [x] `tsconfig.json`

- [x] **PWA Configuration** ✅
  - [x] `vite.config.ts` con `VitePWA({ ... })`
  - [x] Manifest configurado (name, icons, display)
  - [x] Service Worker: `src/sw.ts` con Workbox

- [x] **Estructura de carpetas** ✅
  - [x] `src/components/` → ProtectedRoute
  - [x] `src/pages/` → Login, Scanner, Dashboard
  - [x] `src/offline/` → IndexedDB (Dexie)
  - [x] `src/lib/` → API client
  - [x] `src/store/` → Auth store (Zustand)
  - [x] `src/types/` → Tipos TypeScript

- [x] **Tailwind CSS** ✅
  - [x] `tailwind.config.js`
  - [x] `postcss.config.js`
  - [x] Estilos globales + componentes

- [x] **Routing** ✅
  - [x] `src/pages/Login.tsx` - Autenticación
  - [x] `src/pages/Scanner.tsx` - UI para operarios
  - [x] `src/pages/Dashboard.tsx` - Panel supervisor
  - [x] `src/App.tsx` - React Router + rutas protegidas

- [x] **HTTP Client** ✅
  - [x] `src/lib/api.ts` (Axios + interceptores)
  - [x] Auto-retry en errores (3 intentos)
  - [x] Auto-refresh JWT expirado
  - [x] JWT auto-attach en headers

**Entregable:** ✅ `pnpm dev` abre app en localhost:5173, instalable como PWA

---

## FASE 6.1: Login & Auth (1 día)

### 📦 apps/web - Módulo de Login

**Módulos:**

- [ ] **Página de Login**
  - [ ] `src/pages/Login.tsx`
  - [ ] Formulario: username + password
  - [ ] React Hook Form + Zod (validación)
  - [ ] Submit → POST /auth/login
  - [ ] Guardar token en sessionStorage
  - [ ] Redirect a `/dashboard` o `/scanner` según rol

- [ ] **Context de autenticación**
  - [ ] `src/context/AuthContext.tsx`
    - [ ] `useAuth()` hook
    - [ ] `currentUser`, `login()`, `logout()`, `isAuthenticated`
  - [ ] Persistencia de token

- [ ] **Protected routes**
  - [ ] `src/components/ProtectedRoute.tsx`
  - [ ] Si no autenticado → redirect a /login

**Tests:**
- [ ] Login form requiere username + password
- [ ] POST /auth/login exitoso → guarda token
- [ ] Token en sessionStorage → acceso a rutas protegidas
- [ ] Token expirado → redirige a login

**Entregable:** `localhost:5173/login` → ingresa credenciales → redirige a dashboard.

---

## ✅ FASE 6.2: Scanner (1-2 días) - COMPLETADA

### 📦 apps/web - Módulo Scanner

**Módulos implementados:**

- [x] **Librería de escaneo** ✅
  - [x] Integrada: `@zxing/browser`
  - [x] `src/lib/scanner.ts`
    - [x] `startCamera()` → acceso a cámara
    - [x] `stopCamera()` → detener
    - [x] Evento: `onCodeDetected(code)` con callbacks
    - [x] Manejo de múltiples cámaras (trasera preferida)

- [x] **Página Scanner** ✅
  - [x] `src/pages/Scanner.tsx` (actualizado)
  - [x] Video preview de cámara en vivo
  - [x] Botón "Iniciar escaneo" con permisos
  - [x] Indicador EN VIVO (red dot con pulsación)
  - [x] Cuando detecta código:
    - [x] Vibración haptica: `navigator.vibrate([50,30,50])`
    - [x] Sonido beep: Web Audio API
    - [x] Redirige a formulario de cantidad

- [x] **Formulario de Cantidad** ✅
  - [x] `src/pages/CountingForm.tsx`
  - [x] Muestra: código + nombre del producto + descripción
  - [x] Input: cantidad contada (validado con Zod)
  - [x] Botones rápidos: 1, 5, 10, 25
  - [x] Botones: "Guardar conteo" + "Cancelar"
  - [x] "Guardar" → guarda en IndexedDB + sync queue

- [x] **Caché de productos** ✅
  - [x] Cuando escanea código:
    - [x] Buscar primero en IndexedDB (caché local)
    - [x] Si no existe → GET /items/barcode/:code
    - [x] Guardar en IndexedDB para futuras búsquedas
    - [x] Nunca falla por falta de conexión

- [x] **Sistema de Sonido** ✅
  - [x] `src/lib/sound.ts` con Web Audio API
  - [x] 4 sonidos: beep, scan, success, error
  - [x] Fade in/out suave

- [x] **Custom Hook** ✅
  - [x] `src/hooks/useScanner.ts`
  - [x] Encapsula toda la lógica
  - [x] Maneja: init, scan, pause, resume, stop
  - [x] Integración IndexedDB + API

**Tests realizados:**
- [x] Cámara inicializa sin errores
- [x] @zxing detecta código EAN-13
- [x] Vibración haptica funciona
- [x] Producto se busca en BD local primero
- [x] Fallback a API si no existe en caché
- [x] Sonido de éxito se reproduce
- [x] Conteos se guardan en IndexedDB
- [x] Sync queue se actualiza

**Entregable:** ✅ Escanea código → muestra producto → ingresa cantidad → guarda en IndexedDB

---

## ✅ FASE 6.3: Offline & Sync Automático (2 días) - COMPLETADA

### 📦 apps/web - Módulo Offline

**CRÍTICO: Este módulo garantiza que funcione sin conexión.**

**Módulos implementados:**

- [x] **Detección de Conectividad** ✅
  - [x] `src/hooks/useOnline.ts`
  - [x] Listeners: online/offline events
  - [x] Estado inicial desde navigator.onLine
  - [x] Auto-cleanup

- [x] **Sincronización con Retry** ✅
  - [x] `src/services/SyncService.ts`
  - [x] Cola de sync (IndexedDB)
  - [x] Retry exponencial: 1s → 2s → 4s → 8s
  - [x] 4 reintentos máximo
  - [x] Estados: pending → syncing → synced/failed

- [x] **Estado Global de Sync** ✅
  - [x] `src/store/sync.ts` (Zustand)
  - [x] Progreso: total, synced, failed, pending
  - [x] Auto-sync habilitado/deshabilitado
  - [x] Método: syncNow()

- [x] **Auto-Sync Hook** ✅
  - [x] `src/hooks/useSync.ts`
  - [x] Sincroniza automáticamente cada 30s
  - [x] Solo cuando hay conexión
  - [x] Cooldown mínimo de 5s entre syncs
  - [x] Callback: onSyncComplete

- [x] **Indicador Visual** ✅
  - [x] `src/components/SyncIndicator.tsx`
  - [x] Mostrado en bottom-right
  - [x] Colores: Gris (offline), Azul (syncing), Verde (synced), Rojo (error)
  - [x] Progreso: X/Y sincronizados
  - [x] Barra de progreso
  - [x] Hora de último sync
  - [x] Mensajes de error

- [x] **IndexedDB (ya implementado en FASE 6 Base)** ✅
  - [x] `src/offline/db.ts` con Dexie
  - [x] Tablas: products, counts, syncQueue
  - [x] Métodos para CRUD

**Tests realizados:**
- [x] Detecta online/offline correctamente
- [x] Guarda en IndexedDB sin conexión
- [x] Sincroniza cuando hay conexión
- [x] Retry exponencial funciona
- [x] SyncIndicator muestra estado correcto
- [x] Auto-sync cada 30 segundos
- [x] Manejo de errores persistentes
- [x] No hay pérdida de datos
- [x] Eventual consistency

**Entregable:** ✅ Offline completo, conteos nunca se pierden, auto-sync con retry inteligente
      description?: string;
    }

    export interface ICount {
      id: string;
      sessionId: string;
      clientId: string;
      itemId: string;
      qty: number;
      synced: boolean;
      timestamp: number;
    }

    export class InventoryCountDB extends Dexie {
      products!: Table<IProduct>;
      counts!: Table<ICount>;

      constructor() {
        super('InventoryCountDB');
        this.version(1).stores({
          products: '&id, &code',
          counts: '&id, [sessionId+clientId+itemId], synced',
        });
      }
    }

    export const db = new InventoryCountDB();
    ```

- [ ] **Sincronización (Sync Queue)**
  - [ ] `src/offline/sync-queue.ts`
    ```typescript
    export async function syncCounts(sessionId: string) {
      const unsynced = await db.counts
        .where('synced').equals(false)
        .and(c => c.sessionId === sessionId)
        .toArray();

      if (unsynced.length === 0) return { accepted: [], errors: [] };

      const payload = {
        counts: unsynced.map(c => ({
          clientId: c.clientId,
          itemId: c.itemId,
          qty: c.qty
        }))
      };

      try {
        const response = await api.post(
          `/sessions/${sessionId}/counts/batch`,
          payload
        );

        // Marcar como synced
        for (const id of response.accepted.map(a => a.clientId)) {
          await db.counts.update(id, { synced: true });
        }

        return response;
      } catch (error) {
        console.error('Sync failed:', error);
        throw error;
      }
    }
    ```

- [ ] **Detectar conexión**
  - [ ] `src/offline/connectivity.ts`
    ```typescript
    export function useOnlineStatus() {
      const [isOnline, setIsOnline] = useState(navigator.onLine);

      useEffect(() => {
        window.addEventListener('online', () => setIsOnline(true));
        window.addEventListener('offline', () => setIsOnline(false));
        return () => {
          window.removeEventListener('online', () => {});
          window.removeEventListener('offline', () => {});
        };
      }, []);

      return isOnline;
    }
    ```

- [ ] **Auto-sync al conectar**
  - [ ] `src/hooks/useAutoSync.ts`
    ```typescript
    export function useAutoSync(sessionId: string) {
      const isOnline = useOnlineStatus();

      useEffect(() => {
        if (isOnline) {
          syncCounts(sessionId).catch(error => {
            console.error('Auto-sync failed:', error);
            // Reintento exponencial
          });
        }
      }, [isOnline, sessionId]);
    }
    ```

- [ ] **Service Worker**
  - [ ] `src/sw.ts` (Workbox via vite-plugin-pwa)
  - [ ] Cache strategy: network-first para API, cache-first para assets
  - [ ] Permitir offline fallback

**Tests:**
- [ ] Guardar conteo en IndexedDB offline
- [ ] Sincronización al conectar
- [ ] Idempotencia: 2x sync del mismo conteo = 1 en BD
- [ ] Backoff exponencial si falla sync

**Entregable:** Modo avión → escanea + ingresa cantidad → recupera WiFi → sincroniza automáticamente.

---

## ✅ FASE 6.4: Panel de Supervisor (1-2 días) - COMPLETADA

### 📦 apps/web - Módulo Supervisor

**Módulos implementados:**

- [x] **Página de Sesiones** ✅
  - [x] `src/pages/SessionsList.tsx`
  - [x] Lista todas las sesiones con tabla responsiva
  - [x] Filtros: ALL, OPEN, CLOSED, APPROVED
  - [x] Información: ID, Almacén, Operario, Estado, Fecha
  - [x] Clic "Ver Detalles" → abre SessionDetail

- [x] **Página de Diferencias** ✅
  - [x] `src/pages/SessionDetail.tsx`
  - [x] Tabla: Producto | Teórico | Contado | Diff | Diff% | Estado
  - [x] Marcar en rojo: diff% > 10% (requiere reconteo)
  - [x] Estadísticas resumidas: Total items, con diff, requieren reconteo
  - [x] Botón "Aprobar y Enviar a ERP"

- [x] **Aprobación y envío** ✅
  - [x] `src/services/SupervisorService.ts`
  - [x] Método: `approveSession()` - POST /sessions/:id/approve
  - [x] Crea diario en ERP y marca sesión como APPROVED
  - [x] Integración con SyncIndicator (auto-sync)
  - [x] Mostrar confirmación: Journal ID

**Tests verificados:**
- [x] GET /sessions/:id/differences retorna diferencias
- [x] POST /sessions/:id/approve crea diario
- [x] Retry con backoff (via SyncService)
- [x] Cálculo correcto de diff% y flags

**Entregable:** ✅ Supervisor ve sesión → revisa diferencias → aprueba → diario en ERP (automático)

---

## FASE 7: Tests & Quality (1 día)

### Tests Frontend (Vitest)

- [ ] **Unit tests**
  - [ ] `src/lib/scanner.ts` → mock @zxing
  - [ ] `src/offline/db.ts` → test write/read IndexedDB
  - [ ] `src/services/ApprovalService.ts` → mock API

- [ ] **Integration tests**
  - [ ] Flujo completo: login → scan → count → sync
  - [ ] Offline → online transition

### Tests Backend (Jest + Supertest)

- [ ] **Counting Service**
  - [ ] POST /sessions/:id/counts/batch → idempotencia
  - [ ] GET /sessions/:id/differences → cálculo correcto

- [ ] **Auth Service**
  - [ ] Login correcto/incorrecto
  - [ ] JWT válido/expirado

- [ ] **Inventory Service**
  - [ ] Búsqueda por código
  - [ ] Caché Redis

### Coverage

- [ ] Ejecutar: `pnpm test:coverage`
- [ ] Meta: ≥80% coverage

### Linting & Formatting

- [ ] ESLint en todos los servicios
- [ ] Prettier para formato
- [ ] Pre-commit hook: lint + test (opcional)

**Entregable:** `pnpm test:coverage` retorna ≥80% en todos los servicios.

---

## FASE 8: Docker & Deploy (1 día)

### Docker

- [ ] Dockerfiles para cada servicio
  - [ ] Multi-stage: build → runtime
  - [ ] Base image: `node:20-alpine`
  - [ ] Health checks

- [ ] Docker Compose (ya existe ✓)
  - [ ] Networking entre servicios
  - [ ] Volumes para PostgreSQL

### CI/CD

- [ ] GitHub Actions: `.github/workflows/`
  - [ ] Test: `pnpm test` en cada push
  - [ ] Lint: `pnpm lint` en PR
  - [ ] Build Docker: en main branch
  - [ ] Push a registry (opcional)

### Pruebas en celular

- [ ] HTTPS local con mkcert
  - [ ] `mkcert localhost 127.0.0.1`
  - [ ] Configurar Nginx con certificado
  - [ ] Acceder desde celular: `https://192.168.1.X`

**Entregable:** `docker compose up` levanta todo, app funciona en celular.

---

## FASE 9: Video Demo & Documentación (1 día)

### README actualizado

- [ ] Cómo ejecutar: `git clone` → `pnpm install` → `docker compose up`
- [ ] Usuarios de prueba
- [ ] Flujo: operario escanea → supervisor aprueba
- [ ] Capturas de pantalla de cada pantalla

### Video demo (Loom/OBS)

- [ ] Mostrar instalación en celular
- [ ] Escanear 5-10 códigos en modo offline
- [ ] Recuperar WiFi → sincronización automática
- [ ] Supervisor ve diferencias y aprueba
- [ ] Diario en ERP Mock

### CV

- [ ] Descrición en 2 líneas:
  > "Aplicación PWA offline-first para conteo de inventario en almacén (React, IndexedDB, Service Workers, Node.js). Escaneo de códigos de barras, sincronización idempotente, flujo de aprobación y ajustes en ERP mediante microservicios."

---

## Priorización por Impacto en CV

1. ✅ **ERP Mock + Gateway** → Muestra adaptabilidad a ERPs
2. ✅ **Counting Service** → Lógica de negocio compleja
3. ✅ **PWA + Scanner + Offline** → Perfil móvil profesional
4. ✅ **Supervisor Flow** → Casos de uso reales
5. ⭐ **Tests + CI** → Quality engineering

---

## Checkpoints de Finalización

- [ ] Repositorio público con README completo
- [ ] Todas las etapas implementadas
- [ ] Coverage ≥80%
- [ ] CI en verde
- [ ] Video demo funcionando
- [ ] Instalable en celular
- [ ] Sin console.logs
- [ ] Sin errores no capturados

---

**Última actualización:** 2026-10-02  
**Autor:** Bill Castillo
