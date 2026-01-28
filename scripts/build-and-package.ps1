# Script para Crear ZIP de Produccion
# Asume que el build ya fue ejecutado con npm run build:prod

param(
    [switch]$SkipBuild,
    [switch]$KeepTemp
)

$ErrorActionPreference = "Stop"

# Cambiar al directorio raiz del proyecto
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Join-Path $scriptPath ".."
Set-Location $projectRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Empaquetado para Produccion" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que existe .next/standalone
if (-not (Test-Path ".next\standalone")) {
    Write-Host "ERROR: No se encontro .next/standalone" -ForegroundColor Red
    Write-Host "   Asegurate de que el build se haya completado correctamente." -ForegroundColor Red
    Write-Host "   Ejecuta: npm run build:prod" -ForegroundColor Yellow
    exit 1
}

# Buscar server.js (puede estar en .next/standalone/ o en una subcarpeta)
$serverJsPath = $null
$possiblePaths = @(
    ".next\standalone\server.js",
    ".next\standalone\controlsafe\server.js",
    ".next\standalone\nextn\server.js"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $serverJsPath = $path
        break
    }
}

# Si no se encuentra, buscar recursivamente
if (-not $serverJsPath) {
    $found = Get-ChildItem ".next\standalone" -Recurse -Filter "server.js" -ErrorAction SilentlyContinue | 
             Where-Object { $_.Directory.Name -ne "node_modules" -and $_.Directory.Name -ne "next" } | 
             Select-Object -First 1
    
    if ($found) {
        $serverJsPath = $found.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "\")
    }
}

if (-not $serverJsPath -or -not (Test-Path $serverJsPath)) {
    Write-Host "ERROR: No se encontro .next/standalone/server.js" -ForegroundColor Red
    Write-Host "   Buscado en:" -ForegroundColor Yellow
    foreach ($path in $possiblePaths) {
        Write-Host "     - $path" -ForegroundColor Gray
    }
    Write-Host "   El build no se completo correctamente." -ForegroundColor Red
    Write-Host "   Ejecuta: npm run build:prod" -ForegroundColor Yellow
    exit 1
}

# Verificar el tamano del archivo
# NOTA: En Next.js standalone, server.js es pequeño (6-7 KB) porque es solo el punto de entrada
# El codigo real esta en node_modules/next/dist/server/
$serverJsFile = Get-Item $serverJsPath
$fileSizeKB = $serverJsFile.Length / 1KB

# Verificar que el archivo existe y tiene contenido (al menos 1 KB)
if ($serverJsFile.Length -lt 1000) {
    Write-Host "ERROR: El archivo server.js es demasiado pequeno ($([math]::Round($fileSizeKB, 2)) KB)" -ForegroundColor Red
    Write-Host "   Ubicacion: $serverJsPath" -ForegroundColor Yellow
    Write-Host "   El archivo debe tener al menos 1 KB (tamano actual: $([math]::Round($fileSizeKB, 2)) KB)" -ForegroundColor Red
    Write-Host "   Esto indica que el build no se genero correctamente." -ForegroundColor Red
    Write-Host "   Ejecuta: npm run build:prod" -ForegroundColor Yellow
    exit 1
}

# Verificar que contiene codigo de Next.js (debe contener "next" o "startServer")
$fileContent = Get-Content $serverJsPath -Raw -ErrorAction SilentlyContinue
if (-not $fileContent -or ($fileContent -notmatch "next" -and $fileContent -notmatch "startServer")) {
    Write-Host "ADVERTENCIA: El archivo server.js no parece ser el servidor de Next.js" -ForegroundColor Yellow
    Write-Host "   Ubicacion: $serverJsPath" -ForegroundColor Yellow
    Write-Host "   Verifica que el build se completo correctamente." -ForegroundColor Yellow
}

Write-Host "Verificacion del build:" -ForegroundColor Green
Write-Host "  ✓ server.js encontrado en: $serverJsPath" -ForegroundColor Green
Write-Host "  ✓ Tamano del archivo: $([math]::Round($fileSizeKB, 2)) KB" -ForegroundColor Green
Write-Host ""

# Usar ruta corta para evitar limite de 260 caracteres en Windows (Compress-Archive)
$shortTemp = "C:\csf"
if (-not (Test-Path "C:\")) { $shortTemp = "$env:TEMP\csf" }
if (-not (Test-Path $shortTemp)) { New-Item -ItemType Directory -Path $shortTemp -Force | Out-Null }
$tempDir = Join-Path $shortTemp "dist-production"
$zipName = "controlsafe-production-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
$zipPath = Join-Path (Get-Location) $zipName

# Limpiar carpeta temporal si existe
if (Test-Path $tempDir) {
    Write-Host "Limpiando carpeta temporal..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $tempDir
}

Write-Host "Creando estructura (ruta corta para ZIP completo): $tempDir" -ForegroundColor Gray
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copiar archivos necesarios
Write-Host "Copiando archivos necesarios..." -ForegroundColor Yellow

# .next/standalone (version optimizada)
Write-Host "  -> .next/standalone/" -ForegroundColor Gray
New-Item -ItemType Directory -Path "$tempDir\.next" -Force | Out-Null
Copy-Item -Recurse -Path ".next\standalone" -Destination "$tempDir\.next\standalone"

# Limpiar archivos incorrectos que Next.js puede copiar en standalone
Write-Host "  -> Limpiando archivos incorrectos en standalone..." -ForegroundColor Gray
$standalonePath = "$tempDir\.next\standalone"

# Buscar subcarpetas dentro de standalone (ej: controlsafe, nextn)
$subfolders = Get-ChildItem $standalonePath -Directory | Where-Object { $_.Name -ne "node_modules" }

foreach ($subfolder in $subfolders) {
    $subfolderPath = $subfolder.FullName
    
    # Eliminar .next incorrecto (src, .env) pero NO borrar .next si existe; luego lo recreamos con BUILD_ID, static, server
    $itemsToRemove = @()
    if (Test-Path "$subfolderPath\.next") {
        Remove-Item -Recurse -Force "$subfolderPath\.next" -ErrorAction SilentlyContinue
    }
    if (Test-Path "$subfolderPath\src") {
        $itemsToRemove += "$subfolderPath\src"
        Write-Host "    Eliminando: $($subfolder.Name)/src/" -ForegroundColor Yellow
    }
    if (Test-Path "$subfolderPath\.env.production") {
        $itemsToRemove += "$subfolderPath\.env.production"
        Write-Host "    Eliminando: $($subfolder.Name)/.env.production" -ForegroundColor Yellow
    }
    if (Test-Path "$subfolderPath\.env.local") {
        $itemsToRemove += "$subfolderPath\.env.local"
        Write-Host "    Eliminando: $($subfolder.Name)/.env.local" -ForegroundColor Yellow
    }
    foreach ($item in $itemsToRemove) {
        if (Test-Path $item) {
            Remove-Item -Recurse -Force $item -ErrorAction SilentlyContinue
        }
    }
    
    # Copiar TODO .next necesario al standalone (BUILD_ID, static, server, routes-manifest.json, etc.)
    $subfolderNext = Join-Path $subfolderPath ".next"
    New-Item -ItemType Directory -Path $subfolderNext -Force | Out-Null
    $excludeNames = @("standalone", "cache")
    Get-ChildItem ".next" -Force | Where-Object { $excludeNames -notcontains $_.Name } | ForEach-Object {
        $dest = Join-Path $subfolderNext $_.Name
        if ($_.PSIsContainer) {
            Copy-Item -Recurse -Path $_.FullName -Destination $dest -Force
        } else {
            Copy-Item -Path $_.FullName -Destination $dest -Force
        }
        Write-Host "    Copiando $($_.Name) a $($subfolder.Name)/.next/" -ForegroundColor Gray
    }
    
    # Escribir package.json minimo en standalone para que en el servidor "Run NPM Install" cree node_modules/next
    $rootPkg = Get-Content (Join-Path $projectRoot "package.json") -Raw | ConvertFrom-Json
    $nextVer = $rootPkg.dependencies.next
    $standalonePkg = @{ name = "controlsafe-standalone"; private = $true; dependencies = @{ next = $nextVer } } | ConvertTo-Json -Depth 3
    $pkgPath = Join-Path $subfolderPath "package.json"
    Set-Content -Path $pkgPath -Value $standalonePkg -Encoding UTF8
    Write-Host "    package.json (next $nextVer) en $($subfolder.Name)/" -ForegroundColor Gray
    
    # Copiar public dentro del standalone para que /flota.jpg y demas estaticos funcionen
    if (Test-Path "public") {
        Copy-Item -Recurse -Path "public" -Destination (Join-Path $subfolderPath "public") -Force
        Write-Host "    public/ copiado a $($subfolder.Name)/" -ForegroundColor Gray
    }
}

# Instalar next en la carpeta standalone del temp (para que el ZIP lleve node_modules/next completo)
$standaloneSubfolder = Get-ChildItem $standalonePath -Directory | Where-Object { $_.Name -ne "node_modules" } | Select-Object -First 1
if ($standaloneSubfolder) {
    $nextJsPath = Join-Path $standaloneSubfolder.FullName "node_modules\next\dist\server\next.js"
    if (-not (Test-Path $nextJsPath)) {
        Write-Host "  -> Instalando next en standalone (para ZIP completo)..." -ForegroundColor Yellow
        Push-Location $standaloneSubfolder.FullName
        try {
            npm install --production 2>&1 | Out-Null
            if (Test-Path "node_modules\next\dist\server\next.js") {
                Write-Host "  -> next instalado en standalone" -ForegroundColor Green
            }
        } catch {
            Write-Host "  -> ADVERTENCIA: npm install en standalone fallo; usa 7-Zip para el ZIP" -ForegroundColor Yellow
        }
        Pop-Location
    } else {
        Write-Host "  -> Verificado: next en standalone" -ForegroundColor Green
    }
}

# .next/static (archivos estaticos compilados)
Write-Host "  -> .next/static/" -ForegroundColor Gray
if (Test-Path ".next\static") {
    Copy-Item -Recurse -Path ".next\static" -Destination "$tempDir\.next\static"
}

# public/ (archivos estaticos)
Write-Host "  -> public/" -ForegroundColor Gray
if (Test-Path "public") {
    Copy-Item -Recurse -Path "public" -Destination "$tempDir\public"
}

# prisma/ (schema y migraciones)
Write-Host "  -> prisma/" -ForegroundColor Gray
if (Test-Path "prisma") {
    Copy-Item -Recurse -Path "prisma" -Destination "$tempDir\prisma"
}

# Archivos de configuracion
Write-Host "  -> Archivos de configuracion" -ForegroundColor Gray
Copy-Item -Path "package.json" -Destination "$tempDir\package.json"
Copy-Item -Path "package-lock.json" -Destination "$tempDir\package-lock.json" -ErrorAction SilentlyContinue
Copy-Item -Path ".htaccess" -Destination "$tempDir\.htaccess" -ErrorAction SilentlyContinue

# server.js si existe
if (Test-Path "server.js") {
    Write-Host "  -> server.js" -ForegroundColor Gray
    Copy-Item -Path "server.js" -Destination "$tempDir\server.js"
}

# next.config.ts (por si acaso)
if (Test-Path "next.config.ts") {
    Copy-Item -Path "next.config.ts" -Destination "$tempDir\next.config.ts"
}

Write-Host "Archivos copiados exitosamente" -ForegroundColor Green
Write-Host ""

# Crear archivo ZIP (preferir 7-Zip para incluir rutas largas de node_modules)
Write-Host "Creando archivo ZIP..." -ForegroundColor Yellow

$sevenZPaths = @(
    "C:\Program Files\7-Zip\7z.exe",
    "C:\Program Files (x86)\7-Zip\7z.exe",
    "$env:ProgramFiles\7-Zip\7z.exe"
)
$sevenZ = $null
foreach ($p in $sevenZPaths) {
    if ($p -and (Test-Path $p)) { $sevenZ = $p; break }
}

if ($sevenZ) {
    Write-Host "  Usando 7-Zip (incluye rutas largas de node_modules)" -ForegroundColor Green
    $tempDirArg = (Resolve-Path $tempDir).Path
    $args7z = "a", "-tzip", $zipPath, "$tempDirArg\*", "-r"
    & $sevenZ $args7z
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: 7-Zip fallo (codigo $LASTEXITCODE). Creando ZIP con PowerShell..." -ForegroundColor Yellow
        Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
        Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force
    }
} else {
    Write-Host "  ADVERTENCIA: 7-Zip no encontrado. Usando PowerShell (puede omitir archivos en rutas largas)." -ForegroundColor Yellow
    Write-Host "  Para un ZIP completo, instala 7-Zip (https://www.7-zip.org/) y vuelve a ejecutar este script." -ForegroundColor Yellow
    Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force
}

# Limpiar carpeta temporal (salvo -KeepTemp)
if (-not $KeepTemp) {
    Write-Host "Limpiando carpeta temporal..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
} else {
    Write-Host "Carpeta temporal conservada: $tempDir (puedes comprimir con 7-Zip manualmente)" -ForegroundColor Cyan
}

# Mostrar resultado
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Empaquetado Completado" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Archivo ZIP creado:" -ForegroundColor Cyan
Write-Host "   $zipPath" -ForegroundColor White
Write-Host ""

if (Test-Path $zipPath) {
    $zipSize = (Get-Item $zipPath).Length / 1MB
    Write-Host "Tamano del archivo:" -ForegroundColor Cyan
    Write-Host "   $([math]::Round($zipSize, 2)) MB" -ForegroundColor White
    Write-Host ""
}

Write-Host "Contenido del ZIP:" -ForegroundColor Cyan
Write-Host "   - .next/standalone/ (servidor optimizado)" -ForegroundColor Green
Write-Host "   - .next/static/ (archivos estaticos)" -ForegroundColor Green
Write-Host "   - public/ (archivos publicos)" -ForegroundColor Green
Write-Host "   - prisma/ (schema y migraciones)" -ForegroundColor Green
Write-Host "   - package.json y package-lock.json" -ForegroundColor Green
Write-Host "   - .htaccess" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Sube el archivo ZIP al servidor" -ForegroundColor White
Write-Host "   2. Descomprime en /public_html/controlsafe.carenvp.cl/" -ForegroundColor White
Write-Host "   3. Configura las variables de entorno en cPanel Node.js App" -ForegroundColor White
Write-Host "   4. Inicia la aplicacion desde cPanel" -ForegroundColor White
Write-Host ""
