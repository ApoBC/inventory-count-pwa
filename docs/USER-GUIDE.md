# 👤 Guía de Usuario - Operador de Almacén

**Para:** Operadores de inventario  
**Versión:** 1.0  
**Última actualización:** 2026-10-02

---

## 📋 Tabla de Contenidos

1. [Inicio de Sesión](#inicio-de-sesión)
2. [Interfaz Principal](#interfaz-principal)
3. [Escaneo de Códigos](#escaneo-de-códigos)
4. [Registro de Cantidades](#registro-de-cantidades)
5. [Funcionamiento Offline](#funcionamiento-offline)
6. [Sincronización](#sincronización)
7. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Inicio de Sesión

### 1. Abrir la Aplicación
```
Navegador → http://localhost:5173 (o tu dominio)
```

### 2. Ingresar Credenciales
- **Usuario:** OP001, OP002, OP003 (te asignará tu supervisor)
- **Contraseña:** Tu contraseña personal

### 3. Permisos
Al primer acceso, otorga permiso para:
- ✅ Acceso a cámara (escaneo)
- ✅ Notificaciones (sincronización)
- ✅ Almacenamiento offline (IndexedDB)

### 4. Autenticación
- Token válido por 24 horas
- Refresh automático en background
- Logout cierra sesión inmediatamente

---

## Interfaz Principal

### Estructura de Pantalla

```
┌─────────────────────────────────────────────┐
│  Inventory Count - Operador                 │
├─────────────────────────────────────────────┤
│                                             │
│  📸 VISTA DE CÁMARA (Grande)               │
│                                             │
│  ─────────────────────────────────────────│
│  [Buscar Producto]  [Productos Locales]   │
│  ─────────────────────────────────────────│
│                                             │
│  📋 CONTEOS REGISTRADOS                    │
│  ├─ Producto 1  | Qty: 25                 │
│  ├─ Producto 2  | Qty: 10                 │
│  └─ Producto 3  | Qty: 5                  │
│                                             │
├─────────────────────────────────────────────┤
│ 🔄 Sincronizando...  [Cerrar Sesión]      │
└─────────────────────────────────────────────┘
```

### Botones Principales

- **📸 Escanear** - Activar cámara
- **🔍 Buscar** - Búsqueda manual de producto
- **➕ Agregar** - Registrar cantidad
- **🔄 Sincronizar** - Forzar sincronización
- **👤 Cerrar Sesión** - Logout

---

## Escaneo de Códigos

### ¿Cómo Escanear?

1. **Tap en "Escanear"** (botón con cámara)
2. **Permitir acceso a cámara** (si aparece diálogo)
3. **Apuntar código de barras** a la cámara
4. **Esperar beep** ✅ (código detectado)
5. **Producto aparece automáticamente**

### Códigos Soportados

- ✅ **EAN-13** (Códigos de barras estándar)
- ✅ Códigos de más de 8 dígitos
- ❌ QR codes (no soportados aún)

### Feedback Visual y Sonoro

| Evento | Sonido | Vibración | Pantalla |
|--------|--------|-----------|----------|
| Código detectado | ✅ Beep | [50, 30, 50]ms | Verde |
| Producto encontrado | 🎵 Éxito | Patrón | Card animada |
| Error | ❌ Buzzer | - | Rojo |
| Sincronizado | 🔔 Ding | Doble | Checkmark |

### Solucionar Problemas de Escaneo

| Problema | Solución |
|----------|----------|
| La cámara no abre | 1. Verificar permiso en navegador<br>2. Reiniciar app<br>3. Usar HTTPS en producción |
| Código no se detecta | 1. Mejorar iluminación<br>2. Acercar más<br>3. Código dañado? |
| Producto no encontrado | 1. Código incorrecto<br>2. Producto no en sistema<br>3. Buscar manualmente |

---

## Registro de Cantidades

### Método 1: Quick Buttons (Más Rápido)

Después de escanear:
```
Producto: ACME Widget #123456
┌──────────────────────────┐
│  [1] [5] [10] [25]      │  ← Quick buttons
│                          │
│      Ingrese cantidad:   │
│      [___________]       │  ← O escriba
│                          │
│      [Guardar] [Cancelar]│
└──────────────────────────┘
```

1. Tap en botón de cantidad (1/5/10/25)
2. Cantidad aparece automáticamente
3. **Tap "Guardar"** ✅

### Método 2: Entrada Manual

1. Escribir cantidad (0-99999)
2. Validación automática en vivo
3. Tap "Guardar"

### Validaciones

✅ Cantidades válidas: 0 a 99999  
❌ Números negativos: Bloqueados  
❌ Decimales: No permitidos  
❌ Vacío: Requerido  

### Editar Cantidad

1. Tap en producto de la lista
2. Cambiar cantidad
3. Tap "Actualizar"

---

## Funcionamiento Offline

### ¿Qué Significa Offline?

**Offline:** Tu teléfono no tiene conexión a internet, pero **la app sigue funcionando 100%**

### Cómo Funciona

1. **Al iniciar sesión:** Se descargan productos localmente
2. **Al escanear:** Se busca en caché local (instantáneo)
3. **Al guardar:** Se almacena en IndexedDB (local)
4. **Sin conexión:** TODO funciona, incluso sin internet

### Indicador de Conexión

```
Esquina inferior derecha:
🟢 Verde      = Online, sincronizando
🔴 Rojo       = Error sincronización
⚪ Gris       = Offline (OK, espera conexión)
🔵 Azul       = Sincronizando...
```

### Datos que se Guardan Localmente

✅ Productos (nombre, código, precio)  
✅ Tus conteos (cantidad, timestamp)  
✅ Cola de sincronización (items pendientes)  
✅ Tu sesión (para reanudar)  

### Privacidad

- Datos guardados solo en tu dispositivo
- Nadie puede ver tus conteos locales
- Al sincronizar, se envían al servidor
- Puedes borrar datos: Ajustes → Limpiar caché

---

## Sincronización

### ¿Qué es Sincronización?

Envío de tus conteos desde el teléfono al servidor, para que supervisores los vean.

### Cuándo Ocurre

- ✅ Automática cada 30 segundos (si hay cambios)
- ✅ Cuando recuperas conexión (si estabas offline)
- ✅ Manual: Tap "🔄 Sincronizar Ahora"

### Estados de Sincronización

| Estado | Icono | Significado |
|--------|-------|-------------|
| Sincronizado | ✅ Verde | Todo enviado |
| Sincronizando | 🔄 Azul | En progreso... |
| Pendiente | ⏳ Naranja | Esperando |
| Error | ❌ Rojo | Reintentar en... |
| Offline | ⚪ Gris | Sin conexión (espera) |

### Reintentos Automáticos

Si falla una sincronización:
- 1er intento: después de 1 segundo
- 2do intento: después de 2 segundos
- 3er intento: después de 4 segundos
- 4to intento: después de 8 segundos
- Si sigue fallando: manual o espera conexión

### Ver Detalles de Sincronización

Tap en indicador de sincronización (bottom-right):
- Última sincronización: hace X minutos
- Ítems pendientes: N
- Ítems sincronizados: N
- Errores recientes: lista

---

## Preguntas Frecuentes

### ❓ ¿Qué pasa si pierdo conexión?
**R:** La app sigue funcionando. Tus conteos se guardan localmente. Cuando recuperes conexión, se sincronizan automáticamente.

### ❓ ¿Cuánto tiempo tarda la sincronización?
**R:** Menos de 1 segundo si hay buena conexión. Si falla, reintentos cada segundo hasta 8 segundos.

### ❓ ¿Puedo escanear el mismo producto 2 veces?
**R:** Sí. Se suma la cantidad. Ej: Escanear 2x códigos del mismo producto = Qty 20 si pusiste 10+10.

### ❓ ¿Qué pasa si me equivoco en la cantidad?
**R:** Tap en el producto de la lista, edita cantidad, tap "Actualizar". Se sincroniza automáticamente.

### ❓ ¿Cómo borro un producto?
**R:** Tap en producto → "Eliminar" → Confirma. Se marca como eliminado, se sincroniza al supervisor.

### ❓ ¿Mi sesión expira?
**R:** Tu token JWT dura 24 horas. Después: auto-logout. El supervisor verá tu sesión como "Cerrada".

### ❓ ¿Puedo contar 2 sesiones al mismo tiempo?
**R:** No. Una sesión a la vez. Cierras sesión → Inicias nueva.

### ❓ ¿Dónde veo mis conteos anteriores?
**R:** Panel de Supervisor lo ve. Tú los ves en "Historial" (si tu supervisor lo comparte).

---

## 📞 Ayuda

- **Problema técnico:** Reportar a tu supervisor
- **Pregunta de uso:** Ver esta guía o preguntar compañero
- **Sugerencia:** billcastillo99@gmail.com

---

**¡Listo para contar!** 🚀
