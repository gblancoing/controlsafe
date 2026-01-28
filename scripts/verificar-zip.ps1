# Script para Verificar el Contenido del ZIP Generado

param(
    [string]$ZipPath
)

$ErrorActionPreference = "Stop"

# Si no se proporciona ruta, buscar el ZIP más reciente
if (-not $ZipPath) {
    $latestZip = Get-ChildItem -Path "." -Filter "controlsafe-production-*.zip" | 
                 Sort-Object LastWriteTime -Descending | 
                 Select-Object -First 1
    
    if (-not $latestZip) {
        Write-Host "ERROR: No se encontro ningun archivo ZIP" -ForegroundColor Red
        Write-Host "   Buscando: controlsafe-production-*.zip" -ForegroundColor Yellow
        exit 1
    }
    
    $ZipPath = $latestZip.FullName
    Write-Host "Usando ZIP mas reciente: $($latestZip.Name)" -ForegroundColor Cyan
    Write-Host ""
}

if (-not (Test-Path $ZipPath)) {
    Write-Host "ERROR: El archivo ZIP no existe: $ZipPath" -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Verificando ZIP: $(Split-Path $ZipPath -Leaf)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Crear carpeta temporal para extraer
$tempExtract = ".\temp-zip-verify"
if (Test-Path $tempExtract) {
    Remove-Item -Recurse -Force $tempExtract
}
New-Item -ItemType Directory -Path $tempExtract | Out-Null

try {
    # Extraer ZIP
    Write-Host "Extrayendo ZIP..." -ForegroundColor Yellow
    Expand-Archive -Path $ZipPath -DestinationPath $tempExtract -Force
    
    Write-Host ""
    Write-Host "Estructura del ZIP:" -ForegroundColor Green
    Write-Host ""
    
    # Verificar estructura esperada
    $checks = @(
        @{ Path = ".next\standalone"; Description = "Carpeta standalone (servidor)" },
        @{ Path = ".next\static"; Description = "Carpeta static (archivos estaticos)" },
        @{ Path = "public"; Description = "Carpeta public (archivos publicos)" },
        @{ Path = "prisma"; Description = "Carpeta prisma (schema)" },
        @{ Path = "package.json"; Description = "Archivo package.json" },
        @{ Path = ".htaccess"; Description = "Archivo .htaccess" }
    )
    
    $allGood = $true
    
    foreach ($check in $checks) {
        $fullPath = Join-Path $tempExtract $check.Path
        if (Test-Path $fullPath) {
            Write-Host "  ✓ $($check.Description)" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $($check.Description) - FALTA" -ForegroundColor Red
            $allGood = $false
        }
    }
    
    Write-Host ""
    
    # Verificar server.js
    Write-Host "Buscando server.js..." -ForegroundColor Yellow
    $serverJsFound = $false
    $possibleServerPaths = @(
        ".next\standalone\server.js",
        ".next\standalone\controlsafe\server.js",
        ".next\standalone\nextn\server.js"
    )
    
    foreach ($path in $possibleServerPaths) {
        $fullPath = Join-Path $tempExtract $path
        if (Test-Path $fullPath) {
            $file = Get-Item $fullPath
            $sizeKB = [math]::Round($file.Length / 1KB, 2)
            Write-Host "  ✓ Encontrado: $path ($sizeKB KB)" -ForegroundColor Green
            
            # Verificar contenido
            $content = Get-Content $fullPath -Raw -ErrorAction SilentlyContinue
            if ($content -match "next" -or $content -match "startServer") {
                Write-Host "    ✓ Contiene codigo de Next.js" -ForegroundColor Green
            } else {
                Write-Host "    ⚠ No parece ser el servidor de Next.js" -ForegroundColor Yellow
            }
            
            $serverJsFound = $true
            break
        }
    }
    
    if (-not $serverJsFound) {
        Write-Host "  ✗ server.js NO encontrado" -ForegroundColor Red
        Write-Host "    Buscado en:" -ForegroundColor Yellow
        foreach ($path in $possibleServerPaths) {
            Write-Host "      - $path" -ForegroundColor Gray
        }
        $allGood = $false
    }
    
    Write-Host ""
    
    # Verificar node_modules
    Write-Host "Verificando node_modules..." -ForegroundColor Yellow
    $nodeModulesPaths = @(
        ".next\standalone\node_modules",
        ".next\standalone\controlsafe\node_modules",
        ".next\standalone\nextn\node_modules"
    )
    
    $nodeModulesFound = $false
    foreach ($path in $nodeModulesPaths) {
        $fullPath = Join-Path $tempExtract $path
        if (Test-Path $fullPath) {
            $dir = Get-Item $fullPath
            $count = (Get-ChildItem $fullPath -Directory -ErrorAction SilentlyContinue).Count
            Write-Host "  ✓ Encontrado: $path ($count paquetes)" -ForegroundColor Green
            $nodeModulesFound = $true
            break
        }
    }
    
    if (-not $nodeModulesFound) {
        Write-Host "  ✗ node_modules NO encontrado" -ForegroundColor Red
        $allGood = $false
    }
    
    Write-Host ""
    
    # Verificar archivos incorrectos
    Write-Host "Verificando archivos incorrectos..." -ForegroundColor Yellow
    $incorrectFiles = @()
    
    $standaloneSubfolders = Get-ChildItem (Join-Path $tempExtract ".next\standalone") -Directory -ErrorAction SilentlyContinue | 
                           Where-Object { $_.Name -ne "node_modules" }
    
    foreach ($subfolder in $standaloneSubfolders) {
        $subfolderPath = $subfolder.FullName
        
        if (Test-Path (Join-Path $subfolderPath ".next")) {
            $incorrectFiles += "$($subfolder.Name)/.next/"
        }
        if (Test-Path (Join-Path $subfolderPath "src")) {
            $incorrectFiles += "$($subfolder.Name)/src/"
        }
        if (Test-Path (Join-Path $subfolderPath ".env.production")) {
            $incorrectFiles += "$($subfolder.Name)/.env.production"
        }
        if (Test-Path (Join-Path $subfolderPath ".env.local")) {
            $incorrectFiles += "$($subfolder.Name)/.env.local"
        }
    }
    
    if ($incorrectFiles.Count -gt 0) {
        Write-Host "  ⚠ Archivos incorrectos encontrados:" -ForegroundColor Yellow
        foreach ($file in $incorrectFiles) {
            Write-Host "    - $file" -ForegroundColor Yellow
        }
        Write-Host "  Estos archivos deberian eliminarse del servidor" -ForegroundColor Yellow
    } else {
        Write-Host "  ✓ No se encontraron archivos incorrectos" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor $(if ($allGood) { "Green" } else { "Red" })
    if ($allGood) {
        Write-Host "  ✓ ZIP Verificado Correctamente" -ForegroundColor Green
    } else {
        Write-Host "  ✗ ZIP Tiene Problemas" -ForegroundColor Red
    }
    Write-Host "========================================" -ForegroundColor $(if ($allGood) { "Green" } else { "Red" })
    
} finally {
    # Limpiar
    if (Test-Path $tempExtract) {
        Remove-Item -Recurse -Force $tempExtract -ErrorAction SilentlyContinue
    }
}
