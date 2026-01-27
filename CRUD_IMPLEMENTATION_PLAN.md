# 📋 Plan de Implementación CRUD - ControlSafe

## 🎯 Objetivo
Implementar funcionalidad completa de Create, Read, Update, Delete (CRUD) para todas las entidades del sistema.

## 📊 Análisis de Estado Actual

### ✅ Entidades Existentes (con datos)
- **Users** - Usuarios del sistema
- **Vehicles** - Vehículos de la flota
- **MaintenanceTasks** - Tareas de mantenimiento
- **TorqueRecords** - Registros de torque
- **MaintenanceRecords** - Historial de mantenimiento

### ❌ Entidades Faltantes (solo en UI)
- **Companies** (Empresas) - No existe en BD
- **Regions** (Regiones) - No existe en BD
- **Sites** (Faenas) - Actualmente solo como string en vehicles

### 🔍 Observaciones
1. Los formularios de diálogo existen pero **no están funcionales** (no tienen Server Actions)
2. Los componentes usan **Server Components** para leer datos
3. Se necesita implementar **Server Actions** para mutaciones (create/update/delete)
4. Los formularios necesitan **react-hook-form + zod** para validación

## 🏗️ Arquitectura Propuesta

### 1. Base de Datos
```
companies (Empresas)
  └─ id, name, rut, address, phone, email, contact_person

regions (Regiones)
  └─ id, name, code, country

sites (Faenas)
  └─ id, name, region_id → regions, company_id → companies, address, coordinates, status

vehicles (Vehículos) - ACTUALIZAR
  └─ Agregar site_id → sites (relación FK)
```

### 2. Estructura de Archivos

```
src/
├── app/
│   ├── actions/
│   │   ├── companies.ts      # Server Actions para empresas
│   │   ├── regions.ts        # Server Actions para regiones
│   │   ├── sites.ts          # Server Actions para faenas
│   │   ├── vehicles.ts       # Server Actions para vehículos
│   │   ├── users.ts          # Server Actions para usuarios
│   │   ├── maintenance.ts    # Server Actions para mantenimiento
│   │   └── torque.ts         # Server Actions para torque
│   └── [páginas existentes]
├── lib/
│   ├── db-queries.ts         # Funciones de lectura (expandir)
│   └── db-mutations.ts       # Funciones de escritura (nuevo)
└── components/
    └── [componentes existentes - actualizar con formularios funcionales]
```

### 3. Patrón de Implementación

#### Server Actions (src/app/actions/[entidad].ts)
```typescript
'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema de validación
const createSchema = z.object({ ... });

// Crear
export async function createEntity(data: FormData) {
  // Validar
  // Insertar en BD
  // Revalidar path
  // Retornar resultado
}

// Actualizar
export async function updateEntity(id: string, data: FormData) { ... }

// Eliminar
export async function deleteEntity(id: string) { ... }
```

#### Componentes de Formulario
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEntity } from '@/app/actions/[entidad]';
import { useRouter } from 'next/navigation';

// Formulario con validación y submit
```

## 📝 Plan de Implementación por Fases

### Fase 1: Base de Datos ✅
- [x] Crear script SQL para tablas faltantes
- [ ] Ejecutar script en MySQL
- [ ] Actualizar Prisma schema
- [ ] Generar Prisma client

### Fase 2: Server Actions
- [ ] Crear Server Actions para Companies
- [ ] Crear Server Actions para Regions
- [ ] Crear Server Actions para Sites
- [ ] Crear Server Actions para Vehicles
- [ ] Crear Server Actions para Users
- [ ] Crear Server Actions para MaintenanceTasks
- [ ] Crear Server Actions para TorqueRecords

### Fase 3: Funciones de Consulta
- [ ] Expandir `db-queries.ts` con funciones para nuevas entidades
- [ ] Agregar funciones de búsqueda y filtrado

### Fase 4: Componentes de Formulario
- [ ] Crear componente `CompanyForm` funcional
- [ ] Crear componente `RegionForm` funcional
- [ ] Crear componente `SiteForm` funcional
- [ ] Actualizar `VehicleForm` (si existe) o crear nuevo
- [ ] Actualizar `MaintenanceSchedule` con formulario funcional
- [ ] Actualizar `TorqueLog` con formulario funcional
- [ ] Crear componente `UserForm` funcional

### Fase 5: Páginas CRUD Completas
- [ ] Página `/empresas` - Lista + Crear/Editar/Eliminar
- [ ] Página `/regiones` - Lista + Crear/Editar/Eliminar
- [ ] Página `/faenas` - Lista + Crear/Editar/Eliminar
- [ ] Página `/flota` - Lista + Crear/Editar/Eliminar
- [ ] Página `/usuarios` - Lista + Crear/Editar/Eliminar
- [ ] Página `/mantenimiento` - Ya tiene lista, agregar CRUD
- [ ] Página `/torque` - Ya tiene lista, agregar CRUD

## 🔧 Tecnologías y Patrones

### Validación
- **Zod** - Schemas de validación
- **react-hook-form** - Manejo de formularios
- **@hookform/resolvers** - Integración zod + react-hook-form

### Estado y Navegación
- **Server Actions** - Mutaciones del servidor
- **revalidatePath** - Invalidación de cache
- **useRouter** - Navegación del cliente

### UI
- **Dialog** - Modales para formularios
- **Form** - Componentes de formulario (shadcn/ui)
- **Toast** - Notificaciones de éxito/error

## 📋 Checklist de Implementación

### Prioridad Alta (Core CRUD)
1. ✅ Crear tablas en BD
2. ⏳ Server Actions básicas (create)
3. ⏳ Formularios funcionales
4. ⏳ Integración en páginas

### Prioridad Media (Mejoras)
- Validación completa
- Mensajes de error
- Confirmación de eliminación
- Loading states

### Prioridad Baja (UX)
- Búsqueda y filtrado
- Paginación
- Ordenamiento
- Exportación de datos

## 🚀 Próximos Pasos Inmediatos

1. **Ejecutar script SQL** para crear tablas faltantes
2. **Actualizar Prisma schema** con nuevas entidades
3. **Crear Server Actions base** para una entidad (ej: Companies)
4. **Implementar formulario funcional** como ejemplo
5. **Replicar patrón** para otras entidades

---

**Nota**: Este plan sigue el patrón ya establecido en el código (Server Components + Server Actions + Client Components para formularios).
