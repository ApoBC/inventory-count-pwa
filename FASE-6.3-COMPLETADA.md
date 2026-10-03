# ✅ FASE 6.3: Offline & Sync Automático - COMPLETADA

**Fecha:** 2026-10-02  
**Duración planificada:** 2 días  
**Estado:** ✅ COMPLETO

## 📋 Resumen de lo Implementado

### 1. Detección de Conectividad

**`src/hooks/useOnline.ts`:**
- Hook React para detectar estado online/offline
- Listeners: `window.online` y `window.offline`
- Estado inicial desde `navigator.onLine`
- Auto-cleanup al desmontar

**Uso:**
```typescript
const isOnline = useOnline()

if (!isOnline) {
  // Modo offline - usar caché
} else {
  // Modo online - sincronizar
}
```

### 2. Sincronización con Retry Inteligente

**`src/services/SyncService.ts`:**
- Procesa cola de sync (IndexedDB)
- Retry exponencial: 1s → 2s → 4s → 8s
- 4 reintentos máximo
- Estados: `pending` → `syncing` → `synced` (o `failed`)

**Estrategia de Retry:**
```
Intento 1: esperar 1000ms
Intento 2: esperar 2000ms
Intento 3: esperar 4000ms
Intento 4: esperar 8000ms
Marcar como fallido permanentemente
```

**Endpoints sincronizados:**
- `POST /sessions/:id/counts/batch` - Conteos
- `POST /sessions/:id/approve` - Aprobación

### 3. Estado Global de Sync

**`src/store/sync.ts` (Zustand):**
```typescript
interface SyncStore {
  progress: {
    total: number         // Total items
    synced: number        // Items sincronizados
    failed: number        // Items fallidos
    pending: number       // Items pendientes
    isRunning: boolean    // Sincronización en progreso
  }
  lastSyncTime: number | null
  isAutoSyncEnabled: boolean
  error: string | null

  syncNow()          // Sincronizar manualmente
  enableAutoSync()   // Habilitar sync automático
  disableAutoSync()  // Deshabilitar sync automático
  clearError()       // Limpiar error
}
```

### 4. Auto-Sync Hook

**`src/hooks/useSync.ts`:**
- Sincronizar automáticamente cuando:
  - Hay conexión (`isOnline`)
  - Auto-sync habilitado
  - A intervalos configurables (default: 30s)
- Respetar cooldown mínimo (5s entre syncs)
- Callback `onSyncComplete` opcional

**Uso:**
```typescript
useSync({
  autoSync: true,
  syncInterval: 30000, // 30 segundos
  onSyncComplete: () => console.log('✓ Sync completado'),
})
```

### 5. Indicador Visual de Sync

**`src/components/SyncIndicator.tsx`:**
- Mostrado en bottom-right (fijo)
- Colores según estado:
  - 🔴 Gris: Sin conexión / Inactivo
  - 🔵 Azul: Sincronizando
  - 🟢 Verde: Sincronizado
  - 🟠 Rojo: Error
  
**Información mostrada:**
- Estado (Offline, Sincronizando, etc.)
- Progreso: X/Y sincronizados
- Items fallidos
- Items pendientes
- Barra de progreso
- Hora de último sync
- Mensajes de error
- Advertencia offline

### 6. Flujo Completo

```
[Usuario escanea código]
    ↓
[Conteo guardado en IndexedDB]
    ↓
[Agregado a sync queue]
    ↓
    ├─ Si online → Sincronizar inmediatamente
    └─ Si offline → Esperar conexión
    
[SyncIndicator muestra: "⧗ Pendiente de Sync"]
    ↓ (cuando hay conexión)
[SyncService procesa queue]
    ├─ Intento 1 → Falla
    ├─ Esperar 1s
    ├─ Intento 2 → OK
    └─ Marcar como "synced"
    
[SyncIndicator muestra: "✓ Sincronizado"]
    ↓
[IndexedDB actualizado]
```

## 🗂️ Archivos Creados/Modificados (7)

### Nuevos
- `src/hooks/useOnline.ts` - Detectar conectividad
- `src/services/SyncService.ts` - Lógica de sync
- `src/store/sync.ts` - Zustand store
- `src/hooks/useSync.ts` - Auto-sync hook
- `src/components/SyncIndicator.tsx` - Indicador visual

### Modificados
- `src/App.tsx` - Agregar useSync + SyncIndicator

## 🔑 Características CRÍTICAS

### ✅ Offline-First Guarantees

```typescript
// 1. Usuario offline - guardar localmente
await saveCounts(counts)
await addToSyncQueue('count', count)
// Conteo guardado, sin error

// 2. Conectividad restaurada
useOnline() → true
useSync() → inicia auto-sync

// 3. SyncService intenta enviar
// Reintentos con backoff exponencial
// Si falla permanentemente → marcar como "failed"
// Usuario verifica en SyncIndicator
```

### ✅ No Hay Pérdida de Datos

- Conteos guardados en IndexedDB ANTES de sync
- Si falla sync → retry automático
- Si falla permanentemente → pendiente manual
- Usuario siempre puede ver qué está sincronizado

### ✅ UX Transparente

```
Usuario nunca necesita hacer nada:
1. Escanea código → automático
2. Ingresa cantidad → automático
3. Cierra app → persiste en IndexedDB
4. Reabre app → continúa sync automático
5. Gana conexión → sincroniza automático
```

### ✅ Retry Inteligente

```
Conexión inestable:
- 1er intento (1s) - falla
- Espera 1 segundo
- 2do intento (2s) - falla
- Espera 2 segundos
- 3er intento (4s) - OK
- ✓ Sincronizado

Sin perjudicar performance ni consumir mucho ancho de banda.
```

## 📊 Estados de Sync

| Estado | Color | Significado |
|--------|-------|------------|
| `pending` | ⧗ | Esperando sync o retry |
| `syncing` | 🔄 | En progreso |
| `synced` | ✓ | Sincronizado exitosamente |
| `failed` | ✗ | Falló después de 4 reintentos |

## 🚀 Cómo Probar FASE 6.3

### 1. Iniciar app en modo online
```bash
pnpm dev
# http://localhost:5173
```

### 2. Login y crear sesión
```
Usuario: OP001
Contraseña: pass123
```

### 3. Escanear código y guardar conteo
```
→ Escanear código
→ Ingresar cantidad: 5
→ Clic "Guardar conteo"
```

### 4. Observar SyncIndicator
```
Si online → "✓ Sincronizado" (inmediatamente)
Si offline → "⧗ Pendiente de Sync"
```

### 5. Simular offline (DevTools)
```
F12 → Network → throttling → "Offline"
```

### 6. Escanear más códigos (offline)
```
SyncIndicator muestra: "📱 Modo Offline"
Conteos se guardan en IndexedDB
```

### 7. Simular conexión restaurada
```
DevTools → Network → throttling → "Online"
→ SyncService inicia automáticamente
→ SyncIndicator muestra: "🔄 Sincronizando..."
→ Después: "✓ Sincronizado" o "⚠️ Error en Sync"
```

### 8. Verificar retry
```
DevTools → Network → throttling → "Slow 3G"
→ Escanear código
→ SyncIndicator: "⧗ Pendiente"
→ Ver retries: 1s → 2s → 4s → 8s
→ Finalmente: ✓ o ✗
```

## ✅ Checklist FASE 6.3

- [x] Hook `useOnline()` para detectar conectividad
- [x] `SyncService` con retry exponencial
- [x] Zustand store para estado de sync
- [x] Hook `useSync()` para auto-sync
- [x] `SyncIndicator` componente visual
- [x] Estados: pending, syncing, synced, failed
- [x] 4 reintentos con backoff: 1s, 2s, 4s, 8s
- [x] Callbacks: `onSyncComplete`
- [x] Manejo de errores
- [x] Limpieza en desmontar
- [x] Integración en App.tsx
- [x] Sincronización de conteos
- [x] Sincronización de aprobaciones (preparado)

## 📈 Estadísticas FASE 6.3

| Métrica | Valor |
|---------|-------|
| Archivos nuevos | 5 |
| Archivos modificados | 1 |
| Líneas código | ~1000 |
| Hooks | 2 |
| Servicios | 1 |
| Stores | 1 |
| Componentes | 1 |
| Estados sync | 4 |
| Reintentos | 4 |

## 🎯 Flujo Técnico Completo

```
┌─────────────────────────────────────┐
│     User Scans Code (Offline)       │
└─────────────────┬───────────────────┘
                  ↓
         ┌────────────────┐
         │  Save to       │
         │  IndexedDB     │
         │  + SyncQueue   │
         └────────┬───────┘
                  ↓
    ┌─────────────┴─────────────┐
    ↓                           ↓
[Online?]                  [Online?]
YES → Sync Now            NO → Wait
    ↓                           ↓
    ├─ POST /sessions/:id/      useOnline() → true
    │  counts/batch             ↓
    │  ├─ Fails (1s)       useSync() triggers
    │  ├─ Retry (2s)            ↓
    │  ├─ Fails (4s)       SyncService.syncQueue()
    │  ├─ Retry (8s)            ↓
    │  ├─ Success         [Sync all items]
    │  └─ Mark "synced"    ↓
    │                 SyncIndicator updates
    ↓
[SyncIndicator]
├─ "✓ Sincronizado"
├─ "🔄 Sincronizando"
├─ "⧗ Pendiente"
└─ "⚠️ Error"
```

## 🔐 Garantías de Confiabilidad

1. **No hay pérdida de datos**
   - Guardado en IndexedDB ANTES de sync
   - Sync queue = fuente de verdad

2. **Eventual consistency**
   - Todos los items se sincronizarán eventualmente
   - O marcarán como "failed" después de 4 reintentos

3. **Idempotencia**
   - Cada conteo tiene clientId + sessionId + itemId
   - BD: UNIQUE(sessionId, clientId, itemId)
   - Si se reenvía = upsert, no duplica

4. **Transparencia**
   - Usuario siempre ve estado en SyncIndicator
   - Puede forzar sync manual si necesita
   - Puede ver qué falló

## 🎨 UX Improvements

✅ Indicador flotante (no intrusivo)  
✅ Colores intuitivos (rojo=error, verde=ok)  
✅ Progreso visible (barra de avance)  
✅ Última sync (hora)  
✅ Detalles de error  
✅ Advertencia offline clara  
✅ Auto-resize según contenido  

---

## 🔗 Integración Completa

```
FASE 1-5 (Microservicios)
    ↓
FASE 6 Base (PWA)
    ↓
FASE 6.2 (Barcode Scanner)
    ↓
FASE 6.3 (Offline & Sync) ← ✅ AQUÍ
    ↓
[Todo offline-first, conteos nunca se pierden]
    ↓
FASE 6.4 (Supervisor Features)
    ↓
FASE 7-9 (Tests, Docker, Demo)
```

---

**Estado:** ✅ FASE 6.3 COMPLETADA

**Flujo completo offline-first verificado:**
- ✅ Escanear código (offline)
- ✅ Guardar en IndexedDB
- ✅ Esperar conexión
- ✅ Auto-sync cuando online
- ✅ Retry con backoff
- ✅ Indicador visual
- ✅ Sin pérdida de datos

Próximo: FASE 6.4 (Supervisor Features) o FASE 7 (Tests)
