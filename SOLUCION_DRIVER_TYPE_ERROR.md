# Solución: Error "The column `controlsafe.users.driver_type` does not exist"

## Problema

El error indica que Prisma está intentando acceder a la columna `driver_type` que ya no existe en la base de datos. Esto ocurre porque:

1. **El schema de Prisma fue actualizado** para usar `canDrive` (booleano) en lugar de `driverType` (enum)
2. **La migración SQL no se ha aplicado** - La columna `can_drive` no existe en la tabla `users`
3. **Prisma Client no se ha regenerado** - El cliente está usando una versión antigua del schema

## Solución Paso a Paso

### Paso 1: Aplicar la migración SQL

**IMPORTANTE:** Debes aplicar la migración SQL **ANTES** de regenerar Prisma Client.

1. Abre phpMyAdmin o tu cliente MySQL
2. Selecciona tu base de datos
3. Ejecuta **UNA** de estas opciones:

#### Opción A: Script Condicional (RECOMENDADO)
Ejecuta el contenido completo de `database/users-can-drive-migration-conditional.sql`

Este script:
- ✅ Verifica automáticamente si `driver_type` existe antes de eliminarla
- ✅ Verifica automáticamente si `can_drive` existe antes de crearla
- ✅ No generará errores si las columnas ya están en el estado correcto

#### Opción B: Script Simple (si prefieres ignorar errores)
Ejecuta el contenido completo de `database/users-can-drive-migration.sql`

**Este script:**
- Intenta eliminar la columna `driver_type` (si no existe, verás error #1091 - **IGNÓRALO**)
- Intenta agregar la columna `can_drive` (si ya existe, verás error #1060 - **IGNÓRALO**)
- Actualiza usuarios existentes con role = 'Driver' a `can_drive = TRUE`

**Nota:** Si ves errores #1091 o #1060, puedes **IGNORARLOS** y continuar con el siguiente paso.

### Paso 2: Regenerar Prisma Client

Después de aplicar la migración SQL, regenera el Prisma Client:

```powershell
# Detén el servidor si está corriendo (Ctrl+C)

# Regenera Prisma Client
npm run db:generate
```

### Paso 3: Reiniciar el servidor

Reinicia completamente el servidor de desarrollo:

```powershell
# Si hay procesos de Node.js corriendo, deténlos primero
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# Limpia la caché de Next.js (opcional pero recomendado)
Remove-Item -Recurse -Force .next

# Regenera Prisma Client nuevamente (por si acaso)
npm run db:generate

# Inicia el servidor
npm run dev
```

## Verificación

Después de estos pasos, verifica que:

1. ✅ La columna `can_drive` existe en la tabla `users` (verifica en phpMyAdmin)
2. ✅ La columna `driver_type` NO existe en la tabla `users`
3. ✅ No hay errores al iniciar el servidor
4. ✅ Puedes acceder a la página de usuarios sin errores
5. ✅ El campo "Habilitado para conducir" funciona correctamente

## Si el error persiste

Si después de estos pasos el error continúa:

1. **Verifica el schema de Prisma:**
   - Asegúrate de que el modelo `User` tiene `canDrive Boolean @default(false) @map("can_drive")`
   - Asegúrate de que NO hay referencias a `driverType` o `DriverType`

2. **Verifica la base de datos:**
   - Confirma que la columna `can_drive` existe: `SHOW COLUMNS FROM users;`
   - Verifica que `driver_type` NO existe

3. **Reinicia completamente:**
   - Cierra todas las terminales
   - Cierra el editor/IDE
   - Abre todo de nuevo y sigue los pasos 2 y 3
