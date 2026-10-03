# 📚 Índice Completo de Documentación

**Inventory Count PWA - Sistema de Conteo de Inventario**  
**Versión:** 1.0 | **Fecha:** 2026-10-02

---

## 🎯 Selecciona tu Rol

### 👤 Soy Operador de Almacén
**Necesitas:** Cómo usar la app para contar inventario

1. **[DOCKER-QUICKSTART.md](DOCKER-QUICKSTART.md)** - Cómo iniciar la app (5 min)
2. **[docs/USER-GUIDE.md](docs/USER-GUIDE.md)** - Guía completa de uso
   - Login
   - Escaneo de códigos
   - Registro de cantidades
   - Funcionamiento offline
   - Sincronización
   - FAQs

**Resumen rápido:**
- Usuario: `OP001` | Contraseña: `pass123`
- Escanea códigos, registra cantidades, todo se sincroniza automáticamente
- Funciona offline, sin problemas
- Ver [USER-GUIDE.md](docs/USER-GUIDE.md)

---

### 👨‍💼 Soy Supervisor de Almacén
**Necesitas:** Cómo revisar y aprobar conteos

1. **[DOCKER-QUICKSTART.md](DOCKER-QUICKSTART.md)** - Cómo iniciar la app (5 min)
2. **[docs/SUPERVISOR-GUIDE.md](docs/SUPERVISOR-GUIDE.md)** - Guía panel supervisor
   - Listar sesiones de conteo
   - Analizar diferencias
   - Aprobar y enviar a ERP
   - Generar reportes
   - FAQs

**Resumen rápido:**
- Usuario: `SV001` | Contraseña: `pass123`
- Revisa diferencias entre teórico y contado
- Items en rojo (>10% diferencia) requieren reconteo
- Aprueba y envía a ERP
- Ver [SUPERVISOR-GUIDE.md](docs/SUPERVISOR-GUIDE.md)

---

### 💻 Soy Desarrollador
**Necesitas:** Entender la arquitectura y hacer cambios

#### Inicio Rápido
1. **[README.md](README.md)** - Visión general completa
2. **[DOCKER-QUICKSTART.md](DOCKER-QUICKSTART.md)** - Levantar env local en 5 min
3. **Desarrollo local:**
   ```bash
   cd apps/auth-service && npm install && npm run dev
   # (Repetir para otros servicios en terminales separadas)
   cd apps/web && npm install && npm run dev
   ```

#### Documentación Técnica (Por Completar)
- **[docs/API-DOCS.md](docs/API-DOCS.md)** - Endpoints REST (plantilla)
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Decisiones técnicas (plantilla)
- **[docs/DATABASE-SCHEMA.md](docs/DATABASE-SCHEMA.md)** - Modelo datos (plantilla)

#### Testing
```bash
# Unitarios (80%+ coverage)
npm run test --workspace=web
npm run test:coverage --workspace=web

# E2E
npm run test:e2e --workspace=web
npm run test:e2e:ui --workspace=web
```

#### Estructura del Código
```
apps/
├── auth-service/        # JWT + Password hashing
├── inventory-service/   # Productos + Redis cache
├── counting-service/    # Sesiones + Diferencias
├── erp-gateway/         # Adapter a ERP
├── erp-mock/           # OData v4 simulator
├── api-gateway/        # Rate limiting + Proxy
└── web/                # React PWA frontend

apps/web/
├── src/
│   ├── pages/          # Rutas principales
│   ├── components/     # UI reutilizables
│   ├── features/       # Lógica por dominio
│   ├── services/       # APIs externas
│   ├── store/          # Zustand state
│   ├── lib/            # Utilidades
│   ├── offline/        # IndexedDB + Sync
│   └── hooks/          # Custom React hooks
├── e2e/                # Playwright tests
└── vitest.config.ts    # Unit test config
```

#### Desarrollar Localmente
- Terminal 1-6: Cada servicio backend con `npm run dev`
- Terminal 7: Frontend con `npm run dev` en apps/web

#### Guías de Código
- Convenciones: Ver [FASE-X-COMPLETADA.md](#fases)
- Testing: TDD + 80% coverage mínimo
- Seguridad: JWT + Zod validation

---

### 🐳 Soy DevOps / SRE
**Necesitas:** Deploy, monitoreo, infraestructura

#### Docker (FASE 8)
1. **[DOCKER-QUICKSTART.md](DOCKER-QUICKSTART.md)** - Levantar en Docker (3-5 min)
2. **[DOCKER-RESOURCES-GUIDE.md](DOCKER-RESOURCES-GUIDE.md)** - Optimización recursos
3. **[docker-compose.yml](docker-compose.yml)** - Configuración completa

**Iniciar:**
```bash
docker-compose up -d
docker-compose ps  # Verificar
curl http://localhost:3000/health
```

#### Deploy a Producción (Por Completar)
- AWS ECS + ALB
- DigitalOcean App Platform
- Nginx + SSL/TLS
- GitHub Actions CI/CD
- Monitoreo (Sentry, Prometheus)

#### Servicios
- API Gateway: `:3000`
- Auth Service: `:3001`
- Inventory Service: `:3002`
- Counting Service: `:3003`
- ERP Gateway: `:3004`
- ERP Mock: `:3005`
- Web (Vite): `:5173`
- PostgreSQL: `:5432`
- Redis: `:6379`

#### Monitoreo
```bash
# Ver recursos en tiempo real
docker stats

# Ver logs
docker-compose logs -f api-gateway

# Health checks
curl http://localhost:3000/health
curl http://localhost:3001/health
```

---

### 📊 Soy Ejecutivo / Manager
**Necesitas:** Entender qué es la solución

#### Visión General
- **[README.md](README.md)** - Descripción completa
  - Stack tecnológico
  - Características
  - Estadísticas del proyecto
  - Roadmap

#### Métricas de Éxito
| Métrica | Valor |
|---------|-------|
| Code Coverage | 80%+ |
| Deployment | <5 min (Docker) |
| Uptime Goal | 99.5% |
| Time to Market | v1.0 2026-10-02 |

#### Características Implementadas
✅ Escaneo de código de barras  
✅ Funcionamiento offline  
✅ Sincronización automática  
✅ Panel de supervisor  
✅ Análisis de diferencias  
✅ Seguridad empresarial  
✅ Tests automatizados  

---

## 📂 Estructura de Documentación

```
Raíz/
├── README.md                          # Visión general
├── DOCUMENTACION-INDICE.md           # Este archivo
├── DOCKER-QUICKSTART.md              # Docker en 5 min
├── DOCKER-RESOURCES-GUIDE.md         # Recursos limitados
├── Dockerfile.template               # Template multi-stage
├── docker-compose.yml                # Orquestación
├── .dockerignore                     # Optimización
├── .env.example                      # Variables de entorno
├── FASE-1-COMPLETADA.md             # ERP Mock + Auth
├── FASE-2-COMPLETADA.md             # Inventory + Counting
├── ... (FASE 3-9)
│
└── docs/
    ├── USER-GUIDE.md                # Guía operadores
    ├── SUPERVISOR-GUIDE.md          # Guía supervisores
    ├── API-DOCS.md                  # Endpoints (plantilla)
    ├── ARCHITECTURE.md              # Decisiones (plantilla)
    ├── DATABASE-SCHEMA.md           # Modelo datos (plantilla)
    ├── DEPLOYMENT.md                # Deploy prod (plantilla)
    └── TROUBLESHOOTING.md           # Problemas (plantilla)
```

---

## 🔍 Buscar por Palabra Clave

### "No puedo loguearme"
→ [USER-GUIDE.md - Inicio de Sesión](docs/USER-GUIDE.md#inicio-de-sesión)  
→ Usuarios: OP001/OP002/OP003 (operadores), SV001/SV002 (supervisores)  
→ Contraseña: `pass123`

### "Cómo escanear códigos"
→ [USER-GUIDE.md - Escaneo de Códigos](docs/USER-GUIDE.md#escaneo-de-códigos)  
→ Soporta EAN-13, detecta automáticamente

### "App no funciona offline"
→ [USER-GUIDE.md - Funcionamiento Offline](docs/USER-GUIDE.md#funcionamiento-offline)  
→ Funciona 100% sin internet, sincroniza cuando conecta

### "Cómo aprobar sesión de conteo"
→ [SUPERVISOR-GUIDE.md - Aprobación y Envío a ERP](docs/SUPERVISOR-GUIDE.md#aprobación-y-envío-a-erp)  
→ Revisar diferencias, click "Aprobar y Enviar a ERP"

### "Qué significa esta diferencia"
→ [SUPERVISOR-GUIDE.md - Análisis de Diferencias](docs/SUPERVISOR-GUIDE.md#análisis-de-diferencias)  
→ Verde (<10%), Rojo (>10%) = requiere reconteo

### "Cómo iniciar con Docker"
→ [DOCKER-QUICKSTART.md](DOCKER-QUICKSTART.md)  
→ `docker-compose up -d` → Esperar 2-3 min

### "Tengo pocos recursos"
→ [DOCKER-RESOURCES-GUIDE.md](DOCKER-RESOURCES-GUIDE.md)  
→ Ejecutar por capas, optimización, 1.5GB total

### "Cómo hacer cambios en el código"
→ [README.md - Inicio Rápido](README.md#-inicio-rápido) (Opción 2: Desarrollo Local)  
→ Ejecutar cada servicio en terminal separada

### "Cómo ejecutar tests"
→ [README.md - Testing](README.md#-testing)  
→ `npm run test` (unitarios), `npm run test:e2e` (E2E)

### "Arquitectura del sistema"
→ [README.md - Arquitectura](README.md#-arquitectura)  
→ Diagrama de microservicios + dataflow

---

## ✅ Checklist de Lectura

### Para Operadores
- [ ] Leer [USER-GUIDE.md](docs/USER-GUIDE.md)
- [ ] Practicar escaneo de código
- [ ] Probar funcionamiento offline
- [ ] Hacer 1 conteo completo

### Para Supervisores
- [ ] Leer [SUPERVISOR-GUIDE.md](docs/SUPERVISOR-GUIDE.md)
- [ ] Ver panel de sesiones
- [ ] Revisar diferencias
- [ ] Aprobar 1 sesión

### Para Desarrolladores
- [ ] Leer [README.md](README.md)
- [ ] Levantar env local
- [ ] Hacer cambio pequeño
- [ ] Ejecutar tests
- [ ] Commit a git

### Para DevOps
- [ ] Leer [DOCKER-QUICKSTART.md](DOCKER-QUICKSTART.md)
- [ ] Leer [DOCKER-RESOURCES-GUIDE.md](DOCKER-RESOURCES-GUIDE.md)
- [ ] Levantar con `docker-compose up -d`
- [ ] Verificar todos los servicios
- [ ] Ver logs y recursos

---

## 🔗 Links Rápidos

**Inicio Rápido:** [DOCKER-QUICKSTART.md](DOCKER-QUICKSTART.md)  
**README Principal:** [README.md](README.md)  
**Guía Operador:** [docs/USER-GUIDE.md](docs/USER-GUIDE.md)  
**Guía Supervisor:** [docs/SUPERVISOR-GUIDE.md](docs/SUPERVISOR-GUIDE.md)  
**Optimización Recursos:** [DOCKER-RESOURCES-GUIDE.md](DOCKER-RESOURCES-GUIDE.md)  
**Fases de Desarrollo:** [FASE-9-COMPLETADA.md](FASE-9-COMPLETADA.md)  

---

## 📞 Contacto

**Preguntas?** billcastillo99@gmail.com  
**Bugs?** GitHub Issues  
**Sugerencias?** billcastillo99@gmail.com

---

**¡Selecciona tu rol arriba y empieza!** 🚀

[👤 Operador](docs/USER-GUIDE.md) | [👨‍💼 Supervisor](docs/SUPERVISOR-GUIDE.md) | [💻 Desarrollador](README.md) | [🐳 DevOps](DOCKER-QUICKSTART.md)
