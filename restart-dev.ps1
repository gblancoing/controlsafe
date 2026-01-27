# Script para reiniciar el servidor de desarrollo correctamente

Write-Host "Deteniendo procesos de Node.js..." -ForegroundColor Yellow

# Cerrar procesos en el puerto 9002
$portProcess = Get-NetTCPConnection -LocalPort 9002 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($portProcess) {
    Stop-Process -Id $portProcess -Force -ErrorAction SilentlyContinue
    Write-Host "Proceso en puerto 9002 cerrado (PID: $portProcess)" -ForegroundColor Green
    Start-Sleep -Seconds 2
}

# Limpiar cache de Next.js
Write-Host "Limpiando cache de Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "Cache limpiado." -ForegroundColor Green
}

# Regenerar Prisma Client
Write-Host "Regenerando Prisma Client..." -ForegroundColor Yellow
npm run db:generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n¡Todo listo!" -ForegroundColor Green
    Write-Host "Ahora ejecuta: npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "`nError al regenerar Prisma Client." -ForegroundColor Red
}
