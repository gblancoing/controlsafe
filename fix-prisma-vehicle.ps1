# Script para regenerar Prisma Client después de agregar "Camioneta" al enum VehicleType

Write-Host "Deteniendo procesos de Node.js..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "Limpiando caché de Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
}

Write-Host "Regenerando Prisma Client..." -ForegroundColor Yellow
npm run db:generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nPrisma Client regenerado exitosamente!" -ForegroundColor Green
    Write-Host "Ahora puedes iniciar el servidor con: npm run dev" -ForegroundColor Green
} else {
    Write-Host "`nError al regenerar Prisma Client. Intenta manualmente:" -ForegroundColor Red
    Write-Host "npm run db:generate" -ForegroundColor Yellow
}
