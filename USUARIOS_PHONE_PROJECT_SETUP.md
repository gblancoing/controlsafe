# Configuración: Campos Celular y Proyecto en Usuarios

## Pasos para aplicar la migración

### 1. Aplicar la migración SQL

Ejecuta el siguiente script SQL en tu base de datos MySQL (phpMyAdmin o cliente MySQL):

**Archivo:** `database/users-phone-project-migration.sql`

Este script:
- Agrega la columna `phone` (VARCHAR(50)) para almacenar el número de celular
- Agrega la columna `project_id` (VARCHAR(50)) para relacionar usuarios con proyectos
- Crea un índice en `project_id` para mejorar el rendimiento
- Agrega una foreign key constraint entre `users.project_id` y `projects.id`

**Nota:** Si la tabla `projects` no existe aún, la foreign key fallará. En ese caso:
1. Primero crea la tabla `projects` (si no existe)
2. Luego ejecuta el script de migración nuevamente, o
3. Ejecuta solo las primeras 3 líneas (sin la foreign key) y agrega la foreign key después

### 2. Regenerar Prisma Client

Después de aplicar la migración SQL, regenera el Prisma Client:

```powershell
npm run db:generate
```

### 3. Reiniciar el servidor de desarrollo

Si el servidor está corriendo, deténlo (Ctrl+C) y reinícialo:

```powershell
npm run dev
```

## Verificación

Después de aplicar estos pasos, deberías poder:
- ✅ Registrar usuarios con número de celular
- ✅ Asignar usuarios a proyectos
- ✅ Ver el celular y proyecto en la ficha del usuario
- ✅ Editar el celular y proyecto de usuarios existentes

## Solución de problemas

### Error: "No se pudo crear el usuario"

Si ves este error después de aplicar la migración:
1. Verifica que las columnas `phone` y `project_id` existen en la tabla `users`
2. Verifica que el Prisma Client se regeneró correctamente
3. Reinicia el servidor de desarrollo completamente

### Error: Foreign key constraint fails

Si la foreign key falla:
- Asegúrate de que la tabla `projects` existe
- Verifica que los `project_id` que intentas asignar existen en la tabla `projects`
- Si es necesario, puedes crear la foreign key después de tener datos en ambas tablas
