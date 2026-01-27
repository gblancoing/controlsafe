# Script para solucionar el error de Prisma Client con la relación project
# Ejecuta este script después de aplicar la migración SQL

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Solución: Error Prisma Client - project" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Detener procesos de Node.js
Write-Host "Paso 1: Deteniendo procesos de Node.js..." -ForegroundColor Yellow
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -eq "node"}
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "✓ Procesos de Node.js detenidos" -ForegroundColor Green
} else {
    Write-Host "✓ No hay procesos de Node.js corriendo" -ForegroundColor Green
}

# Paso 2: Limpiar caché de Next.js
Write-Host ""
Write-Host "Paso 2: Limpiando caché de Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✓ Caché de Next.js eliminada" -ForegroundColor Green
} else {
    Write-Host "✓ No hay caché de Next.js" -ForegroundColor Green
}

# Paso 3: Regenerar Prisma Client
Write-Host ""
Write-Host "Paso 3: Regenerando Prisma Client..." -ForegroundColor Yellow
try {
    npm run db:generate
    Write-Host "✓ Prisma Client regenerado correctamente" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al regenerar Prisma Client" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "¡Proceso completado!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE: Asegúrate de haber aplicado la migración SQL primero:" -ForegroundColor Yellow
Write-Host "  - Archivo: database/users-phone-project-migration.sql" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ahora puedes iniciar el servidor con: npm run dev" -ForegroundColor Cyan
