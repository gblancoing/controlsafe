# Solución para el Error de Prisma Client

## Problema
El error "Unknown field `company` for include statement on model `User`" ocurre porque el servidor de desarrollo de Next.js tiene una instancia antigua del Prisma Client en memoria.

## Solución Completa

### Paso 1: Cerrar completamente el servidor de desarrollo
1. Ve a la terminal donde está corriendo `npm run dev`
2. Presiona `Ctrl + C` para detenerlo
3. Espera a que se cierre completamente

### Paso 2: Cerrar cualquier proceso de Node.js que pueda estar bloqueando
Ejecuta en PowerShell:
```powershell
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
```

O usa el script:
```powershell
.\restart-dev.ps1
```

### Paso 3: Limpiar el cache de Next.js
```powershell
Remove-Item -Recurse -Force .next
```

### Paso 4: Regenerar Prisma Client
```powershell
npm run db:generate
```

### Paso 5: Reiniciar el servidor
```powershell
npm run dev
```

## Verificación

Después de reiniciar, el error debería desaparecer porque:
- ✅ El Prisma Client se regeneró correctamente (incluye la relación `company`)
- ✅ El cache de Next.js se limpió
- ✅ El servidor se reinició con la nueva instancia del Prisma Client

## Nota Importante

El Prisma Client usa un patrón singleton que mantiene la instancia en memoria. Por eso es necesario:
1. Cerrar completamente el servidor
2. Limpiar el cache
3. Regenerar el cliente
4. Reiniciar el servidor

Si el error persiste después de estos pasos, verifica que:
- La migración SQL se haya ejecutado correctamente
- La columna `company_id` existe en la tabla `users`
- El esquema de Prisma está correcto
