# Solución: Error "Unknown field `project` for include statement"

## Problema

El error indica que Prisma Client no reconoce la relación `project` en el modelo `User`. Esto ocurre porque:

1. **La migración SQL no se ha aplicado** - Las columnas `phone` y `project_id` no existen en la tabla `users`
2. **Prisma Client no se ha regenerado** - El cliente está usando una versión antigua del schema

## Solución Paso a Paso

### Paso 1: Aplicar la migración SQL

**IMPORTANTE:** Debes aplicar la migración SQL **ANTES** de regenerar Prisma Client.

1. Abre phpMyAdmin o tu cliente MySQL
2. Selecciona tu base de datos
3. Ejecuta el contenido completo de `database/users-phone-project-migration.sql`

**Si la foreign key falla** (porque la tabla `projects` no existe o no tiene datos):
- Ejecuta solo las primeras 3 líneas (sin la foreign key)
- La foreign key la puedes agregar después cuando tengas proyectos

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

1. ✅ Las columnas `phone` y `project_id` existen en la tabla `users` (verifica en phpMyAdmin)
2. ✅ No hay errores al iniciar el servidor
3. ✅ Puedes acceder a la página de usuarios sin errores

## Si el error persiste

Si después de estos pasos el error continúa:

1. **Verifica el schema de Prisma:**
   - Asegúrate de que el modelo `User` tiene la relación `project` definida
   - Asegúrate de que el modelo `Project` tiene la relación `users` definida

2. **Verifica la base de datos:**
   - Confirma que las columnas existen: `SHOW COLUMNS FROM users;`
   - Verifica que la foreign key existe (si la aplicaste): `SHOW CREATE TABLE users;`

3. **Reinicia completamente:**
   - Cierra todas las terminales
   - Cierra el editor/IDE
   - Abre todo de nuevo y sigue los pasos 2 y 3
