# ============================================
# ControlSafe - Script de Despliegue a Producción
# ============================================
# Este script ayuda a preparar el proyecto para producción

param(
    [switch]$Build,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Script de Despliegue - ControlSafe
===================================

Uso:
    .\scripts\deploy.ps1 [-Build] [-Help]

Opciones:
    -Build    Ejecuta el build de producción después de las verificaciones
    -Help     Muestra esta ayuda

Ejemplos:
    .\scripts\deploy.ps1              # Solo verifica el proyecto
    .\scripts\deploy.ps1 -Build       # Verifica y construye para producción

"@
    exit 0
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ControlSafe - Preparación para Producción" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: No se encontró package.json. Ejecuta este script desde la raíz del proyecto." -ForegroundColor Red
    exit 1
}

Write-Host "[1/5] Verificando estructura del proyecto..." -ForegroundColor Yellow

# Verificar archivos importantes
$requiredFiles = @(
    "package.json",
    "next.config.ts",
    "prisma/schema.prisma",
    ".env.example"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file encontrado" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file NO encontrado" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "[2/5] Verificando variables de entorno..." -ForegroundColor Yellow

# Verificar .env.production
if (Test-Path ".env.production") {
    Write-Host "  ✓ .env.production encontrado" -ForegroundColor Green
    Write-Host "  ⚠  Asegúrate de configurar las variables correctas en el servidor" -ForegroundColor Yellow
} else {
    Write-Host "  ⚠  .env.production no encontrado (esto es normal, se creará en el servidor)" -ForegroundColor Yellow
}

# Verificar que .env.local no se suba
if (Test-Path ".env.local") {
    Write-Host "  ⚠  .env.local encontrado (NO debe subirse a producción)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[3/5] Verificando dependencias..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    Write-Host "  ✓ node_modules encontrado" -ForegroundColor Green
} else {
    Write-Host "  ⚠  node_modules no encontrado. Ejecuta 'npm install' primero." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[4/5] Verificando Prisma..." -ForegroundColor Yellow

if (Test-Path "prisma/schema.prisma") {
    Write-Host "  ✓ Prisma schema encontrado" -ForegroundColor Green
    Write-Host "  ℹ  Recuerda ejecutar 'npm run db:generate' antes del build" -ForegroundColor Cyan
} else {
    Write-Host "  ✗ Prisma schema NO encontrado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[5/5] Verificando configuración de producción..." -ForegroundColor Yellow

# Verificar next.config.ts
$nextConfig = Get-Content "next.config.ts" -Raw
if ($nextConfig -match "output.*standalone") {
    Write-Host "  ✓ next.config.ts configurado para producción (standalone)" -ForegroundColor Green
} else {
    Write-Host "  ⚠  next.config.ts podría no estar optimizado para producción" -ForegroundColor Yellow
}

# Verificar .htaccess
if (Test-Path ".htaccess") {
    Write-Host "  ✓ .htaccess encontrado" -ForegroundColor Green
} else {
    Write-Host "  ⚠  .htaccess no encontrado (puede ser necesario para Apache)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Resumen de Preparación" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Configura las variables de entorno en el servidor (.env.production)" -ForegroundColor White
Write-Host "  2. Ejecuta 'npm run db:generate' para generar Prisma Client" -ForegroundColor White
Write-Host "  3. Ejecuta 'npm run build:prod' para construir la aplicación" -ForegroundColor White
Write-Host "  4. Sube los archivos al servidor en /public_html/controlsafe.carenvp.cl/" -ForegroundColor White
Write-Host "  5. Configura la aplicación Node.js en cPanel" -ForegroundColor White
Write-Host "  6. Verifica que la aplicación funcione en https://controlsafe.carenvp.cl" -ForegroundColor White
Write-Host ""
Write-Host "Para más detalles, consulta DEPLOY.md" -ForegroundColor Cyan
Write-Host ""

if ($Build) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Iniciando build de producción..." -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Generar Prisma Client primero
    Write-Host "Generando Prisma Client..." -ForegroundColor Yellow
    npm run db:generate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Falló la generación de Prisma Client" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "Construyendo aplicación..." -ForegroundColor Yellow
    npm run build:prod
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Falló el build de producción" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ Build completado exitosamente!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "La carpeta .next/ contiene los archivos compilados." -ForegroundColor Cyan
    Write-Host "Sube estos archivos al servidor junto con:" -ForegroundColor Cyan
    Write-Host "  - public/" -ForegroundColor White
    Write-Host "  - node_modules/ (o instala en el servidor)" -ForegroundColor White
    Write-Host "  - prisma/" -ForegroundColor White
    Write-Host "  - package.json y package-lock.json" -ForegroundColor White
    Write-Host "  - .htaccess" -ForegroundColor White
    Write-Host "  - server.js (si es necesario)" -ForegroundColor White
    Write-Host ""
}

Write-Host "Proceso completado." -ForegroundColor Green
