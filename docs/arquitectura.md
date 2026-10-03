# Arquitectura: App de Conteo de Inventario (PWA)

**Versión:** 1.0  
**Fecha:** 2026-10-02  
**Autor:** Bill Castillo

## 1. Visión General

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (PWA React)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Scanner → Counting Form → Supervisor Review         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ IndexedDB (offline) + Service Worker (sync queue)   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────┬───────────────────────────────────────────────┘
              │ HTTPS + JWT
              ▼
      ┌───────────────────┐
      │  API GATEWAY      │
      │  (Nginx/Node.js)  │
      └─────────┬─────────┘
                │
    ┌───────────┼───────────┬──────────────┐
    ▼           ▼           ▼              ▼
┌────────────┐ ┌──────────┐ ┌─────────┐ ┌─────────────────┐
│ AUTH-SVC   │ │ INVENTORY│ │ COUNTING│ │ ERP GATEWAY     │
│ (JWT)      │ │ (Stock)  │ │ (Sesion)│ │ (Adaptadores)   │
└────────────┘ └──────────┘ └─────────┘ └────────┬────────┘
    │              │           │                  │
    └──────────────┴───────────┴──────────────────┼──────┐
                                                  │      │
                       ┌──────────────────────────┼──────┼───┐
                       ▼                          ▼      ▼   ▼
                   PostgreSQL            Redis      Mock  ERPNext D365
                                         (cache)    OData
```

## 2. Componentes

### 2.1 Frontend: PWA React

**Localización:** `apps/web/`

**Responsabilidades:**
- Autenticación local (guardar JWT en memory/sessionStorage)
- Escaneo de códigos de barras con cámara
- Formulario de cantidad contada
- Almacenamiento offline (IndexedDB)
- Cola de sincronización automática
- Pantalla del supervisor (diferencias + aprobación)

**Tecnologías:**
- React 18 + Vite
- TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query (React Query)
- React Hook Form + Zod (validación)
- Dexie.js (IndexedDB)
- @zxing/browser (escaneo)
- vite-plugin-pwa (PWA + Service Worker)

**Flujo de datos:**

```
Operario escanea
    ↓
Busca producto en caché local
    ↓
Ingresa cantidad contada
    ↓
Guarda en IndexedDB (synced: false)
    ↓
Detecta conexión
    ↓
sync-queue envía lote a counting-service
    ↓
Respuesta de backend marca como (synced: true)
    ↓
Supervisor ve diferencias
    ↓
Aprueba → counting-service crea diario en ERP
```

### 2.2 Auth Service

**Localización:** `apps/auth-service/`

**Endpoints:**
```
POST /auth/login
  { username: string, password: string }
  → { accessToken, refreshToken, user: { id, role: 'OPERATOR' | 'SUPERVISOR' } }

POST /auth/refresh
  { refreshToken: string }
  → { accessToken }

POST /auth/logout
  → { success: true }

GET /auth/me
  → { user: { id, role, username } }
```

**Roles:**
- `OPERATOR`: escanea y registra conteos
- `SUPERVISOR`: aprueba y envía ajustes al ERP

**Almacenamiento:**
- Tabla `users` en PostgreSQL
- Contraseñas hasheadas con bcrypt

### 2.3 Inventory Service

**Localización:** `apps/inventory-service/`

**Responsabilidades:**
- Catálogo de productos (código EAN-13, descripción)
- Stock teórico por almacén/ubicación
- Búsqueda rápida por código

**Endpoints:**
```
GET /items/barcode/:code
  → { id, code, name, description }

GET /items
  { warehouse?: string, location?: string, limit?: 100, offset?: 0 }
  → { items: Item[], total: number }

GET /stock
  { itemId: string, warehouse?: string }
  → { itemId, warehouse, location, qty, lastCount }
```

**Almacenamiento:**
- Tabla `products` (código EAN, nombre, descripción)
- Tabla `stock_levels` (qty por warehouse + location)
- Redis: caché de búsquedas frecuentes (TTL 1 hora)

### 2.4 Counting Service

**Localización:** `apps/counting-service/`

**Responsabilidades:**
- Crear sesiones de conteo
- Registrar conteos con idempotencia (key: `clientId`)
- Calcular diferencias (físico vs teórico)
- Aprobar y enviar diario de inventario al ERP

**Endpoints:**
```
POST /sessions
  { warehouse: string, location: string, operatorId: string }
  → { sessionId, createdAt, status: 'OPEN' }

POST /sessions/:id/counts/batch
  { counts: [{ clientId, itemId, qty }] }
  → { accepted: [{ clientId, countId }], errors: [...] }

GET /sessions/:id/differences
  → { items: [{ itemId, name, theoretical, counted, diff, diff% }] }

POST /sessions/:id/approve
  { supervisorId: string, adjustments: [{ itemId, diff }] }
  → { success: true, journalId, postedAt }

GET /sessions/:id
  → { sessionId, warehouse, status, countsCount, createdAt, approvedAt }
```

**Lógica clave - Idempotencia:**

```typescript
// En el backend: upsert por clientId
await Counts.upsert(
  { sessionId, clientId },  // unique key
  { itemId, qty, synced: true }
);
```

Esto garantiza que si el operario envía dos veces (por error de red), solo se registra una.

**Cálculo de diferencias:**

```
teorico = stock_levels.qty
contado = SUM(counts.qty) donde itemId = X

diferencia = contado - teorico
diferencia_% = (diferencia / teorico) * 100

Si |diferencia_%| > umbral (ej. 5%) → marcado para doble conteo
```

### 2.5 ERP Gateway

**Localización:** `apps/erp-gateway/`

**Responsabilidades:**
- Cargar el adaptador según `ERP_PROVIDER`
- Normalizar respuestas a tipos internos
- Manejar reintentos y errores

**Interfaz (TypeScript):**

```typescript
export interface ErpAdapter {
  getItemByBarcode(code: string): Promise<{
    id: string;
    code: string;
    name: string;
    warehouse?: string;
  }>;

  getStockOnHand(itemId: string, warehouse?: string): Promise<{
    qty: number;
    warehouse: string;
    location: string;
  }[]>;

  postInventoryJournal(journal: {
    header: { warehouse, description, date };
    lines: [{ itemId, diff }];
  }): Promise<{ journalId: string; postedAt: Date }>;
}
```

**Adaptadores:**

1. **mock** (predeterminado, sin depencias)
   - Datos en memoria (seedeados al inicio)
   - Responde como si fuera OData v4

2. **erpnext** (gratis, Docker)
   - REST API a ERPNext
   - Auténticación con API key

3. **d365** (paga)
   - OData v4 + OAuth2 (Entra ID)
   - Solo si tienes acceso a tenant

### 2.6 ERP Mock

**Localización:** `apps/erp-mock/`

**Responsabilidades:**
- Simular OData v4 de D365
- Endpoints para productos, stock, diarios

**Endpoints simulados:**

```
GET /data/Products
  → { value: [{ id, code, name }] }

GET /data/InventoryOnHandV2
  { $filter: "itemId eq 'PROD-001'", $top: 100 }
  → { value: [{ itemId, warehouse, qty }] }

POST /data/InventoryCountingJournalHeaders
  { header }
  → { id, journalNumber, status: 'Draft' }
```

**Datos semilla:**
- 20-30 productos (EAN-13)
- 2-3 almacenes (WAREHOUSE-A, WAREHOUSE-B)
- Stock inicial aleatorio

## 3. Flujos Principales

### 3.1 Conteo Offline y Sincronización

```
CLIENTE (Operario en modo avión)
├─ Escanea código EAN-13
├─ Busca producto en caché local (IndexedDB)
├─ Ingresa cantidad contada
├─ Guarda en IndexedDB:
│  { sessionId, clientId: UUID(), itemId, qty, synced: false, timestamp }
│
CLIENTE (Recupera conexión)
├─ Service Worker detecta evento "online"
├─ sync-queue construye lote:
│  { counts: [{ clientId, itemId, qty }, ...] }
├─ POST /counting-service/sessions/:id/counts/batch
│
SERVIDOR (counting-service)
├─ Para cada count:
│  ├─ Upsert en tabla Counts (key: sessionId + clientId)
│  ├─ Si OK → responde { clientId, countId }
│  ├─ Si ERROR → responde con error_code
├─ Responde array de aceptados + errores
│
CLIENTE
├─ Recibe respuesta
├─ Marca como synced: true aquellos con éxito
├─ Reintenta después los que fallaron (backoff exponencial)
├─ Muestra confirmación visual
```

### 3.2 Flujo de Aprobación

```
SUPERVISOR
├─ Inicia sesión (rol: SUPERVISOR)
├─ Ve lista de sesiones abiertas
├─ Selecciona una sesión
│
GET /counting-service/sessions/:id/differences
├─ Responde con:
│  [
│    {
│      itemId: "PROD-001",
│      name: "Widget A",
│      theoretical: 100,
│      counted: 95,
│      diff: -5,
│      diff%: -5%,
│      flagged: false (no supera umbral)
│    }
│  ]
│
SUPERVISOR
├─ Revisa diferencias
├─ Puede hacer ajustes manuales si es necesario
├─ Presiona APROBAR
│
POST /counting-service/sessions/:id/approve
├─ Body: { supervisorId: "SV001", adjustments: [...] }
├─ Backend:
│  ├─ Crea encabezado de diario
│  ├─ Crea línea por cada item con diff ≠ 0
│  ├─ Envía a ERP Gateway:
│     POST /erp-gateway/inventory-journals
│  ├─ ERP responde journalId
│  ├─ Marca sesión como APPROVED
│
RESPUESTA
├─ { success: true, journalId: "JRN-2026-001", postedAt }
│
SUPERVISOR
├─ Ve confirmación: "Diario publicado en ERP"
├─ La sesión queda cerrada
```

### 3.3 Autenticación y Autorización

```
CLIENTE (Login)
├─ Ingresa username + password
├─ POST /auth/login
│
SERVIDOR (auth-service)
├─ Busca usuario en BD
├─ Verifica contraseña (bcrypt)
├─ Si correcto → emite JWT:
│  {
│    sub: userId,
│    role: "OPERATOR" | "SUPERVISOR",
│    exp: now + 24h
│  }
├─ Responde { accessToken, refreshToken, user }
│
CLIENTE
├─ Guarda accessToken en sessionStorage (no localStorage por seguridad)
├─ Guarda refreshToken en httpOnly cookie (si es posible) o sessionStorage
├─ Incluye en cada request:
│  Authorization: Bearer <accessToken>
│
SERVIDOR (en cada request)
├─ Valida JWT en middleware
├─ Extrae role del token
├─ Autoriza según endpoint:
│  - OPERATOR: solo puede crear/enviar conteos
│  - SUPERVISOR: solo puede aprobar sesiones
```

## 4. Datos Compartidos (packages/shared)

**TypeScript interfaces:**

```typescript
// Usuario
export interface User {
  id: string;
  username: string;
  role: 'OPERATOR' | 'SUPERVISOR';
}

// Producto
export interface Product {
  id: string;
  code: string;      // EAN-13
  name: string;
  description?: string;
}

// Nivel de stock
export interface StockLevel {
  itemId: string;
  warehouse: string;
  location: string;
  qty: number;
}

// Sesión de conteo
export interface CountingSession {
  id: string;
  warehouse: string;
  location?: string;
  operatorId: string;
  status: 'OPEN' | 'CLOSED' | 'APPROVED';
  createdAt: Date;
  approvedAt?: Date;
  supervisorId?: string;
}

// Conteo individual
export interface Count {
  id: string;
  sessionId: string;
  clientId: string;  // UUID del cliente (para idempotencia)
  itemId: string;
  qty: number;
  synced: boolean;
  timestamp: Date;
}

// Diferencia
export interface Difference {
  itemId: string;
  name: string;
  theoretical: number;
  counted: number;
  diff: number;
  diffPercent: number;
  requiresRecount: boolean;
}
```

## 5. Base de Datos (PostgreSQL)

### Schema principal (counting-service)

```sql
-- Usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL, -- 'OPERATOR' | 'SUPERVISOR'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Productos
CREATE TABLE products (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL, -- EAN-13
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stock
CREATE TABLE stock_levels (
  id UUID PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES products(id),
  warehouse VARCHAR(100) NOT NULL,
  location VARCHAR(100),
  qty INT NOT NULL DEFAULT 0,
  last_counted_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(item_id, warehouse, location)
);

-- Sesiones de conteo
CREATE TABLE counting_sessions (
  id UUID PRIMARY KEY,
  warehouse VARCHAR(100) NOT NULL,
  location VARCHAR(100),
  operator_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL, -- 'OPEN' | 'CLOSED' | 'APPROVED'
  created_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  supervisor_id UUID REFERENCES users(id)
);

-- Conteos individuales
CREATE TABLE counts (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES counting_sessions(id),
  client_id VARCHAR(36) NOT NULL, -- UUID del cliente móvil
  item_id UUID NOT NULL REFERENCES products(id),
  qty INT NOT NULL,
  synced BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT NOW(),
  UNIQUE(session_id, client_id, item_id)  -- Idempotencia
);

-- Diarios de inventario (creados al aprobar)
CREATE TABLE inventory_journals (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES counting_sessions(id),
  erp_journal_id VARCHAR(100),
  status VARCHAR(20) NOT NULL, -- 'DRAFT' | 'POSTED'
  posted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE inventory_journal_lines (
  id UUID PRIMARY KEY,
  journal_id UUID NOT NULL REFERENCES inventory_journals(id),
  item_id UUID NOT NULL REFERENCES products(id),
  diff INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 6. Casos de Error

| Error | Causa | Mitigación |
|-------|-------|-----------|
| Conteo duplicado | Red inestable, reintentos | `clientId` + upsert en BD |
| Pérdida de datos offline | App cierra antes de sincronizar | Guardar en IndexedDB antes de marcar listo |
| Cámara no funciona | No HTTPS | Usar mkcert o Cloudflare Tunnel desde el día 1 |
| Supervisor intenta aprobar sesión no cierra | Data race | Transacción SQL con lock pessimista |
| Código EAN no existe | Producto no cadastrado | Crear formulario de "Producto no encontrado" con fallback manual |
| Diferencia anómala (ej. -1000%) | Operario escanea mal | Marcar para doble conteo automático si supera ±10% |

## 7. Métricas de Éxito

✅ PWA instalable y funcional en Android/iOS  
✅ Escanea 50 códigos en modo offline sin pérdidas  
✅ Sincroniza exitosamente al recuperar conexión  
✅ Supervisor aprueba en <2 segundos  
✅ Diario llega al ERP Mock en <1 segundo  
✅ Coverage de tests ≥80%  
✅ Carga inicial <3 segundos  
✅ Sin console.logs ni errores no capturados  

## 8. Roadmap Detallado

Véase [README.md](../README.md) para etapas.

---

**Revisión final:** Bill Castillo (2026-10-02)
