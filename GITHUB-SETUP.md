# 📤 Guía: Subir a GitHub

**Versión:** 1.0.0  
**Fecha:** 2026-10-02

---

## 🚀 Paso 1: Preparar Proyecto Localmente

### Verificar archivos importantes
```bash
# Estos archivos deben existir:
ls -la README.md LICENSE CONTRIBUTING.md SECURITY.md CHANGELOG.md .gitignore
```

### Verificar seguridad
```bash
# Verificar que .env NO está versionado
ls -la .env  # Debe dar error
```

### Ejecutar script de preparación
```bash
# En macOS/Linux:
chmod +x prepare-github.sh
./prepare-github.sh

# En Windows (PowerShell):
# Simplemente verificar manualmente
```

---

## 🔧 Paso 2: Configurar Git

### Configuración global (si es primera vez)
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### Verificar configuración
```bash
git config user.name
git config user.email
```

---

## 💾 Paso 3: Inicializar Repositorio Local

### Si es la primera vez
```bash
cd 05-app-conteo-inventario
git init
git add .
git commit -m "feat: initial commit - Inventory Count PWA v1.0"
```

### Si ya existe repositorio
```bash
# Ver estado actual
git status

# Agregar archivos no versionados
git add .

# Commit si hay cambios
git commit -m "chore: prepare for github upload"
```

---

## 🌐 Paso 4: Crear Repositorio en GitHub

1. **Ir a GitHub:** https://github.com/new

2. **Llenar formulario:**
   - Repository name: `inventory-count-pwa`
   - Description: `📦 System for warehouse inventory counting with offline-first PWA`
   - Visibility: `Public` (para open-source) o `Private`
   - ❌ NO inicialices con README (ya tenemos)
   - ❌ NO agregues .gitignore (ya tenemos)
   - ❌ NO agregues licencia (ya tenemos LICENSE)

3. **Click "Create repository"**

4. **Copiar URL:**
   ```
   https://github.com/tu-usuario/inventory-count-pwa.git
   ```

---

## 🔗 Paso 5: Conectar Repositorio Local a GitHub

### Agregar remote
```bash
git remote add origin https://github.com/tu-usuario/inventory-count-pwa.git
```

### Verificar remote
```bash
git remote -v
# Debe mostrar:
# origin    https://github.com/tu-usuario/inventory-count-pwa.git (fetch)
# origin    https://github.com/tu-usuario/inventory-count-pwa.git (push)
```

---

## ⬆️ Paso 6: Push a GitHub

### Renombrar rama a main (si es necesario)
```bash
git branch -M main
```

### Push con seguimiento
```bash
git push -u origin main
```

### Verificar en GitHub
- Abre https://github.com/tu-usuario/inventory-count-pwa
- Deberías ver los archivos

---

## 🛡️ Paso 7: Configurar Protección de Rama (Recomendado)

### En GitHub:

1. **Settings → Branches**
2. **Add rule** bajo "Branch protection rules"
3. **Branch name pattern:** `main`
4. Habilitar:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Include administrators
5. **Create**

---

## 📝 Paso 8: Configurar Detalles del Repositorio

### En GitHub Settings:

1. **Settings → General**
   - ✅ Verify el nombre y descripción
   - ✅ Add topics: `inventory`, `pwa`, `react`, `nodejs`, `offline-first`

2. **Settings → Collaborators**
   - Agregar colaboradores si es necesario

3. **Settings → Secrets and Variables → Actions**
   - Agregar variables de CI/CD (si se usan)

4. **About → Description**
   - Ir a la pestaña "About"
   - Click el ícono de engranaje
   - Agregar:
     - Description: "System for warehouse inventory counting"
     - Website: opcional
     - Topics: inventory, pwa, react, nodejs

---

## ✅ Verificar Estructura Final

```
https://github.com/tu-usuario/inventory-count-pwa/
├── 📄 README.md
├── 📄 LICENSE (MIT)
├── 📄 CONTRIBUTING.md
├── 📄 SECURITY.md
├── 📄 CHANGELOG.md
├── 📄 .gitignore
├── 📁 apps/
│   ├── auth-service/
│   ├── inventory-service/
│   ├── counting-service/
│   ├── erp-gateway/
│   ├── erp-mock/
│   ├── api-gateway/
│   └── web/
├── 📁 docs/
│   ├── USER-GUIDE.md
│   ├── SUPERVISOR-GUIDE.md
│   └── (otros)
└── 📁 .github/
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.md
    │   └── feature_request.md
    └── PULL_REQUEST_TEMPLATE.md
```

---

## 🔄 Flujo de Trabajo Futuro

### Hacer cambios locales
```bash
git checkout -b feature/nueva-funcionalidad
# ... haz cambios ...
git add .
git commit -m "feat: descripción del cambio"
git push -u origin feature/nueva-funcionalidad
```

### Crear Pull Request en GitHub
1. GitHub te mostrará "Compare & pull request"
2. Llena el formulario usando la plantilla
3. Click "Create pull request"
4. Espera revisión
5. Merge cuando esté aprobado

### Actualizar rama main después de merge
```bash
git checkout main
git pull origin main
```

---

## 📊 Acciones de GitHub Recomendadas

Crear `.github/workflows/ci.yml` para CI/CD:

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install
      - run: npm run test
      - run: npm run test:coverage
```

---

## 🎯 Checklist Final

- [ ] Repositorio creado en GitHub
- [ ] Local git conectado a GitHub
- [ ] Main branch tiene todos los archivos
- [ ] .env NO está en el repositorio
- [ ] No hay secretos en el código
- [ ] README.md es visible en GitHub
- [ ] LICENSE es MIT
- [ ] CONTRIBUTING.md aparece en GitHub
- [ ] Branch protection configurada
- [ ] README badges/topics agregados
- [ ] Primer push exitoso

---

## 📞 Ayuda

### Error: "Permission denied (publickey)"
```bash
# Necesitas configurar SSH key
ssh-keygen -t ed25519 -C "tu@email.com"
# Luego agregar a GitHub Settings → SSH and GPG keys
```

### Error: "fatal: refusing to merge unrelated histories"
```bash
git pull origin main --allow-unrelated-histories
```

### Cambiar URL del remote
```bash
git remote set-url origin https://github.com/tu-usuario/nuevo-repo.git
```

---

## 🎉 ¡Listo!

Tu proyecto está en GitHub. Ahora puedes:
- ✅ Compartir el link
- ✅ Colaborar con otros
- ✅ Usar GitHub Issues y PR
- ✅ Configurar CI/CD
- ✅ Automations

**Link final:**
```
https://github.com/tu-usuario/inventory-count-pwa
```

---

**¡Felicitaciones por publicar tu proyecto!** 🚀
