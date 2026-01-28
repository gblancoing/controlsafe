# Script para Regenerar ZIP Limpio
# Limpia el build anterior, genera uno nuevo, elimina archivos incorrectos y crea el ZIP

$ErrorActionPreference = "Stop"

# Cambiar al directorio raiz del proyecto
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Join-Path $scriptPath ".."
Set-Location $projectRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Regenerando ZIP Limpio" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Limpiar build anterior
Write-Host "[1/5] Limpiando build anterior..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "  ✓ Build anterior eliminado" -ForegroundColor Green
} else {
    Write-Host "  ✓ No hay build anterior" -ForegroundColor Gray
}
Write-Host ""

# Paso 2: Generar nuevo build
Write-Host "[2/5] Generando nuevo build..." -ForegroundColor Yellow
Write-Host "  Esto puede tardar 1-2 minutos..." -ForegroundColor Gray
npm run build:prod
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ ERROR: El build falló" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Build generado" -ForegroundColor Green
Write-Host ""

# Paso 3: Limpiar archivos incorrectos del build local
Write-Host "[3/5] Limpiando archivos incorrectos del build..." -ForegroundColor Yellow
if (Test-Path ".next\standalone\controlsafe") {
    $removed = @()
    
    if (Test-Path ".next\standalone\controlsafe\.next") {
        Remove-Item -Recurse -Force ".next\standalone\controlsafe\.next" -ErrorAction SilentlyContinue
        $removed += ".next/"
        Write-Host "  ✓ Eliminado: .next/" -ForegroundColor Green
    }
    
    if (Test-Path ".next\standalone\controlsafe\src") {
        Remove-Item -Recurse -Force ".next\standalone\controlsafe\src" -ErrorAction SilentlyContinue
        $removed += "src/"
        Write-Host "  ✓ Eliminado: src/" -ForegroundColor Green
    }
    
    if (Test-Path ".next\standalone\controlsafe\.env.production") {
        Remove-Item -Force ".next\standalone\controlsafe\.env.production" -ErrorAction SilentlyContinue
        $removed += ".env.production"
        Write-Host "  ✓ Eliminado: .env.production" -ForegroundColor Green
    }
    
    if (Test-Path ".next\standalone\controlsafe\.env.local") {
        Remove-Item -Force ".next\standalone\controlsafe\.env.local" -ErrorAction SilentlyContinue
        $removed += ".env.local"
        Write-Host "  ✓ Eliminado: .env.local" -ForegroundColor Green
    }
    
    if ($removed.Count -eq 0) {
        Write-Host "  ✓ No había archivos incorrectos" -ForegroundColor Green
    }
    
    # Verificar node_modules
    if (Test-Path ".next\standalone\controlsafe\node_modules") {
        $count = (Get-ChildItem ".next\standalone\controlsafe\node_modules" -Directory).Count
        Write-Host "  ✓ node_modules existe con $count paquetes" -ForegroundColor Green
    } else {
        Write-Host "  ✗ ERROR: node_modules NO existe" -ForegroundColor Red
        Write-Host "     El build no se generó correctamente." -ForegroundColor Red
        exit 1
    }
    
    # Verificar server.js
    if (Test-Path ".next\standalone\controlsafe\server.js") {
        $file = Get-Item ".next\standalone\controlsafe\server.js"
        Write-Host "  ✓ server.js existe ($([math]::Round($file.Length / 1KB, 2)) KB)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ ERROR: server.js NO existe" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✗ ERROR: .next/standalone/controlsafe NO existe" -ForegroundColor Red
    Write-Host "     El build no se generó correctamente." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 4: Generar ZIP
Write-Host "[4/5] Generando ZIP..." -ForegroundColor Yellow
npm run build:package
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ ERROR: Falló la generación del ZIP" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ ZIP generado" -ForegroundColor Green
Write-Host ""

# Paso 5: Verificar ZIP
Write-Host "[5/5] Verificando ZIP generado..." -ForegroundColor Yellow
$zip = Get-ChildItem -Filter "controlsafe-production-*.zip" | 
       Sort-Object LastWriteTime -Descending | 
       Select-Object -First 1

if ($zip) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ Proceso Completado" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Archivo ZIP:" -ForegroundColor Cyan
    Write-Host "  Nombre: $($zip.Name)" -ForegroundColor White
    Write-Host "  Tamaño: $([math]::Round($zip.Length / 1MB, 2)) MB" -ForegroundColor White
    Write-Host "  Ubicación: $($zip.FullName)" -ForegroundColor White
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Yellow
    Write-Host "  1. Sube este ZIP al servidor" -ForegroundColor White
    Write-Host "  2. Descomprime en public_html/controlsafe.carenvp.cl/" -ForegroundColor White
    Write-Host "  3. Verifica que NO existan .next/, src/, .env.production en standalone/controlsafe/" -ForegroundColor White
    Write-Host "  4. Si existen, elimínalos manualmente" -ForegroundColor White
    Write-Host "  5. Reinicia la aplicación en cPanel" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "  ✗ ERROR: No se encontró el ZIP" -ForegroundColor Red
    exit 1
}
