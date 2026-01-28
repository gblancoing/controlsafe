# Script para ejecutar Prisma Studio con variables de entorno desde .env.local

# Cargar variables de entorno desde .env.local
if (Test-Path .env.local) {
    Write-Host "Cargando variables de entorno desde .env.local..." -ForegroundColor Green
    Get-Content .env.local | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"').Trim("'")
            [Environment]::SetEnvironmentVariable($key, $value, 'Process')
            Write-Host "  $key = $value" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "⚠️  Archivo .env.local no encontrado" -ForegroundColor Yellow
    Write-Host "   Asegúrate de que el archivo existe con DATABASE_URL configurado" -ForegroundColor Yellow
    exit 1
}

# Verificar que DATABASE_URL esté configurado
if (-not $env:DATABASE_URL) {
    Write-Host "❌ DATABASE_URL no está configurado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Iniciando Prisma Studio..." -ForegroundColor Green
Write-Host ""

# Ejecutar Prisma Studio
npx prisma studio
