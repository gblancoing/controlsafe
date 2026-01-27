# Configuración: Programas de Mantenimiento

## Cambios Realizados

Se ha implementado la funcionalidad completa de gestión de programas de mantenimiento según las especificaciones de las imágenes proporcionadas.

### 1. Schema de Prisma Actualizado

Se agregó el campo `applicableVehicleType` al modelo `MaintenanceProgram`:
- Campo: `applicableVehicleType` (opcional)
- Valores posibles: 'Todos los tipos', 'Camioneta', 'Vehículo Liviano', 'Camión', 'Maquinaria Pesada'

### 2. Componentes Creados

- **`AddMaintenanceProgramButton`**: Formulario para crear nuevos programas
- **`ProgramsTable`**: Tabla que muestra todos los programas registrados
- **`ProgramActions`**: Menú de acciones (Ver, Editar, Eliminar)
- **`ViewProgramDialog`**: Diálogo para ver detalles del programa
- **`EditProgramDialog`**: Diálogo para editar programas existentes

### 3. Server Actions

Se creó `src/app/mantenimiento/actions.ts` con:
- `getMaintenancePrograms()`: Obtener todos los programas
- `getMaintenanceProgramById()`: Obtener un programa por ID
- `createMaintenanceProgram()`: Crear nuevo programa
- `updateMaintenanceProgram()`: Actualizar programa existente
- `deleteMaintenanceProgram()`: Eliminar programa

## Pasos para Aplicar

### Paso 1: Aplicar Migración SQL

Ejecuta en phpMyAdmin o tu cliente MySQL:

**Archivo:** `database/add-applicable-vehicle-type.sql`

Este script:
- Agrega la columna `applicable_vehicle_type` a la tabla `maintenance_programs`
- Crea un índice para mejorar las búsquedas

**Nota:** Si la columna o el índice ya existen, puedes ignorar los errores.

### Paso 2: Regenerar Prisma Client

```powershell
# Detén el servidor si está corriendo (Ctrl+C)

# Regenera Prisma Client
npm run db:generate
```

### Paso 3: Reiniciar el Servidor

```powershell
# Si hay procesos de Node.js corriendo, deténlos primero
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# Limpia la caché de Next.js
Remove-Item -Recurse -Force .next

# Regenera Prisma Client nuevamente
npm run db:generate

# Inicia el servidor
npm run dev
```

## Campos del Formulario

El formulario de creación de programas incluye:

1. **Nombre del Programa**: Campo de texto obligatorio
2. **Descripción**: Campo de texto largo (opcional)
3. **Tipo de Vehículo Aplicable**: Selector con opciones:
   - Todos los tipos
   - Camioneta
   - Vehículo Liviano
   - Camión
   - Maquinaria Pesada
4. **Frecuencia**: Campo numérico (obligatorio, mínimo 1)
5. **Unidad**: Selector con opciones:
   - Horas de Operación
   - Kilómetros
   - Días
   - Semanas
   - Meses
   - Años

## Funcionalidades

- ✅ Crear programas de mantenimiento
- ✅ Ver lista de programas en tabla
- ✅ Ver detalles del programa (ficha)
- ✅ Editar programas existentes
- ✅ Eliminar programas
- ✅ Filtrado por tipo de vehículo aplicable
- ✅ Visualización de frecuencia con unidad

## Verificación

Después de aplicar los cambios, verifica que:

1. ✅ Puedes acceder a `/mantenimiento`
2. ✅ Aparece el botón "Crear Programa"
3. ✅ El formulario muestra todos los campos correctamente
4. ✅ Puedes crear un programa con éxito
5. ✅ La tabla muestra los programas creados
6. ✅ Las acciones (Ver, Editar, Eliminar) funcionan correctamente
