# 🐳 Docker Optimization para Equipos con Recursos Limitados

**Fecha:** 2026-10-02  
**Orientado a:** Equipos con RAM < 8GB, CPU limitado

## 📊 Requerimientos Mínimos (FASE 8)

### Equipos CON Recursos Limitados (<8GB RAM)

```
PostgreSQL:      256MB
Redis:           128MB
Auth Service:    256MB
Inventory Srv:   256MB
Counting Srv:    256MB
ERP Gateway:     128MB
ERP Mock:        128MB
API Gateway:     128MB
Web App:         128MB
─────────────────────────
TOTAL (máx):     ~1.5GB
```

### Recomendaciones

- ✅ Ejecutar máximo 8-10 contenedores simultáneamente
- ✅ Usar Alpine Linux para todas las imágenes
- ✅ Multi-stage builds para minimizar tamaño
- ✅ No instalar DevDependencies en producción
- ✅ Usar limits y requests en docker-compose

## 🎯 Cómo Ejecutar con Recursos Limitados

### Opción 1: Ejecutar TODO (requiere ~1.5GB RAM disponible)

```bash
# Limpiar primero
docker system prune -a --volumes

# Construir y ejecutar
docker-compose up -d

# Verificar que todos arranquen
docker-compose ps

# Esperar a que health checks pasen (1-2 min)
docker-compose logs -f postgres redis
```

### Opción 2: Ejecutar Solo Servicios Críticos

Si tienes <2GB libre, ejecuta por capas:

```bash
# Capa 1: Base (DB + Cache)
docker-compose up -d postgres redis
docker-compose ps
sleep 30

# Capa 2: Services core
docker-compose up -d auth-service inventory-service counting-service
docker-compose ps
sleep 20

# Capa 3: Gateways
docker-compose up -d erp-mock erp-gateway api-gateway
docker-compose ps
sleep 10

# Capa 4: Frontend
docker-compose up -d web
docker-compose ps

# Todos listos cuando TODO muestre "healthy" o "running"
```

### Opción 3: Ejecutar SOLO Backend (Sin Web)

```bash
# Comentar "web" en docker-compose.yml o ejecutar:
docker-compose up -d postgres redis auth-service inventory-service \
  counting-service erp-mock erp-gateway api-gateway

# Verificar:
curl http://localhost:3000/health
```

## 🔧 Optimizaciones Aplicadas

### 1. Alpine Linux
```dockerfile
FROM node:20-alpine  # ~170MB vs ~1.1GB con ubuntu
```

### 2. Multi-Stage Builds
```dockerfile
# Stage 1: Build (descartado después)
FROM node:20-alpine AS builder
RUN npm ci --only=production

# Stage 2: Runtime (solo node_modules compilados)
FROM node:20-alpine
COPY --from=builder /build/node_modules ./
```

### 3. Memory Limits en docker-compose.yml
```yaml
postgres:
  mem_limit: 256m      # No puede usar más
  cpus: '0.5'          # Media CPU

redis:
  mem_limit: 128m
  cpus: '0.3'
```

### 4. Redis Eviction Policy
```yaml
command: redis-server --maxmemory 128mb --maxmemory-policy allkeys-lru
```
Cuando Redis llena, elimina keys antiguas automáticamente.

### 5. PostgreSQL Connection Pool
```yaml
POSTGRES_MAX_CONNECTIONS: 50  # Reducido de 100
```

### 6. Health Checks
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U counting"]
  interval: 10s
  timeout: 5s
  retries: 5
```
Solo avanza cuando el servicio está realmente listo.

## 📉 Técnicas para Reducir Tamaño de Imagen

### Cache de npm (Dockerfile)
```dockerfile
RUN npm ci --only=production && \
    npm cache clean --force
```

### .dockerignore
```
node_modules  # No copies, reinstala
dist
.git
coverage
*.log
```

### Ejecutar como Usuario No-Root
```dockerfile
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs
```

Reduce superficie de ataque + no puede ejecutar comandos privilegiados.

## 🚀 Comandos Útiles

### Monitoreo
```bash
# Ver uso de recursos en tiempo real
docker stats

# Ver logs de un servicio
docker-compose logs -f api-gateway

# Ver logs del último 100 líneas
docker-compose logs --tail=100 postgres

# Ver solo errores
docker-compose logs --tail=100 -f api-gateway | grep -i error
```

### Debugging
```bash
# Entrar a un contenedor
docker exec -it inventory-postgres psql -U counting -d counting_dev

# Ver variables de ambiente
docker exec inventory-postgres env

# Reiniciar un servicio
docker-compose restart auth-service

# Recrear un servicio (borra + recreate)
docker-compose up -d --force-recreate auth-service
```

### Limpieza
```bash
# Detener TODOS
docker-compose down

# Detener + eliminar volúmenes
docker-compose down -v

# Limpiar imágenes sin usar
docker image prune -a

# Limpiar TODO (⚠️ destructivo)
docker system prune -a --volumes
```

## ⚠️ Troubleshooting

### Error: "OOM killer" o "Cannot allocate memory"
→ Detén otros contenedores
→ Aumenta `mem_limit` en docker-compose.yml
→ Ejecuta por capas (Opción 2)

### PostgreSQL no arranca
```bash
# Ver logs
docker-compose logs postgres

# Limpiar volumen y reintentar
docker-compose down -v
docker-compose up -d postgres
sleep 15
docker-compose logs postgres
```

### Redis says "WARNING: no swap space"
→ Ignorable en desarrollo
→ En producción, configura swap en el host

### Servicios tardan mucho en arrancar
→ Normal con recursos limitados (2-5 min)
→ Ver health checks: `docker-compose ps`
→ Ver logs: `docker-compose logs -f`

## 📋 Checklist Pre-Deploy

- [x] `.dockerignore` creado
- [x] `.env.example` creado
- [x] `docker-compose.yml` optimizado con limits
- [x] Todos los Dockerfiles usan Alpine
- [x] Multi-stage builds en todos los servicios
- [x] Health checks configurados
- [x] Non-root user en todos los contenedores
- [x] npm cache limpiado en Dockerfiles
- [x] Dependencias dev excluidas en prod

## 🎯 Resumen de Tamaños

| Servicio | Imagen | Container |
|----------|--------|-----------|
| node:20-alpine | ~170MB | ↓ |
| auth-service | ~350MB | ~200MB |
| inventory-service | ~380MB | ~210MB |
| counting-service | ~380MB | ~210MB |
| erp-gateway | ~330MB | ~150MB |
| erp-mock | ~330MB | ~150MB |
| api-gateway | ~330MB | ~150MB |
| web (Vite) | ~280MB | ~100MB |
| postgres:16-alpine | ~120MB | ~256MB (memfixed) |
| redis:7-alpine | ~30MB | ~128MB (memfixed) |

**Total imágenes:** ~2.5GB
**Total en ejecución:** ~1.5GB (con limits)

## 🔗 Próximos Pasos (FASE 8 continuación)

1. ✅ `docker-compose.yml` con limits
2. ✅ `.dockerignore` y `.env.example`
3. ⏭️ GitHub Actions CI/CD (build + push to registry)
4. ⏭️ Nginx reverse proxy
5. ⏭️ SSL/TLS con Let's Encrypt
6. ⏭️ Deployment a producción (AWS/GCP/DigitalOcean)

---

**Estado:** FASE 8 Comenzada - Docker Optimization
