# Ejecuta "prisma db push" cargando DATABASE_URL desde .env.local
# Prisma por defecto solo lee .env, no .env.local. Este script evita tener que duplicar variables.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (Test-Path .env.local) {
    Write-Host "Cargando variables desde .env.local..." -ForegroundColor Cyan
    Get-Content .env.local | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"').Trim("'")
            Set-Item -Path "Env:\$key" -Value $value
        }
    }
} else {
    Write-Host "Archivo .env.local no encontrado." -ForegroundColor Yellow
    Write-Host "Copia .env.example a .env.local y define DATABASE_URL, o crea .env en la raíz con DATABASE_URL." -ForegroundColor Yellow
    exit 1
}

if (-not $env:DATABASE_URL) {
    Write-Host "DATABASE_URL no está definido en .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "Ejecutando: npx prisma db push" -ForegroundColor Green
npx prisma db push
