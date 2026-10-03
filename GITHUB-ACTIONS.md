# 🤖 GitHub Actions - CI/CD Pipeline

**Documentación de Workflows Automáticos**

---

## 📋 Tabla de Contenidos

1. [Workflows Disponibles](#workflows-disponibles)
2. [Configuración Requerida](#configuración-requerida)
3. [Cómo Funcionan](#cómo-funcionan)
4. [Troubleshooting](#troubleshooting)
5. [Estadísticas](#estadísticas)

---

## 🔄 Workflows Disponibles

### 1. **CI Pipeline** (`ci.yml`)
- **Disparo:** Push a `main`/`develop`, Pull Requests
- **Duración:** ~10-15 minutos
- **Jobs:**
  - Lint & Type Check
  - Unit Tests (80%+ coverage)
  - Build
  - E2E Tests
  - Security Check
  - Resumen final

**Status Badge:**
```markdown
![CI Pipeline](https://github.com/ApoBC/inventory-count-pwa/workflows/CI%20Pipeline/badge.svg)
```

---

### 2. **Unit Tests** (`tests.yml`)
- **Disparo:** Cada push/PR
- **Duración:** ~3-5 minutos
- **Acciones:**
  - Instala dependencias
  - Ejecuta tests con Vitest
  - Genera coverage report
  - Sube a Codecov
  - Comenta en PR

**Coverage Badge:**
```markdown
[![codecov](https://codecov.io/gh/ApoBC/inventory-count-pwa/branch/main/graph/badge.svg)](https://codecov.io/gh/ApoBC/inventory-count-pwa)
```

---

### 3. **E2E Tests** (`e2e.yml`)
- **Disparo:** Cada push/PR
- **Duración:** ~5-10 minutos
- **Navegadores:** Chromium, Firefox, WebKit
- **Acciones:**
  - Instala Playwright
  - Ejecuta tests
  - Sube report
  - Comenta resultados en PR

---

### 4. **Linting** (`lint.yml`)
- **Disparo:** Cada push/PR
- **Duración:** ~2-3 minutos
- **Checks:**
  - ESLint
  - TypeScript type checking
  - Console.log detection
  - TODO/FIXME comments

---

### 5. **Build** (`build.yml`)
- **Disparo:** Cada push/PR
- **Duración:** ~2-3 minutos
- **Acciones:**
  - Compila con Vite
  - Verifica dist/
  - Calcula bundle size
  - Sube artifact

---

### 6. **Deploy** (`deploy.yml`)
- **Disparo:** Push a `main`, Tags `v*`, Manual
- **Duración:** ~5-10 minutos
- **Ambientes:**
  - `main` → Staging
  - `v*.*.*` → Production
- **Acciones:**
  - Build + Test
  - Deploy a Vercel
  - Crea Release
  - Notifica Slack

---

## ⚙️ Configuración Requerida

### 1. GitHub Secrets (Settings → Secrets)

Para el workflow de Deploy, necesitas:

```
VERCEL_TOKEN         # Token de Vercel (deploy)
SLACK_WEBHOOK        # Webhook de Slack (notificaciones)
```

### Cómo Obtener Estos Secrets:

#### **VERCEL_TOKEN**
1. Ir a https://vercel.com/account/tokens
2. Crear nuevo token
3. Copiar en GitHub Settings → Secrets

#### **SLACK_WEBHOOK**
1. Crear Slack App: https://api.slack.com/apps
2. Habilitar Incoming Webhooks
3. Crear webhook para tu canal
4. Copiar en GitHub Settings → Secrets

### 2. Branch Protection (Settings → Branches)

Crear regla en `main`:

```
✅ Require a pull request before merging
✅ Require status checks to pass before merging
✅ Require branches to be up to date
✅ Dismiss stale pull request approvals
✅ Include administrators
```

Status checks requeridos:
- `lint`
- `test`
- `build`

---

## 📊 Cómo Funcionan

### Flujo en Pull Request

```
1. Usuario crea PR
   ↓
2. Trigger: CI Pipeline inicia
   ├─ Job 1: Lint & Type Check (paralelo)
   ├─ Job 2: Tests (requiere Job 1)
   ├─ Job 3: Build (requiere Job 2)
   ├─ Job 4: E2E (requiere Job 3)
   └─ Job 5: Security (paralelo)
   ↓
3. Todos los jobs completan
   ↓
4. GitHub comenta resultados en PR
   ↓
5. Si todo ✅ → PR puede mergearse
6. Si algo ❌ → Usuario debe arreglar
```

### Flujo de Merge a Main

```
1. PR mergeada a main
   ↓
2. Trigger: CI Pipeline inicia (igual que arriba)
   ↓
3. Si TODO ✅:
   - Deploy automático a Staging (Vercel)
   - Notificación a Slack
   ↓
4. Si algo ❌:
   - Notificación a Slack
   - CI fallido
```

### Flujo de Release

```
1. Crear tag: git tag v1.0.0
   git push origin v1.0.0
   ↓
2. Trigger: Deploy workflow inicia
   ↓
3. Si TODO ✅:
   - Build + Test
   - Deploy a Production (Vercel)
   - Crea Release en GitHub
   - Notificación a Slack
   ↓
4. Release visible en GitHub
   - Tag con notas
   - Download zip/tar
```

---

## 🔍 Monitoreo

### Ver Estado en GitHub

1. **Actions Tab:** https://github.com/ApoBC/inventory-count-pwa/actions
2. **PR Checks:** Aparecen en el PR (✅ o ❌)
3. **Badge:** Muestra estado de main

### Ver Detalles de Fallo

1. Click en workflow fallido
2. Click en job que falló
3. Ver logs detallados

### Badges en README

```markdown
[![CI Pipeline](https://github.com/ApoBC/inventory-count-pwa/workflows/CI%20Pipeline/badge.svg)](https://github.com/ApoBC/inventory-count-pwa/actions)
[![codecov](https://codecov.io/gh/ApoBC/inventory-count-pwa/branch/main/graph/badge.svg)](https://codecov.io/gh/ApoBC/inventory-count-pwa)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](package.json)
```

---

## 🐛 Troubleshooting

### CI Fallido: "npm install failed"

**Causa:** Dependencias no instaladas  
**Solución:**
```bash
npm ci
npm install
git commit -m "chore: update lock file"
git push
```

---

### CI Fallido: "Tests failed"

**Causa:** Tests no pasan  
**Solución:**
```bash
# Ejecutar localmente
npm run test -- --run

# Ver qué falla
npm run test:coverage

# Arreglar y push
git commit -m "fix: failing tests"
git push
```

---

### CI Fallido: "Type check failed"

**Causa:** Errores de TypeScript  
**Solución:**
```bash
# Verificar localmente
npx tsc --noEmit

# Arreglar tipos
# git push
```

---

### E2E Tests Timeout

**Causa:** Tests tardan demasiado  
**Solución:**
```
Aumentar timeout en .github/workflows/e2e.yml:
timeout-minutes: 30 → 45
```

---

### Deploy Fallido: "Vercel token invalid"

**Causa:** Secret no configurado  
**Solución:**
1. Ir a Settings → Secrets
2. Crear `VERCEL_TOKEN` correcto
3. Reintentar workflow

---

## 📊 Estadísticas

### Tiempo Promedio por Workflow

| Workflow | Tiempo |
|----------|--------|
| Lint | 2-3 min |
| Tests | 3-5 min |
| Build | 2-3 min |
| E2E | 5-10 min |
| Deploy | 5-10 min |
| **Total CI** | **10-15 min** |

### Recursos por Job

| Job | CPU | Memory |
|-----|-----|--------|
| Lint | 1 core | 2GB |
| Tests | 1 core | 2GB |
| Build | 1 core | 2GB |
| E2E | 2 cores | 4GB |
| Deploy | 1 core | 2GB |

### Costo Mensual (GitHub Actions)

- **Runs por mes:** ~20 (asumiendo 2-3 por día)
- **Tiempo total:** ~300 minutos
- **Costo:** Gratis (2000 min/mes incluido)

---

## ✅ Checklist de Configuración

- [ ] Crear `VERCEL_TOKEN` en GitHub Secrets
- [ ] Crear `SLACK_WEBHOOK` en GitHub Secrets
- [ ] Configurar branch protection en main
- [ ] Agregar badges en README.md
- [ ] Verificar que workflows corren en PRs
- [ ] Verificar que Deploy funciona en main
- [ ] Probar workflow en ambiente staging

---

## 🔗 Links Útiles

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Codecov](https://codecov.io/)
- [Slack API](https://api.slack.com)

---

## 📝 Próximos Pasos

1. ✅ Configurar secrets
2. ✅ Esperar a que corran workflows en el próximo PR
3. ✅ Ver resultados en PR checks
4. ✅ Iterar según feedback

---

**¡Tu CI/CD pipeline está configurado!** 🚀

Ver workflows en: https://github.com/ApoBC/inventory-count-pwa/actions
