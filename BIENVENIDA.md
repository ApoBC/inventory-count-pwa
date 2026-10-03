# 🎉 ¡Bienvenida a Inventory Count PWA!

> Sistema completo de conteo de inventario offline-first con sincronización automática

**Versión:** 1.0 ✅ | **Fecha:** 2026-10-02  
**Estado:** Listo para usar | **Última actualización:** 2026-10-02

---

## 🚀 Comienza en 2 Minutos

### Opción 1: Docker (Recomendado)

```bash
# Clonar o descargar
cd 05-app-conteo-inventario

# Crear configuración
cp .env.example .env

# Ejecutar
docker-compose up -d

# Esperar 2-3 minutos...
open http://localhost:5173
```

**Credenciales:**
- 👤 Operador: `OP001` / `pass123`
- 👨‍💼 Supervisor: `SV001` / `pass123`

### Opción 2: Desarrollo Local

```bash
# Terminal 1: Auth Service
cd apps/auth-service && npm install && npm run dev

# Terminal 2: Inventory Service
cd apps/inventory-service && npm install && npm run dev

# Terminal 3: Counting Service
cd apps/counting-service && npm install && npm run dev

# (Repetir para erp-gateway, erp-mock, api-gateway)

# Terminal Final: Frontend
cd apps/web && npm install && npm run dev
# http://localhost:5173
```

---

## 📚 Documentación

### Necesito Ayuda Rápida

| Pregunta | Documento |
|----------|-----------|
| "¿Cómo uso la app?" | [USER-GUIDE.md](docs/USER-GUIDE.md) |
| "¿Cómo apruebo conteos?" | [SUPERVISOR-GUIDE.md](docs/SUPERVISOR-GUIDE.md) |
| "¿Cómo instalo con Docker?" | [DOCKER-QUICKSTART.md](DOCKER-QUICKSTART.md) |
| "¿Cómo desarrollo?" | [README.md](README.md) |
| "¿Tengo pocos recursos?" | [DOCKER-RESOURCES-GUIDE.md](DOCKER-RESOURCES-GUIDE.md) |

### Índice Completo

👉 **[DOCUMENTACION-INDICE.md](DOCUMENTACION-INDICE.md)** - Todos los documentos por rol

---

## 🎯 ¿Cuál es mi Rol?

### 👤 Soy Operador de Almacén
**Necesitas:** Cómo contar inventario

1. Abre http://localhost:5173
2. Login: `OP001` / `pass123`
3. Lee [USER-GUIDE.md](docs/USER-GUIDE.md)
4. ¡Empieza a escanear códigos!

**Qué puedes hacer:**
- Escanear códigos de barras
- Registrar cantidades
- Funciona offline
- Auto-sincronización

### 👨‍💼 Soy Supervisor
**Necesitas:** Cómo revisar y aprobar

1. Abre http://localhost:5173
2. Login: `SV001` / `pass123`
3. Lee [SUPERVISOR-GUIDE.md](docs/SUPERVISOR-GUIDE.md)
4. ¡Revisa las sesiones!

**Qué puedes hacer:**
- Ver sesiones de conteo
- Analizar diferencias
- Aprobar y enviar a ERP
- Generar reportes

### 💻 Soy Desarrollador
**Necesitas:** Entender y cambiar el código

1. Lee [README.md](README.md) (5 min)
2. Levanta con Docker o local
3. Haz cambios en cualquier servicio
4. Ejecuta tests: `npm run test`

**Tech Stack:**
- Backend: 6 microservicios Node.js
- Frontend: React 18 + Vite
- BD: PostgreSQL + Redis
- Tests: Vitest + Playwright
- Deploy: Docker + GitHub Actions (prep)

### 🐳 Soy DevOps
**Necesitas:** Deploy y infraestructura

1. Lee [DOCKER-QUICKSTART.md](DOCKER-QUICKSTART.md) (3 min)
2. Ejecuta: `docker-compose up -d`
3. Lee [DOCKER-RESOURCES-GUIDE.md](DOCKER-RESOURCES-GUIDE.md)
4. Configura prod según tu cloud

**Servicios:**
- 9 contenedores
- 1.5GB RAM total
- Alpine Linux (pequeño, seguro)
- Health checks integrados

---

## ✨ Características Principales

✅ **Escaneo de Código de Barras**
- Captura en tiempo real
- EAN-13 detection
- Feedback sonoro

✅ **Offline-First**
- Funciona sin internet
- IndexedDB local
- Sincronización automática

✅ **Panel de Supervisor**
- Análisis de diferencias
- Estadísticas
- Aprobación de sesiones

✅ **Seguridad**
- JWT authentication
- Bcrypt hashing
- ACID transactions

✅ **Testing**
- 80%+ coverage
- Unitarios + E2E

---

## 📊 Visión General

```
Operadores escanean        Supervisores revisan
en almacén (offline)       y aprueban (online)
        ↓                           ↓
    Cada 30s o manual         Análisis de datos
        ↓                           ↓
  Auto-sincronización       Envío a ERP
```

**Arquitectura:**
```
Frontend (React)
    ↓
API Gateway :3000
    ├─ Auth Service
    ├─ Inventory Service
    ├─ Counting Service
    └─ ERP Gateway
        ↓
    PostgreSQL + Redis
```

---

## 🔧 Configuración Básica

### Variables de Entorno

```bash
# Base
NODE_ENV=production
LOG_LEVEL=info

# Base de Datos
DB_USER=counting
DB_PASSWORD=change_me
DB_NAME=counting_dev

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

# Frontend API
VITE_API_URL=http://localhost:3000
```

Ver `.env.example` para más.

---

## 📊 Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Microservicios** | 6 |
| **Endpoints API** | 30+ |
| **Tests** | 20+ |
| **Code Coverage** | 80%+ |
| **Documentación** | 10+ archivos |
| **Lines of Code** | ~6,300 |
| **Setup Time** | <5 min (Docker) |
| **Development Time** | ~55 horas |

---

## 🎓 Tecnologías

**Backend:**
- Node.js 20 + Express
- TypeScript
- PostgreSQL + Prisma
- Redis

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Zustand (state)

**Testing:**
- Vitest
- Playwright
- 80%+ coverage

**DevOps:**
- Docker
- Docker Compose
- GitHub Actions (prep)

---

## 🐛 Troubleshooting Rápido

### "Docker no arranca"
```bash
docker system prune -a --volumes
docker-compose up -d
```

### "No puedo loguearme"
- Usuario: `OP001` o `SV001`
- Contraseña: `pass123`

### "App no funciona offline"
- Tienes permisos de IndexedDB?
- Ver [USER-GUIDE.md - Offline](docs/USER-GUIDE.md#funcionamiento-offline)

### "¿Más problemas?"
Ver [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) o contacta: billcastillo99@gmail.com

---

## ✅ Checklist de Bienvenida

- [ ] He leído esta página
- [ ] Levantado la app (Docker o local)
- [ ] Hecho login
- [ ] Leído el documento de mi rol
- [ ] Practicado las funciones básicas

---

## 📞 Soporte

- **Documentación:** [DOCUMENTACION-INDICE.md](DOCUMENTACION-INDICE.md)
- **Problemas:** [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
- **Contacto:** billcastillo99@gmail.com
- **Issues:** GitHub Issues (si es repo público)

---

## 🚀 Qué Sigue

### Hoy (5 min)
- [ ] Leer esta página
- [ ] Levantar con Docker
- [ ] Hacer login

### Esta Hora (15 min)
- [ ] Leer guía de tu rol
- [ ] Practicar funciones principales
- [ ] Hacer 1 tarea completa

### Hoy (1 hora)
- [ ] Sentirte cómodo con la app
- [ ] Hacer preguntas
- [ ] Reportar bugs

### Esta Semana
- [ ] Usar en producción
- [ ] Feedback al equipo
- [ ] Entrenar a otros

---

## 🎯 Próximos Features

### v1.1 (Roadmap)
- [ ] Exportar reportes Excel
- [ ] Fotos de productos
- [ ] Comentarios en diferencias
- [ ] Mobile app nativa (React Native)

### v2.0 (Futuro)
- [ ] Multi-idioma (ES, EN, PT)
- [ ] Deep learning OCR
- [ ] Real-time collaboration
- [ ] Predicción ML

---

## 📄 Archivos Importantes

```
Punto de Entrada:
├── README.md ........................ Visión general
├── BIENVENIDA.md .................... Esta página
├── DOCUMENTACION-INDICE.md .......... Índice por rol

Setup:
├── DOCKER-QUICKSTART.md ............ Docker en 5 min
├── DOCKER-RESOURCES-GUIDE.md ....... Recursos limitados
├── docker-compose.yml .............. Orquestación
├── .env.example .................... Configuración

Guías de Usuario:
├── docs/USER-GUIDE.md .............. Operadores
├── docs/SUPERVISOR-GUIDE.md ........ Supervisores

Documentación Técnica:
├── FASE-1-9-COMPLETADA.md .......... Desarrollo
├── docs/API-DOCS.md ................ API (plantilla)
├── docs/ARCHITECTURE.md ............ Diseño (plantilla)
```

---

## 💡 Tips Rápidos

1. **Escribe:** `docker-compose ps` para ver estado
2. **Ver logs:** `docker-compose logs -f api-gateway`
3. **Restart:** `docker-compose restart auth-service`
4. **Parar todo:** `docker-compose down`
5. **Limpiar volúmenes:** `docker-compose down -v`

---

## 🎉 ¡Estás Listo!

Tienes todo lo que necesitas para:
- ✅ Usar la app
- ✅ Desarrollar
- ✅ Desplegar
- ✅ Mantener

**Próximo paso:** Abre [DOCUMENTACION-INDICE.md](DOCUMENTACION-INDICE.md) o tu guía de rol específica.

---

**¡Bienvenida al proyecto!** 🚀

[📚 Documentación Completa](DOCUMENTACION-INDICE.md) | [💻 Desarrollador](README.md) | [🐳 Docker](DOCKER-QUICKSTART.md)

---

*Creado con ❤️ por Bill Castillo | 2026-10-02*
