# Configuración: Cambio de "Tipo Chofer" a "Habilitado para conducir"

## Cambios Realizados

Se ha reemplazado el campo `driverType` (enum: Administrativo/Normal) por un campo booleano `canDrive` (Habilitado para conducir).

## Pasos para Aplicar

### 1. Aplicar la migración SQL

Ejecuta el siguiente script SQL en tu base de datos MySQL (phpMyAdmin):

**Archivo:** `database/users-can-drive-migration.sql`

Este script:
- Elimina la columna `driver_type` (enum)
- Agrega la columna `can_drive` (BOOLEAN, default FALSE)
- Actualiza usuarios existentes con role = 'Driver' a `can_drive = TRUE`

### 2. Regenerar Prisma Client

Después de aplicar la migración SQL:

```powershell
npm run db:generate
```

### 3. Reiniciar el servidor

```powershell
# Detén el servidor si está corriendo (Ctrl+C)
# Limpia la caché
Remove-Item -Recurse -Force .next
# Reinicia
npm run dev
```

## Cambios en la Interfaz

### Tabla de Usuarios
- **Antes:** Columna "Tipo Chofer" mostraba "Administrativo" o "Normal"
- **Ahora:** Columna "Habilitado para conducir" muestra "Sí" (badge verde) o "No"

### Formularios
- **Antes:** Select con opciones "Administrativo" / "Normal"
- **Ahora:** Checkbox "Habilitado para conducir" (opcional para todos los usuarios)

### Ficha de Usuario
- Muestra un badge verde "Habilitado para conducir" si `canDrive = true`

## Notas

- El campo es opcional y puede ser marcado para cualquier usuario, no solo choferes
- Los vehículos asignados siguen siendo opcionales y se pueden asignar desde la flota de la empresa del usuario
