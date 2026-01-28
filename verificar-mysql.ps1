# Script de Verificación de MySQL para ControlSafe
# Ejecuta este script para verificar la conexión a MySQL

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verificación de MySQL - ControlSafe" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar que MySQL esté corriendo
Write-Host "1. Verificando proceso MySQL..." -ForegroundColor Yellow
$mysqlProcess = Get-Process -Name mysqld -ErrorAction SilentlyContinue
if ($mysqlProcess) {
    Write-Host "   ✅ MySQL está corriendo (PID: $($mysqlProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "   ❌ MySQL NO está corriendo" -ForegroundColor Red
    Write-Host "   → Por favor inicia MySQL desde el Panel de Control de XAMPP" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar archivo .env.local
Write-Host ""
Write-Host "2. Verificando archivo .env.local..." -ForegroundColor Yellow
if (Test-Path .env.local) {
    Write-Host "   ✅ Archivo .env.local existe" -ForegroundColor Green
    $envContent = Get-Content .env.local | Where-Object { $_ -match "DATABASE_URL" }
    if ($envContent) {
        Write-Host "   ✅ DATABASE_URL encontrado:" -ForegroundColor Green
        Write-Host "      $envContent" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ DATABASE_URL no encontrado en .env.local" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Archivo .env.local NO existe" -ForegroundColor Red
    Write-Host "   → Crea el archivo con: DATABASE_URL=`"mysql://root@localhost:3306/controlsafe`"" -ForegroundColor Yellow
    exit 1
}

# 3. Verificar puerto 3306
Write-Host ""
Write-Host "3. Verificando puerto 3306..." -ForegroundColor Yellow
$port3306 = netstat -ano | findstr :3306
if ($port3306) {
    Write-Host "   ✅ Puerto 3306 está en uso" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Puerto 3306 no está en uso" -ForegroundColor Yellow
    Write-Host "   → Verifica que MySQL esté configurado para usar el puerto 3306" -ForegroundColor Yellow
}

# 4. Intentar conexión con Prisma
Write-Host ""
Write-Host "4. Verificando conexión con Prisma..." -ForegroundColor Yellow
Write-Host "   Ejecutando: npm run db:studio (esto abrirá Prisma Studio si la conexión funciona)" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Resumen:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si MySQL está corriendo pero aún tienes errores:" -ForegroundColor Yellow
Write-Host "  1. Verifica que la base de datos 'controlsafe' exista en phpMyAdmin" -ForegroundColor White
Write-Host "  2. Reinicia el servidor de desarrollo: npm run dev" -ForegroundColor White
Write-Host "  3. Limpia la caché: Remove-Item -Recurse -Force .next" -ForegroundColor White
Write-Host ""
Write-Host "Para probar la conexión manualmente:" -ForegroundColor Yellow
Write-Host "  npm run db:studio" -ForegroundColor White
Write-Host ""
