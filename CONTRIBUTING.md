# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a Inventory Count PWA! Este documento te guiará a través del proceso.

---

## 📋 Tabla de Contenidos

- [Code of Conduct](#code-of-conduct)
- [¿Cómo Contribuir?](#cómo-contribuir)
- [Setup para Desarrollo](#setup-para-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reporte de Bugs](#reporte-de-bugs)

---

## Code of Conduct

### Nuestro Compromiso

En el interés de fomentar un ambiente abierto y acogedor, nosotros, como colaboradores y mantenedores, nos comprometemos a hacer que la participación en nuestro proyecto y nuestra comunidad sea una experiencia libre de acoso.

### Nuestros Estándares

Ejemplos de comportamiento que contribuyen a crear un ambiente positivo:

- Usar lenguaje acogedor e inclusivo
- Ser respetuoso con los puntos de vista y experiencias divergentes
- Aceptar críticas constructivas
- Enfocarse en lo que es mejor para la comunidad
- Mostrar empatía hacia otros miembros de la comunidad

---

## ¿Cómo Contribuir?

### Reportar Bugs

**Antes de crear un reporte de bug:**
- Verifica si el bug ya fue reportado
- Intenta reproducir el bug en la versión más reciente
- Recopila información detallada

**Al reportar un bug, incluye:**
- Título claro y descriptivo
- Descripción exacta del problema
- Pasos para reproducir
- Comportamiento observado
- Comportamiento esperado
- Screenshots/videos si es aplicable
- Tu entorno (OS, navegador, Node version)

### Sugerir Mejoras

**Antes de sugerir mejoras:**
- Verifica si la mejora ya fue sugerida
- Asegúrate que sea alcanzable

**Al sugerir, incluye:**
- Título claro y descriptivo
- Descripción detallada de la mejora
- Ejemplos de cómo funcionaría
- Por qué sería beneficioso

### Pull Requests

**Proceso:**

1. **Fork el repositorio** y crea una rama desde `main`
   ```bash
   git checkout -b feature/nombre-feature
   ```

2. **Desarrolla tu cambio**
   - Sigue [Estándares de Código](#estándares-de-código)
   - Haz commits pequeños y descriptivos
   - Escribe o actualiza tests

3. **Prueba localmente**
   ```bash
   npm run test              # Tests unitarios
   npm run test:e2e         # Tests E2E
   npm run test:coverage    # Coverage
   ```

4. **Push a tu fork**
   ```bash
   git push origin feature/nombre-feature
   ```

5. **Abre un Pull Request**
   - Título descriptivo
   - Descripción clara del cambio
   - Link a issues relacionados
   - Screenshots si es UI

6. **Responde a feedback**
   - Los revisores pueden sugerir cambios
   - Actualiza el PR con los cambios

---

## Setup para Desarrollo

### Requisitos

- Node.js 20+
- PostgreSQL 16
- Redis 7
- Docker (opcional pero recomendado)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/inventory-count-pwa.git
cd inventory-count-pwa

# Crear .env
cp .env.example .env

# Opción 1: Con Docker
docker-compose -f docker-compose.dev.yml up -d

# Opción 2: Sin Docker
# Instala PostgreSQL y Redis localmente
# Luego ejecuta cada servicio:
cd apps/auth-service && npm install && npm run dev
# (repetir para otros servicios)
```

### Testing

```bash
# Unitarios
npm run test --workspace=web

# E2E
npm run test:e2e --workspace=web

# Coverage
npm run test:coverage --workspace=web
```

---

## Estándares de Código

### TypeScript
- Use tipos explícitos en APIs públicas
- Evite `any`
- Use `unknown` para valores no confiables

### Naming
- Variables/funciones: `camelCase`
- Tipos/interfaces: `PascalCase`
- Constantes: `UPPER_SNAKE_CASE`

### Immutability
- Nunca mute objetos existentes
- Cree nuevos objetos con cambios

### Errores
- Maneje errores explícitamente
- Proporcione mensajes útiles
- Use try-catch para async/await

### Tests
- Escriba tests ANTES del código (TDD)
- Mínimo 80% coverage
- Use pattern Arrange-Act-Assert

### Commits
```
type: descripción corta

descripción larga si es necesario

Fixes #123
```

Tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `perf`

---

## Proceso de Pull Request

### Antes de Enviar

- [ ] Código sigue estándares del proyecto
- [ ] Tests pasan (`npm run test`)
- [ ] Coverage >= 80%
- [ ] Documentación actualizada
- [ ] No hay console.log o debug
- [ ] Sin hardcoded secrets
- [ ] Rebase en main

### Revisión

Un mantenedor:
1. Revisará el código
2. Ejecutará tests
3. Verificará cobertura
4. Pedirá cambios si es necesario
5. Mergeará cuando esté listo

### Después de Merge

- Tu rama será eliminada
- Tu PR cerrará automáticamente
- ¡Aparecerás en los contribuidores!

---

## Reporte de Bugs

### Donde Reportar

- GitHub Issues: Para bugs de código
- Discussions: Para preguntas generales
- Email: billcastillo99@gmail.com (security)

### Información a Incluir

```markdown
## Descripción
[Descripción clara del bug]

## Pasos para Reproducir
1. Ir a '...'
2. Hacer clic en '...'
3. Ver error

## Comportamiento Esperado
[Qué debería pasar]

## Comportamiento Observado
[Qué pasó realmente]

## Entorno
- OS: [e.g., Windows 11]
- Navegador: [e.g., Chrome 120]
- Node: [e.g., 20.10.0]

## Screenshots
[Si aplica]
```

---

## Preguntas

- Documentación: Ver [README.md](README.md)
- Setup: Ver [INICIO-RAPIDO.md](INICIO-RAPIDO.md)
- Guías: Ver [DOCUMENTACION-INDICE.md](DOCUMENTACION-INDICE.md)
- Email: billcastillo99@gmail.com

---

## 📜 Licencia

Al contribuir, aceptas que tus contribuciones sean licenciadas bajo [MIT License](LICENSE).

---

**¡Gracias por contribuir!** ❤️
