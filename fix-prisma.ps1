# Script para cerrar procesos y regenerar Prisma Client

Write-Host "Cerrando procesos de Node.js en el puerto 9002..." -ForegroundColor Yellow

# Encontrar y cerrar el proceso en el puerto 9002
$portProcess = Get-NetTCPConnection -LocalPort 9002 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($portProcess) {
    Write-Host "Proceso encontrado: PID $portProcess" -ForegroundColor Yellow
    Stop-Process -Id $portProcess -Force -ErrorAction SilentlyContinue
    Write-Host "Proceso cerrado." -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "No se encontró proceso en el puerto 9002." -ForegroundColor Green
}

# Esperar un momento para que los archivos se liberen
Write-Host "Esperando 3 segundos para liberar archivos..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Regenerar Prisma Client
Write-Host "Regenerando Prisma Client..." -ForegroundColor Yellow
cd c:\xampp\htdocs\controlsafe
npm run db:generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n¡Prisma Client regenerado exitosamente!" -ForegroundColor Green
    Write-Host "Ahora puedes ejecutar: npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "`nError al regenerar Prisma Client. Intenta cerrar manualmente todos los procesos de Node.js." -ForegroundColor Red
}
