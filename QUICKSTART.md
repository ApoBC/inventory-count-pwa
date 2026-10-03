# 🚀 Quickstart: Proyecto 05

Guía para empezar en 30 minutos.

## Requisitos

```bash
# Versiones mínimas
node --version   # v20.0.0+
pnpm --version   # v8.0.0+
docker --version # 24.0.0+
```

## Paso 1: Instalación (5 min)

```bash
cd "05-app-conteo-inventario"

# Instalar dependencias
pnpm install
```

## Paso 2: Levantar infraestructura (2 min)

```bash
# Terminal 1: Docker Compose
pnpm compose:up

# Espera hasta que veas:
# postgres is ready
# redis is ready
```

## Paso 3: Inicializar bases de datos (5 min)

```bash
# Terminal 2 (en raíz del proyecto)
pnpm db:migrate
pnpm db:seed

# Esto crea tablas y usuarios de prueba:
# - OP001 (operario)
# - OP002 (operario)
# - SV001 (supervisor)
# Password: pass123 (cambiar en producción)
```

## Paso 4: Levantar servicios (8 min)

```bash
# Terminal 3 (en raíz del proyecto)
pnpm dev

# Espera a ver:
# ✓ auth-service listening on 3001
# ✓ inventory-service listening on 3002
# ✓ counting-service listening on 3003
# ✓ erp-mock listening on 3005
# ✓ erp-gateway listening on 3004
# ✓ api-gateway listening on 3000
# ✓ web listening on 5173
```

## Paso 5: Acceder a la app

```bash
# Frontend
http://localhost:5173

# Credenciales de prueba
Usuario: OP001
Contraseña: pass123
Rol: Operario

# O supervisor:
Usuario: SV001
Contraseña: pass123
Rol: Supervisor
```

## Paso 6: Probar flujo (5 min)

### Como Operario

1. Login con `OP001` / `pass123`
2. Click "Iniciar escaneo"
3. Escanea código (o ingresa manualmente: `8718053433147`)
4. Ingresa cantidad: `95`
5. Click "Guardar"
6. Repite 5 veces más
7. Click "Enviar sesión"

### Como Supervisor

1. Logout
2. Login con `SV001` / `pass123`
3. Click "Ver sesiones"
4. Selecciona sesión del operario
5. Revisa diferencias (theoretical vs counted)
6. Click "Aprobar y enviar al ERP"
7. Ves confirmación: "Diario enviado: JRN-2026-001"

## Verificar estados

```bash
# ¿Servicios levantados?
curl http://localhost:3000/health
# Response: { "status": "ok" }

# ¿BD conectada?
curl -H "Authorization: Bearer <token>" http://localhost:3001/auth/me

# ¿ERP Mock respondiendo?
curl http://localhost:3005/data/Products
# Response: { "value": [...] }

# ¿Logs?
pnpm compose:logs
# Ver logs en tiempo real
```

## Prueba offline

```bash
# En el navegador (DevTools → Application → Network)
1. Selecciona "Offline"
2. Escanea códigos
3. Ingresa cantidades
4. Selecciona "Online"
5. Los conteos se sincronizan automáticamente
```

## Comandos útiles

```bash
# Desarrollo
pnpm dev              # Todos los servicios
pnpm dev:web          # Solo frontend (para cambios rápidos)

# Testing
pnpm test             # Todos los tests
pnpm test:coverage    # Coverage report
pnpm test -- --watch  # Watch mode

# Linting
pnpm lint             # ESLint
pnpm format           # Prettier

# Base de datos
pnpm db:migrate       # Ejecutar migraciones
pnpm db:seed          # Seed datos
pnpm db:reset         # Reset BD (⚠️ borra todo)

# Docker
pnpm compose:up       # Levantar
pnpm compose:down     # Bajar
pnpm compose:logs     # Ver logs

# Build para producción
pnpm build            # Build todos los servicios
docker build apps/web -t inventory-count-web:latest
```

## 🔴 Troubleshooting

### "Port 3000 already in use"
```bash
# Buscar y matar proceso
lsof -i :3000
kill -9 <PID>

# O cambiar puerto en .env
API_GATEWAY_PORT=3001
```

### "PostgreSQL connection refused"
```bash
# Verificar Docker
docker ps | grep postgres

# Logs
docker logs inventory-count-postgres

# Reiniciar
pnpm compose:down
pnpm compose:up
```

### "pnpm ERR! Cannot find module"
```bash
pnpm install --force
pnpm exec nx reset
```

### "Camera not working"
```bash
# Necesita HTTPS en producción
# En desarrollo:
# 1. Usar localhost o 127.0.0.1 (http es suficiente)
# 2. Para red local: usar mkcert

mkcert localhost 127.0.0.1
# Seguir instrucciones en nginx.conf
```

### "Sync queue no sincroniza"
```bash
# Verificar que counting-service está corriendo
curl http://localhost:3003/health

# Revisar logs
pnpm compose:logs | grep counting-service

# En DevTools → Application → IndexedDB
# Ver tabla "counts" con synced: false/true
```

## 📊 Estructura esperada tras `pnpm dev`

```
http://localhost:3000   ← API Gateway (entrada)
  ├── :3001/auth/*      ← Auth Service
  ├── :3002/items/*     ← Inventory Service
  ├── :3003/sessions/*  ← Counting Service
  ├── :3004/...         ← ERP Gateway
  └── :3005/data/*      ← ERP Mock

http://localhost:5173   ← Frontend (React + Vite)
http://localhost:5432   ← PostgreSQL
http://localhost:6379   ← Redis
```

## 🎬 Video Demo

Para grabar demo con Loom/OBS:

1. Coloca celular cerca (o usa emulador)
2. Abre http://localhost:5173 en navegador
3. Grabar:
   - Login
   - Escanear 5 códigos
   - Desactivar WiFi → escanear 3 más
   - Activar WiFi → ver sync
   - Logout + login como supervisor
   - Revisar diferencias
   - Aprobar y ver confirmación

## 📝 Próximos pasos

- [ ] Leer [MODULOS.md](./MODULOS.md) para entender cada módulo
- [ ] Leer [docs/arquitectura.md](./docs/arquitectura.md) para arquitectura
- [ ] Implementar etapa 1: [ERP Mock & Gateway](./MODULOS.md#fase-1-erp-mock--gateway-1-día)
- [ ] Hacer push a GitHub
- [ ] Grabar video demo

## 📞 Contacto

**Autor:** Bill Castillo  
**Email:** billcastillo99@gmail.com  
**GitHub:** https://github.com/tu-usuario/05-app-conteo-inventario

---

**¡Listo! Ahora tienes el proyecto corriendo. Siguiente paso: leer [MODULOS.md](./MODULOS.md) para implementar cada servicio.** ✨
