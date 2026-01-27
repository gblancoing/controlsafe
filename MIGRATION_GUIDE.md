# 🗄️ Guía de Migración a MySQL - ControlSafe

## 📊 Análisis de la Base de Datos Actual

### Estado Actual
- **Base de datos**: Datos mock/estáticos en `src/lib/data.ts`
- **Firebase**: Instalado pero NO utilizado
- **Estructura**: 5 tipos de datos principales (Users, Vehicles, MaintenanceTasks, TorqueRecords, MaintenanceRecords)

### Estructura de Datos Identificada

1. **Users** - Usuarios del sistema (4 roles: Administrator, Supervisor, Technician, Driver)
2. **Vehicles** - Vehículos de la flota minera (4 tipos: Excavator, Haul Truck, Dozer, Loader)
3. **MaintenanceTasks** - Tareas de mantenimiento programadas
4. **TorqueRecords** - Registros de torque de componentes críticos
5. **MaintenanceRecords** - Historial completo de mantenimiento con partes reemplazadas

## 🎯 Plan de Migración

### Fase 1: Preparación ✅ (Completado)
- [x] Crear esquema SQL (`database/schema.sql`)
- [x] Configurar Prisma ORM (`prisma/schema.prisma`)
- [x] Crear script de migración de datos (`database/migrate-data.ts`)
- [x] Crear funciones de acceso a datos (`src/lib/db-queries.ts`)
- [x] Configurar variables de entorno (`.env.example`)

### Fase 2: Instalación y Configuración
1. Instalar dependencias de Prisma
2. Configurar conexión a MySQL
3. Crear base de datos y tablas
4. Migrar datos mock

### Fase 3: Integración
1. Actualizar componentes para usar datos de MySQL
2. Reemplazar imports de `data.ts` por `db-queries.ts`
3. Probar funcionalidad completa

## 🚀 Pasos para Ejecutar la Migración

### Paso 1: Instalar Dependencias

```bash
npm install
```

Esto instalará:
- `@prisma/client` - Cliente ORM
- `prisma` - CLI de Prisma
- `tsx` - Ejecutor de TypeScript

### Paso 2: Configurar MySQL

#### Opción A: XAMPP (Local)
1. Inicia el servicio MySQL en XAMPP
2. Abre phpMyAdmin (http://localhost/phpmyadmin)
3. Crea una base de datos llamada `controlsafe` (o ejecuta el script SQL completo)

#### Opción B: MySQL Remoto
Configura tu conexión en `.env.local`

### Paso 3: Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env.local
```

Editar `.env.local`:

```env
# Para XAMPP (usuario root sin contraseña)
DATABASE_URL="mysql://root@localhost:3306/controlsafe"

# Para MySQL con contraseña
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/controlsafe"
```

### Paso 4: Crear la Base de Datos

#### Método 1: Script SQL Directo (Recomendado para inicio rápido)

1. Abre phpMyAdmin o MySQL Workbench
2. Ejecuta el contenido completo de `database/schema.sql`
3. Esto creará todo: base de datos, tablas y datos iniciales

#### Método 2: Usando Prisma (Recomendado para desarrollo)

```bash
# 1. Generar el cliente de Prisma
npm run db:generate

# 2. Crear las tablas (sincroniza el esquema)
npm run db:push

# 3. Migrar los datos mock
npm run db:seed
```

### Paso 5: Verificar la Migración

```bash
# Abrir Prisma Studio (interfaz visual)
npm run db:studio
```

Esto abrirá http://localhost:5555 donde podrás ver y editar los datos.

## 📁 Archivos Creados

### Base de Datos
- `database/schema.sql` - Esquema SQL completo
- `database/migrate-data.ts` - Script de migración TypeScript
- `database/README.md` - Documentación detallada

### Prisma
- `prisma/schema.prisma` - Esquema de Prisma ORM

### Código
- `src/lib/db.ts` - Cliente de Prisma (singleton)
- `src/lib/db-queries.ts` - Funciones de consulta a la base de datos

### Configuración
- `.env.example` - Plantilla de variables de entorno
- `package.json` - Scripts actualizados

## 🔄 Próximos Pasos (Pendientes)

### Actualizar Componentes

Los siguientes componentes necesitan actualizarse para usar datos de MySQL:

1. **`src/components/dashboard/overview.tsx`**
   - Cambiar: `import { mockVehicles, mockMaintenanceTasks } from '@/lib/data'`
   - Por: `import { getVehicles, getMaintenanceTasks } from '@/lib/db-queries'`

2. **`src/components/dashboard/maintenance-schedule.tsx`**
   - Cambiar: `import { mockMaintenanceTasks, mockVehicles } from '@/lib/data'`
   - Por: `import { getMaintenanceTasks, getVehicles } from '@/lib/db-queries'`

3. **`src/components/dashboard/torque-log.tsx`**
   - Cambiar: `import { mockTorqueRecords, mockVehicles } from '@/lib/data'`
   - Por: `import { getTorqueRecords, getVehicles } from '@/lib/db-queries'`

4. **`src/components/dashboard/fleet-overview-chart.tsx`**
   - Cambiar: `import { mockVehicles } from '@/lib/data'`
   - Por: `import { getVehicles } from '@/lib/db-queries'`

5. **`src/components/dashboard/predictive-advisor.tsx`**
   - Cambiar: `import { mockVehicles, vec001MaintenanceHistory } from '@/lib/data'`
   - Por: `import { getVehicles, getMaintenanceRecordsByVehicle } from '@/lib/db-queries'`

### Convertir a Server Components

Como Next.js 15 usa Server Components por defecto, los componentes del dashboard deberían:

1. Ser Server Components (eliminar `'use client'` donde sea posible)
2. Hacer las consultas directamente en el componente
3. Pasar datos como props a componentes client cuando sea necesario

Ejemplo:

```tsx
// Antes (Client Component)
'use client';
import { mockVehicles } from '@/lib/data';

// Después (Server Component)
import { getVehicles } from '@/lib/db-queries';

export async function Overview() {
  const vehicles = await getVehicles();
  const tasks = await getMaintenanceTasks();
  // ...
}
```

## 📊 Estructura de la Base de Datos

### Tablas

1. **users** - Usuarios del sistema
2. **vehicles** - Vehículos de la flota
3. **maintenance_tasks** - Tareas de mantenimiento
4. **torque_records** - Registros de torque
5. **maintenance_records** - Historial de mantenimiento
6. **maintenance_record_parts** - Partes reemplazadas (normalizado)

### Relaciones

```
vehicles (1) ──→ (N) maintenance_tasks
vehicles (1) ──→ (N) torque_records
vehicles (1) ──→ (N) maintenance_records
maintenance_records (1) ──→ (N) maintenance_record_parts
```

## ⚠️ Notas Importantes

1. **XAMPP**: Asegúrate de que MySQL esté corriendo antes de ejecutar migraciones
2. **Puerto**: MySQL por defecto usa 3306
3. **Charset**: El esquema usa `utf8mb4` para soportar caracteres especiales
4. **Backup**: Siempre haz backup antes de migraciones en producción
5. **IDs**: Los IDs actuales son strings (user-1, vec-001, etc.). Prisma puede generar UUIDs automáticamente si prefieres

## 🐛 Solución de Problemas

### Error: "Can't connect to MySQL server"
- Verifica que MySQL esté corriendo en XAMPP
- Revisa el puerto 3306
- Verifica credenciales en `.env.local`

### Error: "Access denied for user"
- En XAMPP, el usuario por defecto es `root` sin contraseña
- Verifica: `DATABASE_URL="mysql://root@localhost:3306/controlsafe"`

### Error: "Database doesn't exist"
- Crea la base de datos manualmente o ejecuta `schema.sql` completo

### Error: "Prisma Client not generated"
- Ejecuta: `npm run db:generate`

## 📝 Scripts Disponibles

```bash
npm run db:generate  # Genera el cliente de Prisma
npm run db:push      # Sincroniza esquema (desarrollo)
npm run db:migrate   # Crea migración formal (producción)
npm run db:studio    # Abre Prisma Studio (interfaz visual)
npm run db:seed      # Ejecuta migración de datos mock
```

## ✅ Checklist de Migración

- [ ] Instalar dependencias (`npm install`)
- [ ] Configurar `.env.local` con `DATABASE_URL`
- [ ] Crear base de datos MySQL
- [ ] Ejecutar `schema.sql` o usar Prisma (`db:push`)
- [ ] Ejecutar migración de datos (`db:seed`)
- [ ] Verificar datos en Prisma Studio (`db:studio`)
- [ ] Actualizar componentes para usar `db-queries.ts`
- [ ] Probar funcionalidad completa
- [ ] Eliminar o comentar `data.ts` (opcional)

---

**¿Necesitas ayuda?** Revisa `database/README.md` para más detalles.
