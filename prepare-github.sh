#!/bin/bash

# 📤 Script de Preparación para GitHub
# Este script prepara el proyecto para subirlo a GitHub de forma segura

set -e

echo "📤 Preparando proyecto para GitHub..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "README.md" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

echo "✅ Estamos en la raíz del proyecto"
echo ""

# 1. Verificar git configurado
echo "🔧 Verificando git..."
if ! git config user.name > /dev/null 2>&1; then
    echo "⚠️  Git no está configurado. Configúralo con:"
    echo "   git config --global user.name 'Tu Nombre'"
    echo "   git config --global user.email 'tu@email.com'"
else
    echo "✅ Git configurado: $(git config user.name)"
fi
echo ""

# 2. Verificar .gitignore
echo "🔍 Verificando .gitignore..."
if [ -f ".gitignore" ]; then
    echo "✅ .gitignore existe"
    if grep -q "node_modules" .gitignore; then
        echo "✅ .gitignore contiene node_modules"
    fi
    if grep -q ".env" .gitignore; then
        echo "✅ .gitignore contiene .env"
    fi
else
    echo "❌ .gitignore no encontrado"
    exit 1
fi
echo ""

# 3. Verificar archivos importantes
echo "📋 Verificando archivos importantes..."
files=("README.md" "LICENSE" "CONTRIBUTING.md" "SECURITY.md" ".gitignore")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file existe"
    else
        echo "⚠️  $file no encontrado"
    fi
done
echo ""

# 4. Verificar no hay .env
echo "🔐 Verificando seguridad..."
if [ -f ".env" ]; then
    echo "❌ ¡.env encontrado! Bórralo antes de hacer push:"
    echo "   rm .env"
    exit 1
else
    echo "✅ .env no está versionado"
fi

# Verificar no hay secretos en el código
if grep -r "password.*=.*['\"]" --include="*.ts" --include="*.js" apps/ 2>/dev/null | grep -v "node_modules" | grep -v ".env" | grep -v "test" > /dev/null 2>&1; then
    echo "⚠️  Revisa los archivos para hardcoded passwords"
else
    echo "✅ No hay passwords hardcodeados"
fi

if grep -r "api.key.*=.*['\"]" --include="*.ts" --include="*.js" apps/ 2>/dev/null | grep -v "node_modules" | grep -v ".env" > /dev/null 2>&1; then
    echo "⚠️  Revisa los archivos para API keys hardcodeadas"
else
    echo "✅ No hay API keys hardcodeadas"
fi
echo ""

# 5. Inicializar git si es necesario
echo "📦 Inicializando git repository..."
if [ ! -d ".git" ]; then
    echo "⚠️  .git no encontrado. Inicializando..."
    git init
    echo "✅ Git repository inicializado"
else
    echo "✅ Git repository existe"
fi
echo ""

# 6. Estado de git
echo "📊 Estado de git:"
echo ""
git status
echo ""

# 7. Instrucciones finales
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Proyecto preparado para GitHub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Próximos pasos:"
echo ""
echo "1. Revisar cambios:"
echo "   git status"
echo ""
echo "2. Agregar archivos (si es primer commit):"
echo "   git add ."
echo ""
echo "3. Crear commit inicial:"
echo "   git commit -m 'feat: initial commit - Inventory Count PWA v1.0'"
echo ""
echo "4. Crear repositorio en GitHub"
echo ""
echo "5. Agregar remote:"
echo "   git remote add origin https://github.com/tu-usuario/inventory-count-pwa.git"
echo ""
echo "6. Push a main:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "📚 Documentación:"
echo "   - README.md: Visión general"
echo "   - CONTRIBUTING.md: Guía para contribuir"
echo "   - SECURITY.md: Política de seguridad"
echo "   - CHANGELOG.md: Historia de cambios"
echo ""
echo "🔗 Opciones recomendadas en GitHub:"
echo "   - Enable branch protection on main"
echo "   - Require pull request reviews"
echo "   - Require status checks to pass"
echo "   - Enable auto-merge"
echo ""
echo "¡Listo para GitHub! 🚀"
echo ""
