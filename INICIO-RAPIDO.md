# ⚡ Inicio Rápido - Inventory Count PWA

**Fecha:** 2026-10-02  
**Tiempo estimado:** 5-10 minutos

---

## 🎯 Opción 1: Desarrollo Local (Recomendado para Windows/WSL)

Si Docker tiene problemas, usa desarrollo local directamente:

### Requisitos
- Node.js 20+
- PostgreSQL 16 (local o Docker separado)
- Redis (local o Docker separado)

### Paso 1: Instalar Dependencias

```bash
# Terminal 1: Auth Service
cd apps/auth-service
npm install
npm run dev

# Terminal 2: Inventory Service
cd apps/inventory-service
npm install
npm run dev

# Terminal 3: Counting Service
cd apps/counting-service
npm install
npm run dev

# Terminal 4: ERP Gateway
cd apps/erp-gateway
npm install
npm run dev

# Terminal 5: ERP Mock
cd apps/erp-mock
npm install
npm run dev

# Terminal 6: API Gateway
cd apps/api-gateway
npm install
npm run dev

# Terminal 7: Frontend
cd apps/web
npm install
npm run dev
```

### Paso 2: Configurar Base de Datos

```bash
# PostgreSQL - crear BD (en tu PostgreSQL local)
psql -U postgres
CREATE DATABASE counting_dev;
CREATE USER counting WITH PASSWORD 'secret';
ALTER ROLE counting SET client_encoding TO 'utf8';
ALTER ROLE counting SET default_transaction_isolation TO 'read committed';
ALTER ROLE counting SET default_transaction_deferrable TO off;
ALTER ROLE counting SET default_transaction_read_only TO off;
ALTER ROLE counting SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE counting_dev TO counting;
```

### Paso 3: Crear .env

```bash
cp .env.example .env
```

Editar `.env`:
```env
NODE_ENV=development
LOG_LEVEL=info
DB_USER=counting
DB_PASSWORD=secret
DB_NAME=counting_dev
DB_PORT=5432
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
VITE_API_URL=http://localhost:3000
```

### Paso 4: Abrir App

```bash
open http://localhost:5173
```

**Login:**
- Usuario: `OP001` / `pass123`
- Supervisor: `SV001` / `pass123`

---

## 🐳 Opción 2: Solo Databases con Docker

Si Docker funciona pero PostgreSQL falla, usa Redis en Docker + PostgreSQL local:

```bash
# Levantar solo Redis
docker run -d -p 6379:6379 --name inventory-redis redis:7-alpine

# PostgreSQL local
# Instala PostgreSQL directamente en tu máquina o usa docker run separado
```

---

## ✅ Verificar Setup

### Endpoints Listos

```bash
# Auth Service
curl http://localhost:3001/health

# Inventory Service
curl http://localhost:3002/health

# Counting Service
curl http://localhost:3003/health

# ERP Gateway
curl http://localhost:3004/health

# API Gateway
curl http://localhost:3000/health

# Frontend
open http://localhost:5173
```

### Base de Datos

```bash
# PostgreSQL
psql -U counting -d counting_dev -h localhost

# Redis
redis-cli ping
# Output: PONG
```

---

## 🔧 Troubleshooting

### "Cannot connect to database"
```bash
# Verificar PostgreSQL está corriendo
pg_isready -h localhost -U counting -d counting_dev

# Si no está, iniciar PostgreSQL
# En Windows: Services → PostgreSQL → Start
# En Mac: brew services start postgresql
# En Linux: sudo systemctl start postgresql
```

### "Redis connection refused"
```bash
# Verificar Redis está corriendo
redis-cli ping

# Si no está, iniciar
# docker run -d -p 6379:6379 redis:7-alpine
```

### "Port already in use"
```bash
# Cambiar puerto en .env o servicios
# O matar proceso en puerto:
# Windows: netstat -ano | findstr :3000
# Linux/Mac: lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill
```

---

## 📊 Monitoreo Desarrollo

### Ver Logs (una terminal)
```bash
# Auth Service
npm run dev --workspace=apps/auth-service

# Inventory Service
npm run dev --workspace=apps/inventory-service

# etc...
```

### Base de Datos
```bash
# PostgreSQL
psql -U counting -d counting_dev

# Redis
redis-cli monitor  # Ve comandos en tiempo real
```

---

## 🧪 Testing

```bash
# Unitarios
cd apps/web
npm run test

# E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 🚀 Next Steps

1. ✅ Loguear con OP001/pass123
2. ✅ Escanear código de barras
3. ✅ Registrar cantidad
4. ✅ Ver sincronización
5. ✅ Loguear con SV001/pass123
6. ✅ Revisar sesión y aprobar

---

## 📚 Documentación Completa

- [BIENVENIDA.md](BIENVENIDA.md) - Punto de entrada
- [DOCUMENTACION-INDICE.md](DOCUMENTACION-INDICE.md) - Índice por rol
- [docs/USER-GUIDE.md](docs/USER-GUIDE.md) - Guía operadores
- [docs/SUPERVISOR-GUIDE.md](docs/SUPERVISOR-GUIDE.md) - Guía supervisores

---

**¡Listo para comenzar!** 🚀
