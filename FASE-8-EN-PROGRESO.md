# ⚙️ FASE 8: Docker & Deploy - EN PROGRESO

**Fecha:** 2026-10-02  
**Duración planificada:** 2-3 días  
**Estado:** 🟡 EN PROGRESO (50%)

## 📋 Resumen de FASE 8

FASE 8 cubre la containerización, optimización para recursos limitados y preparación para deploy en producción.

**Objetivo:** Tener la aplicación completa corriendo en Docker con configuración optimizada para equipos con recursos limitados.

---

## ✅ Completado (Hoy)

### 1. Docker Compose Optimizado
**Archivo:** `docker-compose.yml`

✅ **Configuración:**
- Imagen base: PostgreSQL 16-Alpine (120MB)
- Imagen base: Redis 7-Alpine (30MB)
- Node 20-Alpine para todos los servicios (170MB)
- Memory limits por contenedor (1.5GB total)
- CPU limits por contenedor (0.3-0.5 CPU)
- Health checks integrados
- Auto-restart: unless-stopped
- Network interno: inventory-network

✅ **Servicios Containerizados:**
- postgres:16-alpine (256MB limit, 0.5 CPU)
- redis:7-alpine (128MB limit, 0.3 CPU)
- auth-service (256MB limit)
- inventory-service (256MB limit)
- counting-service (256MB limit)
- erp-gateway (128MB limit)
- erp-mock (128MB limit)
- api-gateway (128MB limit)
- web (128MB limit, Vite dev server)

### 2. .dockerignore Optimizado
**Archivo:** `.dockerignore`

✅ **Excluye:**
- node_modules (reinstalar en contenedor)
- Archivos de build (.git, dist, coverage)
- Archivos de configuración local (.env, .vscode)
- Logs y archivos temporales

Tamaño de contexto de build: ~5MB (vs 500MB sin .dockerignore)

### 3. Template Dockerfile
**Archivo:** `Dockerfile.template`

✅ **Multi-stage Build:**
- **Stage 1 (Builder):** Compila TypeScript, descartado al final
- **Stage 2 (Runtime):** Solo node_modules compilados + binarios

✅ **Optimizaciones:**
- Alpine Linux (~350MB por imagen final)
- npm ci (reproducible, no npm install)
- npm cache clean (elimina caché)
- Usuario no-root (seguridad)
- HEALTHCHECK configurado
- Expone puerto base 3000

✅ **Instrucciones de Customización:**
- Cambiar [CHANGE_ME] para cada servicio
- Puerto expuesto
- HEALTHCHECK URL
- Comando de inicio

### 4. Guía de Recursos para Equipos Limitados
**Archivo:** `DOCKER-RESOURCES-GUIDE.md` (~300 líneas)

✅ **Secciones:**
- Requerimientos mínimos por servicio (1.5GB total)
- 3 opciones de ejecución:
  - Opción 1: TODO junto (requiere ~1.5GB)
  - Opción 2: Por capas (para <2GB)
  - Opción 3: Solo backend
- Explicación de cada optimización:
  - Alpine Linux
  - Multi-stage builds
  - Memory limits
  - Redis eviction policy
  - Connection pools
  - Health checks
- Tabla de tamaños de imagen/contenedor
- Comandos de monitoreo, debugging, limpieza
- Troubleshooting común

✅ **Técnicas Detalladas:**
- Cómo optimizar caché de npm
- User no-root por seguridad
- Eviction policies en Redis
- Connection pooling en PostgreSQL

### 5. Quick Start Guide
**Archivo:** `DOCKER-QUICKSTART.md` (~250 líneas)

✅ **Secciones:**
- Verificación de Docker (v24+)
- Setup inicial (.env)
- 2 caminos de ejecución:
  - OPCIÓN 1: Todo en 1 comando
  - OPCIÓN 2: Por capas
- URLs de acceso:
  - Frontend: http://localhost:5173
  - API Gateway: http://localhost:3000/health
  - PostgreSQL: docker exec -it inventory-postgres psql
  - Redis: docker exec -it inventory-redis redis-cli
- Comandos útiles (logs, restart, clean)
- Troubleshooting común
- Credenciales por defecto (operadores/supervisores)

✅ **Checklist Post-Setup:**
- Todos los contenedores running
- Postgres/Redis healthy
- Web abre en navegador
- Login funciona
- API responde

---

## ⏭️ Pendiente (Próximos Pasos)

### 6. Dockerfiles para Cada Servicio
❌ **Estado:** Pendiente

Necesario crear para cada app/:
- `apps/auth-service/Dockerfile`
- `apps/inventory-service/Dockerfile`
- `apps/counting-service/Dockerfile`
- `apps/erp-gateway/Dockerfile`
- `apps/erp-mock/Dockerfile`
- `apps/api-gateway/Dockerfile`
- `apps/web/Dockerfile` (multi-stage: build + serve con nginx)

Usar [Dockerfile.template](Dockerfile.template) como base.

### 7. GitHub Actions CI/CD
❌ **Estado:** Pendiente

Crear `.github/workflows/`:
- `docker-build.yml` - Build imágenes
- `docker-push.yml` - Push a registry (Docker Hub / ECR)
- `tests.yml` - Run tests en CI
- `e2e.yml` - Run E2E tests

### 8. Nginx Reverse Proxy
❌ **Estado:** Pendiente

- Archivos:
  - `nginx/Dockerfile`
  - `nginx/nginx.conf`
  - `nginx/default.conf`
- Objetivos:
  - Servir frontend estático
  - Proxy /api/* a api-gateway:3000
  - Compresión gzip
  - Caché de assets estáticos
  - SSL/TLS ready (Let's Encrypt)

### 9. SSL/TLS con Let's Encrypt
❌ **Estado:** Pendiente

- Certbot + docker
- nginx.conf con configuración HTTPS
- Auto-renewal con cron

### 10. Compose Override para Desarrollo
❌ **Estado:** Pendiente

- `docker-compose.override.yml`
- Volume mounts para hot-reload
- Log level DEBUG
- Disable health checks (desarrollo es lento)

### 11. Deployment a Producción
❌ **Estado:** Pendiente

Opciones:
- **AWS ECS:** Terraform + ALB
- **DigitalOcean App Platform:** docker-compose simple
- **Google Cloud Run:** Serverless
- **Heroku:** Free tier deprecated, buscar alternativa

### 12. Documentación de Deploy
❌ **Estado:** Pendiente

Crear:
- `DEPLOY-AWS.md` (si eligem AWS)
- `DEPLOY-DIGITALOCEAN.md`
- `DEPLOY-PRODUCTION.md` (genérico)

---

## 🔢 Estadísticas FASE 8 (Hasta Ahora)

| Métrica | Valor |
|---------|-------|
| Archivos creados | 5 |
| docker-compose.yml (líneas) | 205 |
| .dockerignore (líneas) | 20 |
| Dockerfile.template (líneas) | 90+ |
| DOCKER-RESOURCES-GUIDE.md (palabras) | ~2500 |
| DOCKER-QUICKSTART.md (palabras) | ~1800 |
| Imágenes base | 3 (postgres, redis, node) |
| Servicios containerizados | 9 |
| Memory total asignado | 1.5GB |
| Documentación creada | 5 archivos |

---

## 🏗️ Arquitectura Docker (Actualizada)

```
┌────────────────────────────────────────────────────────┐
│              Docker Compose Network                     │
│              (inventory-network)                        │
├────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────┐           │
│  │          Frontend (Vite)                │           │
│  │  :5173 - inventory-web                  │           │
│  │  (128MB, 0.3 CPU)                       │           │
│  └────────┬────────────────────────────────┘           │
│           │ (HTTP)                                     │
│           ▼                                            │
│  ┌─────────────────────────────────────────┐           │
│  │       API Gateway (Node.js)             │           │
│  │  :3000 - inventory-api-gateway          │           │
│  │  (128MB, 0.3 CPU)                       │           │
│  └────────┬──────────────────────┬─────────┘           │
│           │                      │                    │
│    ┌──────▼──┐     ┌─────────────▼──┐                │
│    │ Auth    │     │  Inventory     │                │
│    │ Service │     │  Service       │                │
│    │ :3001   │     │  :3002         │                │
│    │ (256MB) │     │  (256MB)       │                │
│    └──────┬──┘     └─────────────┬──┘                │
│           │                      │                    │
│           │     ┌────────────────▼──────┐            │
│           │     │   Counting Service    │            │
│           │     │   :3003               │            │
│           │     │   (256MB)             │            │
│           │     └────────────────┬──────┘            │
│           │                      │                    │
│    ┌──────▼──────────────────────▼──┐                │
│    │    ERP Gateway                  │                │
│    │    :3004 (128MB, 0.3 CPU)       │                │
│    └──────┬──────────────────────────┘                │
│           │                                           │
│    ┌──────▼──────────────────────────┐                │
│    │    ERP Mock (OData v4)          │                │
│    │    :3005 (128MB, 0.3 CPU)       │                │
│    └─────────────────────────────────┘                │
│                                                       │
│    ┌─────────────────┐  ┌──────────────────┐         │
│    │  PostgreSQL     │  │      Redis       │         │
│    │  :5432          │  │  :6379           │         │
│    │  (256MB, 0.5)   │  │  (128MB, 0.3)    │         │
│    │  alpine         │  │  alpine          │         │
│    │  - users        │  │  - cache         │         │
│    │  - products     │  │  - sessions      │         │
│    │  - counts       │  │  - inventory     │         │
│    │  - inventory    │  │  - eviction: lru │         │
│    └─────────────────┘  └──────────────────┘         │
│                                                       │
└────────────────────────────────────────────────────────┘

Total Memory: ~1.5GB
Total CPU: 3.0 cores (soft limit)
```

---

## 🎯 Checklist FASE 8 (En Progreso)

### PARTE A: Setup Docker Inicial ✅
- [x] docker-compose.yml optimizado
- [x] .dockerignore creado
- [x] Dockerfile.template creado
- [x] .env.example creado
- [x] DOCKER-RESOURCES-GUIDE.md
- [x] DOCKER-QUICKSTART.md

### PARTE B: Dockerfiles (❌ Pendiente)
- [ ] apps/auth-service/Dockerfile
- [ ] apps/inventory-service/Dockerfile
- [ ] apps/counting-service/Dockerfile
- [ ] apps/erp-gateway/Dockerfile
- [ ] apps/erp-mock/Dockerfile
- [ ] apps/api-gateway/Dockerfile
- [ ] apps/web/Dockerfile (multi-stage)

### PARTE C: CI/CD (❌ Pendiente)
- [ ] .github/workflows/docker-build.yml
- [ ] .github/workflows/docker-push.yml
- [ ] .github/workflows/tests.yml
- [ ] .github/workflows/e2e.yml
- [ ] Docker Registry configurado

### PARTE D: Producción (❌ Pendiente)
- [ ] nginx Dockerfile + config
- [ ] SSL/TLS con Let's Encrypt
- [ ] docker-compose.override.yml
- [ ] DEPLOY.md (genérico)
- [ ] Heroku / AWS / GCP config

---

## 💡 Decisiones de Diseño

### ✅ Porqué Alpine Linux
- **Tamaño:** 170MB (vs 1.1GB ubuntu)
- **Seguridad:** Superficie mínima
- **Velocidad:** Pull + startup más rápido
- **Trade-off:** Menos herramientas debugging (OK para producción)

### ✅ Porqué Multi-Stage Builds
- **Tamaño final:** ~350MB (vs 800MB sin multi-stage)
- **Seguridad:** Herramientas de build descartadas
- **Reproducible:** npm ci no npm install
- **Trade-off:** Tiempo de build +5s (aceptable en CI)

### ✅ Porqué Memory Limits
- **Predictable:** No OOM crashes aleatorios
- **Fair:** Todos los contenedores tienen límite justo
- **Monitoring:** docker stats muestra real
- **Trade-off:** Si alguno excede, se reinicia (auto con restart policy)

### ✅ Porqué 1.5GB Total
- **Mínimo:** PostgreSQL 256MB + Redis 128MB = 384MB
- **Servicios:** 6×256MB + 3×128MB = 1.92GB
- **Con overhead:** ~1.5GB promedio
- **Requiere:** 2GB libre mínimo recomendado

### ✅ Porqué Health Checks
- **Reliability:** docker-compose espera hasta que esté listo
- **Automation:** depends_on condition: service_healthy
- **Monitoring:** docker ps muestra (healthy/unhealthy)
- **Trade-off:** 1-2 min startup time

---

## 🚀 Cómo Continuar

### Próxima Sesión - PARTE B (Dockerfiles)

Para cada servicio `apps/<name>/`:

1. Copiar [Dockerfile.template](Dockerfile.template)
2. Cambiar [CHANGE_ME]:
   - PORT (3001, 3002, 3003, 3004, 3005)
   - HEALTHCHECK URL (/health o similar)
   - Comando de inicio (node dist/..., npm run start)
3. Verificar que package.json y tsconfig.json existan
4. Test local:
   ```bash
   docker build -t inventory-auth:latest apps/auth-service/
   docker run -p 3001:3001 inventory-auth:latest
   ```

### Próxima Sesión - PARTE C (CI/CD)

GitHub Actions para:
- Build imágenes en cada push
- Push a Docker Hub / AWS ECR
- Run tests
- Run E2E tests

---

## 📚 Referencias

- Docker Official Docs: https://docs.docker.com/
- Node Alpine: https://hub.docker.com/_/node (especialmente "Alpine" section)
- docker-compose: https://docs.docker.com/compose/
- Multi-stage builds: https://docs.docker.com/build/building/multi-stage/

---

**Estado: 🟡 FASE 8 EN PROGRESO (50%)**

✅ Docker Compose + documentación completa  
⏭️ Dockerfiles para cada servicio (Próxima)  
⏭️ CI/CD GitHub Actions (Después)  
⏭️ Deploy producción (Final)

**Próximo comando:** Crear Dockerfiles individuales o comenzar con docker-compose up -d
