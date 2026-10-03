# 📦 Inventory Count PWA - Aplicación de Conteo de Inventario

> Sistema completo de conteo de inventario offline-first para operadores de almacén y supervisores

**Estado:** ✅ v1.0 Completa | **Fecha:** 2026-10-02

---

## 🎯 Descripción General

**Inventory Count PWA** es una aplicación web progresiva (PWA) para optimizar procesos de conteo de inventario en almacenes. Utiliza arquitectura **offline-first** permitiendo a operadores contar productos sin conexión, con sincronización automática.

### Características

✅ Escaneo de código de barras EAN-13 en tiempo real  
✅ Funcionamiento 100% offline con IndexedDB  
✅ Sincronización automática con retry exponencial  
✅ Panel de supervisor con análisis de diferencias  
✅ ACID transactions + idempotency  
✅ Autenticación JWT + Roles  
✅ 80%+ test coverage  

---

## 🏗️ Stack

**Backend:** 6 microservicios Node.js/Express + PostgreSQL + Redis  
**Frontend:** React 18 + Vite + Tailwind + Dexie  
**DevOps:** Docker Compose + GitHub Actions (preparado)  

---

## 🚀 Inicio Rápido

### Docker (Recomendado)
```bash
docker-compose up -d
# Esperar 2-3 min
open http://localhost:5173
```

Credenciales:
- Operador: `OP001` / `pass123`
- Supervisor: `SV001` / `pass123`

### Desarrollo Local
```bash
# Terminal 1: Backend services
cd apps/auth-service && npm install && npm run dev

# Terminal 2-7: Repetir para otros servicios (inventory, counting, etc.)

# Terminal Final: Frontend
cd apps/web && npm install && npm run dev
```

---

## 📚 Documentación

| Documento | Para Quién | Contenido |
|-----------|-----------|----------|
| [DOCKER-QUICKSTART.md](DOCKER-QUICKSTART.md) | DevOps | Docker en 5 min |
| [DOCKER-RESOURCES-GUIDE.md](DOCKER-RESOURCES-GUIDE.md) | Equipos limitados | Optimización |
| [USER-GUIDE.md](docs/USER-GUIDE.md) | Operadores | Cómo usar app |
| [SUPERVISOR-GUIDE.md](docs/SUPERVISOR-GUIDE.md) | Supervisores | Panel de análisis |
| [API-DOCS.md](docs/API-DOCS.md) | Desarrolladores | Endpoints REST |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitectos | Diseño sistema |

---

## 🧪 Testing

```bash
# Unit tests
npm run test --workspace=web
npm run test:coverage

# E2E tests
npm run test:e2e --workspace=web

# CI
npm run test:e2e:ui
```

---

## 📊 Proyecto

| Métrica | Valor |
|---------|-------|
| Microservicios | 6 |
| API Endpoints | 30+ |
| Componentes | 15+ |
| Tests | 20+ |
| Coverage | 80%+ |
| Tamaño Bundle | ~150KB (gzip) |

---

## 🔐 Seguridad

- JWT + Bcrypt password hashing
- Zod validation en todos los inputs
- ACID transactions
- UNIQUE constraints para idempotency
- Rate limiting (100 req/min)
- CORS + Security headers

---

## 📱 Características

### Operador
- Login con JWT
- Escaneo de códigos de barras
- Entrada de cantidades
- Funcionamiento offline
- Auto-sync con retry

### Supervisor
- Listar sesiones de conteo
- Análisis de diferencias
- Estadísticas
- Aprobación y envío a ERP

---

## 🔗 Servicios

- API Gateway (`:3000`)
- Auth Service (`:3001`)
- Inventory Service (`:3002`)
- Counting Service (`:3003`)
- ERP Gateway (`:3004`)
- ERP Mock/OData (`:3005`)
- Frontend PWA (`:5173`)

---

## 📈 Performance

- Redux caching (3600s products, 1800s stock)
- Exponential backoff retry
- Connection pooling DB
- Lazy loading frontend
- Service Worker offline

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| No puedo loguearme | Verificar usuario en BD (OP001, SV001) |
| App no sincroniza | Ver indicador bottom-right, check API health |
| Escaneo no funciona | Dar permiso cámara, HTTPS en prod |
| DB no arranca | `docker-compose down -v && docker-compose up -d postgres` |

---

## 👥 Autor

**Bill Castillo**  
📧 billcastillo99@gmail.com  
📅 Versión 1.0.0 - 2026-10-02

---

[🚀 Quick Start](DOCKER-QUICKSTART.md) | [📖 API Docs](docs/API-DOCS.md) | [🏛️ Architecture](docs/ARCHITECTURE.md)
