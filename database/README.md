# Migración a MySQL - ControlSafe

Este directorio contiene todos los archivos necesarios para migrar el proyecto de datos mock a MySQL.

## 📋 Estructura

- `schema.sql` - Esquema SQL completo para crear todas las tablas
- `migrate-data.ts` - Script TypeScript para migrar datos mock a MySQL

## 🚀 Pasos para la Migración

### 1. Instalar Dependencias

```bash
npm install
```

Esto instalará:
- `@prisma/client` - Cliente de Prisma ORM
- `prisma` - CLI de Prisma (dev dependency)
- `tsx` - Ejecutor de TypeScript

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
```

Edita `.env.local` y configura tu conexión a MySQL:

```env
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/controlsafe"
```

**Nota:** Si usas XAMPP, el usuario por defecto es `root` y la contraseña suele estar vacía:
```env
DATABASE_URL="mysql://root@localhost:3306/controlsafe"
```

### 3. Crear la Base de Datos

Tienes dos opciones:

#### Opción A: Usar el script SQL directamente

1. Abre phpMyAdmin (http://localhost/phpmyadmin) o MySQL Workbench
2. Ejecuta el contenido de `database/schema.sql`
3. Esto creará la base de datos y todas las tablas con datos iniciales

#### Opción B: Usar Prisma (Recomendado)

```bash
# Generar el cliente de Prisma
npm run db:generate

# Crear las tablas en la base de datos
npm run db:push

# Migrar los datos mock
npm run db:seed
```

### 4. Verificar la Migración

Puedes usar Prisma Studio para visualizar los datos:

```bash
npm run db:studio
```

Esto abrirá una interfaz web en http://localhost:5555 donde podrás ver y editar los datos.

## 📊 Estructura de la Base de Datos

### Tablas Principales

1. **users** - Usuarios del sistema
2. **vehicles** - Vehículos de la flota
3. **maintenance_tasks** - Tareas de mantenimiento programadas
4. **torque_records** - Registros de torque de componentes
5. **maintenance_records** - Historial de mantenimiento
6. **maintenance_record_parts** - Partes reemplazadas (relación con maintenance_records)

### Relaciones

- `vehicles` → `maintenance_tasks` (1:N)
- `vehicles` → `torque_records` (1:N)
- `vehicles` → `maintenance_records` (1:N)
- `maintenance_records` → `maintenance_record_parts` (1:N)

## 🔄 Scripts Disponibles

- `npm run db:generate` - Genera el cliente de Prisma
- `npm run db:push` - Sincroniza el esquema con la base de datos (desarrollo)
- `npm run db:migrate` - Crea una migración formal (producción)
- `npm run db:studio` - Abre Prisma Studio (interfaz visual)
- `npm run db:seed` - Ejecuta el script de migración de datos

## ⚠️ Notas Importantes

1. **XAMPP**: Asegúrate de que el servicio MySQL esté corriendo
2. **Puerto**: MySQL por defecto usa el puerto 3306
3. **Charset**: El esquema usa `utf8mb4` para soportar emojis y caracteres especiales
4. **Backup**: Siempre haz backup antes de ejecutar migraciones en producción

### Script SQL: Tipos de desviación (Revisar Control Preventivo)

Para la funcionalidad **Desviaciones detectadas** en el formulario Revisar Control Preventivo, hay que crear las tablas `deviation_types` y `review_deviations` y cargar las causas predefinidas.

**Ejecutar en local y en producción** (MySQL):

```bash
# Desde la raíz del proyecto, con MySQL en PATH:
mysql -u root -p controlsafe < database/add-deviation-types-tables.sql
```

O bien: abrir phpMyAdmin / MySQL Workbench, seleccionar la base `controlsafe`, y ejecutar el contenido de `database/add-deviation-types-tables.sql`.

El script crea las tablas (si no existen) e inserta las 10 causas predefinidas solo cuando la tabla está vacía.

**Tabla Check List de revisión**: Para que los ítems del "Check List de Revisión" (Tipo 1) se gestionen desde Configuración, crea la tabla:

```bash
mysql -u root -p controlsafe < database/add-review-checklist-types-table.sql
```

**Columna "Activo" (is_verification_check) en deviation_types**: Si la tabla `deviation_types` ya existe y quieres añadir la columna para que cada causa pueda activarse/desactivarse en el formulario, ejecuta:

```bash
mysql -u root -p controlsafe < database/add-deviation-type-verification-check.sql
```

### Script SQL: Rol Super Admin

Para habilitar el rol **Super Admin** (acceso total a todos los proyectos y empresas), ejecutar en MySQL:

```bash
mysql -u root -p controlsafe < database/add-super-admin-role.sql
```

O en phpMyAdmin/MySQL Workbench: ejecutar el contenido de `database/add-super-admin-role.sql`. Esto agrega el valor `SuperAdmin` al enum de la columna `role` en la tabla `users`.

## 🐛 Solución de Problemas

### Error: "Can't connect to MySQL server"

- Verifica que MySQL esté corriendo en XAMPP
- Revisa que el puerto 3306 esté disponible
- Verifica las credenciales en `.env.local`

### Error: "Access denied for user"

- Verifica el usuario y contraseña en `.env.local`
- En XAMPP, el usuario por defecto es `root` sin contraseña

### Error: "Database doesn't exist"

- Crea la base de datos manualmente primero:
  ```sql
  CREATE DATABASE controlsafe;
  ```
- O ejecuta el script `schema.sql` completo
