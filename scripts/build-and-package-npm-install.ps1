# Script para Crear ZIP de Produccion (para usar Run NPM Install en cPanel)
# Incluye build completo + package.json para que en el servidor se ejecute npm install
# y se use server.js como punto de entrada.

param(
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Join-Path $scriptPath ".."
Set-Location $projectRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ZIP para Produccion (NPM Install)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ejecutar build si no se omite
if (-not $SkipBuild) {
    Write-Host "Ejecutando build de produccion..." -ForegroundColor Yellow
    npm run build:prod
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: El build fallo" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# Verificar que existe .next
if (-not (Test-Path ".next")) {
    Write-Host "ERROR: No se encontro .next" -ForegroundColor Red
    Write-Host "   Ejecuta: npm run build:prod" -ForegroundColor Yellow
    exit 1
}

# Verificar server.js en raiz
if (-not (Test-Path "server.js")) {
    Write-Host "ERROR: No se encontro server.js en la raiz" -ForegroundColor Red
    exit 1
}

# Crear carpeta temporal
$tempDir = ".\dist-production-npm"
$zipName = "controlsafe-production-npm-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
$zipPath = ".\$zipName"

if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "Creando estructura para produccion (NPM Install)..." -ForegroundColor Yellow
Write-Host ""

# 1. package.json y package-lock.json
Write-Host "  -> package.json, package-lock.json" -ForegroundColor Gray
Copy-Item -Path "package.json" -Destination "$tempDir\package.json"
Copy-Item -Path "package-lock.json" -Destination "$tempDir\package-lock.json" -ErrorAction SilentlyContinue

# 2. Carpeta .next COMPLETA (server, static, standalone, etc.)
Write-Host "  -> .next/ (build completo)" -ForegroundColor Gray
Copy-Item -Recurse -Path ".next" -Destination "$tempDir\.next"

# 3. prisma/
Write-Host "  -> prisma/" -ForegroundColor Gray
Copy-Item -Recurse -Path "prisma" -Destination "$tempDir\prisma"

# 4. public/
Write-Host "  -> public/" -ForegroundColor Gray
Copy-Item -Recurse -Path "public" -Destination "$tempDir\public"

# 5. server.js (punto de entrada en raiz)
Write-Host "  -> server.js" -ForegroundColor Gray
Copy-Item -Path "server.js" -Destination "$tempDir\server.js"

# 6. .htaccess
if (Test-Path ".htaccess") {
    Write-Host "  -> .htaccess" -ForegroundColor Gray
    Copy-Item -Path ".htaccess" -Destination "$tempDir\.htaccess"
}

# NO incluir: node_modules, src, .env, .git (se instalan en servidor con npm install)

Write-Host ""
Write-Host "Creando archivo ZIP..." -ForegroundColor Yellow
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force

# Limpiar
Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ZIP Creado" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Archivo: $zipPath" -ForegroundColor Cyan
if (Test-Path $zipPath) {
    $zipSize = (Get-Item $zipPath).Length / 1MB
    Write-Host "Tamano: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "Contenido del ZIP:" -ForegroundColor Yellow
Write-Host "  - package.json, package-lock.json" -ForegroundColor White
Write-Host "  - .next/ (build completo)" -ForegroundColor White
Write-Host "  - prisma/, public/, server.js, .htaccess" -ForegroundColor White
Write-Host ""
Write-Host "En cPanel: subir ZIP, descomprimir, luego Run NPM Install." -ForegroundColor Yellow
Write-Host ""
