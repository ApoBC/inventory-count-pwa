# 🚀 Docker Quick Start

**Tiempo de setup:** 3-5 minutos  
**Requisitos:** Docker Desktop + 1.5GB RAM libre

## 📥 Instalación Inicial (Primera Vez)

### 1. Verificar Docker

```bash
docker --version      # v24+
docker-compose --version  # v2.20+
```

Si no está instalado:
- **Windows/Mac:** Descargar [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux:** `sudo apt-get install docker.io docker-compose`

### 2. Clonar o Descargar el Proyecto

```bash
cd "C:\xampp\htdocs\Proyectos de ERP con react\05-app-conteo-inventario"
```

### 3. Crear .env desde el ejemplo

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Opcional: Editar `.env` si quieres cambiar contraseñas (dev = OK dejar por defecto)

---

## 🎯 OPCIÓN 1: Todo en 1 Comando (Recomendado)

```bash
docker-compose up -d
```

**Esto hace:**
✅ Descarga imágenes (primera vez: ~2 min)  
✅ Compila servicios (primera vez: ~3 min)  
✅ Inicia 9 contenedores  
✅ Crea volúmenes para BD y cache  

**Esperar 1-2 minutos** hasta que todos estén "healthy"

**Verificar:**
```bash
docker-compose ps
```

Output esperado:
```
NAME                   STATUS
inventory-postgres    running (healthy)
inventory-redis       running (healthy)
inventory-auth-service    running
inventory-service     running
inventory-counting-service    running
inventory-erp-gateway     running
inventory-erp-mock    running
inventory-api-gateway     running
inventory-web         running
```

---

## 🎯 OPCIÓN 2: Por Capas (Si RAM <2GB)

**Capa 1: Base de datos + Cache**
```bash
docker-compose up -d postgres redis
docker-compose ps  # Esperar "healthy"
```

**Capa 2: Backend Services**
```bash
docker-compose up -d auth-service inventory-service counting-service
docker-compose ps
```

**Capa 3: Gateways**
```bash
docker-compose up -d erp-mock erp-gateway api-gateway
docker-compose ps
```

**Capa 4: Frontend**
```bash
docker-compose up -d web
docker-compose ps
```

---

## 🌐 Acceso a Aplicaciones

### Frontend
```
http://localhost:5173
```
→ Inventory Count App (PWA)

### Backend APIs
```
http://localhost:3000/health  → API Gateway
```

### Bases de Datos

**PostgreSQL:**
```bash
# Conectar desde terminal
docker exec -it inventory-postgres psql -U counting -d counting_dev

# Queries útiles:
\dt                    # Ver tablas
SELECT COUNT(*) FROM users;
```

**Redis:**
```bash
docker exec -it inventory-redis redis-cli
> PING
> KEYS *
```

---

## 🔧 Comandos Útiles

### Ver Logs
```bash
# Todos los servicios
docker-compose logs

# Un servicio específico
docker-compose logs -f api-gateway

# Últimas 50 líneas, con follow
docker-compose logs -f --tail=50 auth-service
```

### Detener y Reiniciar
```bash
# Pausar (sin borrar datos)
docker-compose stop

# Reanudar
docker-compose start

# Reiniciar un servicio
docker-compose restart api-gateway

# Recrear un servicio (borra + crea)
docker-compose up -d --force-recreate auth-service
```

### Limpiar

⚠️ **Destructivo** (borra datos):
```bash
# Detener + eliminar volúmenes
docker-compose down -v

# Limpiar imágenes sin usar
docker image prune -a

# Limpiar TODO (¡ADVERTENCIA!)
docker system prune -a --volumes
```

### Monitoreo

```bash
# Ver CPU/RAM en tiempo real
docker stats

# Ver uso de disco
docker system df
```

---

## 🐛 Troubleshooting

### ❌ "docker: command not found"
→ Instalar Docker Desktop o reiniciar terminal

### ❌ "Port 3000 already in use"
```bash
# Cambiar puerto en docker-compose.yml
# O terminar el proceso:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### ❌ "Out of memory"
→ Usar Opción 2 (por capas)
→ Cerrar otras aplicaciones
→ Aumentar RAM asignada a Docker

### ❌ "PostgreSQL won't start"
```bash
docker-compose down -v
docker-compose up -d postgres
sleep 20
docker-compose logs postgres
```

### ❌ "Web app no carga en navegador"
```bash
# Verificar que está corriendo
docker-compose ps web

# Ver logs
docker-compose logs -f web

# Si está running pero no abre, esperar 10s más
```

---

## 📊 Performance Esperado

| Acción | Tiempo |
|--------|--------|
| Primera ejecución (pull + build) | 5-10 min |
| Siguientes ejecuciones (docker-compose up) | 30-60s |
| Health checks completos | 2-3 min |
| Base de datos lista | 30s |
| Backend listo | 60s |
| Frontend listo | 90s |

---

## 🔐 Credenciales por Defecto

**Operadores:**
- Usuario: `OP001`, `OP002`, `OP003`
- Contraseña: `pass123`

**Supervisores:**
- Usuario: `SV001`, `SV002`
- Contraseña: `pass123`

**PostgreSQL:**
- Usuario: `counting`
- Contraseña: `secret` (cambiar en `.env`)
- DB: `counting_dev`

**Redis:**
- Puerto: `6379`
- Sin autenticación (desarrollo)

---

## 📚 Documentación Adicional

- **Recursos limitados?** Ver [DOCKER-RESOURCES-GUIDE.md](DOCKER-RESOURCES-GUIDE.md)
- **Configuración avanzada?** Ver [docker-compose.yml](docker-compose.yml)
- **Template Dockerfile?** Ver [Dockerfile.template](Dockerfile.template)

---

## ✅ Checklist Post-Setup

- [ ] Todos los contenedores muestran "running" en `docker-compose ps`
- [ ] Postgres y Redis muestran "healthy"
- [ ] Web abre en http://localhost:5173
- [ ] Puedo hacer login con OP001/pass123
- [ ] API Gateway responde en http://localhost:3000/health
- [ ] `docker stats` muestra uso <1.5GB total

---

**Listo! Tu app está ejecutándose en Docker.** 🎉

Próximo: FASE 8 continuación (CI/CD, Nginx, Producción)
