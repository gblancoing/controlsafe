# 🔄 Migración de Estructura Firebase a MySQL

## 📊 Resumen de Cambios

Se ha actualizado el esquema de MySQL para reflejar la estructura original de Firebase, incluyendo las nuevas entidades y relaciones.

## 🆕 Nuevas Entidades Agregadas

### 1. **Projects (Proyectos)**
- **Propósito**: Almacena los proyectos vinculados a empresas mandantes
- **Campos principales**:
  - `id`, `name`, `region`
  - `clientCompanyId` → referencia a `companies` (empresa mandante)
- **Relaciones**:
  - Many-to-Many con `companies` (subcontratistas) a través de `project_subcontractors`

### 2. **MaintenanceProgram (Programas de Mantenimiento)**
- **Propósito**: Plantillas reutilizables de mantenimiento (ej: "Servicio de 1000 horas")
- **Campos principales**:
  - `id`, `name`, `description`
  - `frequencyValue`, `frequencyUnit` (ej: 1000, "Horas de Operación")
- **Relaciones**:
  - One-to-Many con `maintenance_program_tasks` (tareas del programa)
  - Many-to-Many con `vehicles` a través de `vehicle_maintenance_programs`

### 3. **Intervention (Intervenciones)**
- **Propósito**: Historial de mantenimientos realizados (equivalente a la subcolección `interventions` de Firebase)
- **Campos principales**:
  - `id`, `vehicleId`, `task`, `date`, `technician`, `notes`
- **Relaciones**:
  - Many-to-One con `vehicles`

## 🔄 Entidades Actualizadas

### **Vehicle (Vehículos)**
Se agregaron campos adicionales para coincidir con Firebase:
- `patent` (patente del vehículo)
- `brand` (marca)
- `model` (modelo)
- `year` (año)
- `companyId` → referencia a `companies` (empresa propietaria)

**Relaciones nuevas**:
- Many-to-One con `companies`
- Many-to-Many con `maintenance_programs` (programas asignados)

### **Company (Empresas)**
**Relaciones nuevas**:
- One-to-Many con `vehicles` (vehículos propios)
- One-to-Many con `projects` (proyectos como cliente mandante)
- Many-to-Many con `projects` (como subcontratista)

## 📋 Tablas Intermedias (Many-to-Many)

1. **`project_subcontractors`**
   - Relaciona `projects` con `companies` (subcontratistas)
   - Campos: `project_id`, `company_id`

2. **`vehicle_maintenance_programs`**
   - Relaciona `vehicles` con `maintenance_programs` (programas asignados)
   - Campos: `vehicle_id`, `program_id`

## 🗂️ Estructura Completa de Tablas

```
companies
  ├── sites (One-to-Many)
  ├── vehicles (One-to-Many)
  ├── projects (One-to-Many como cliente)
  └── project_subcontractors (Many-to-Many como subcontratista)

projects
  ├── clientCompany (Many-to-One → companies)
  └── subcontractors (Many-to-Many → companies via project_subcontractors)

maintenance_programs
  ├── tasks (One-to-Many → maintenance_program_tasks)
  └── vehicles (Many-to-Many → vehicles via vehicle_maintenance_programs)

vehicles
  ├── company (Many-to-One → companies)
  ├── siteRelation (Many-to-One → sites)
  ├── maintenanceTasks (One-to-Many)
  ├── torqueRecords (One-to-Many)
  ├── maintenanceRecords (One-to-Many)
  ├── interventions (One-to-Many) ← NUEVO
  └── assignedPrograms (Many-to-Many → maintenance_programs)
```

## 🚀 Pasos para Aplicar la Migración

### Paso 1: Ejecutar Script SQL

1. Abre **phpMyAdmin** (http://localhost/phpmyadmin)
2. Selecciona la base de datos `controlsafe`
3. Ve a la pestaña **SQL**
4. Copia y pega el contenido completo de `database/firebase-structure-migration.sql`
5. Haz clic en **Continuar**

### Paso 2: Regenerar Prisma Client

```bash
npm run db:generate
```

**Importante**: Cierra el servidor de desarrollo antes de ejecutar este comando.

### Paso 3: Verificar

```bash
# Abrir Prisma Studio para ver las nuevas tablas
npm run db:studio
```

Deberías ver las nuevas tablas:
- `projects`
- `maintenance_programs`
- `maintenance_program_tasks`
- `vehicle_maintenance_programs`
- `interventions`
- `project_subcontractors`

## 📝 Mapeo Firebase → MySQL

| Firebase | MySQL | Notas |
|----------|-------|-------|
| `companies/{id}` | `companies` | ✅ Ya existía, actualizado con relaciones |
| `projects/{id}` | `projects` | 🆕 Nueva tabla |
| `users/{id}` | `users` | ✅ Ya existía |
| `maintenance-programs/{id}` | `maintenance_programs` | 🆕 Nueva tabla |
| `vehicles/{id}` | `vehicles` | ✅ Actualizado con nuevos campos |
| `vehicles/{id}/interventions/{id}` | `interventions` | 🆕 Nueva tabla (subcolección → tabla) |

## 🔗 Relaciones Many-to-Many

En Firebase, las relaciones many-to-many se manejan con arrays de IDs. En MySQL, se usan tablas intermedias:

### Firebase:
```javascript
// En vehicles/{id}
assignedProgramIds: ['prog-001', 'prog-002']

// En projects/{id}
subcontractorIds: ['comp-002', 'comp-003']
```

### MySQL:
```sql
-- Tabla vehicle_maintenance_programs
vehicle_id | program_id
-----------|-----------
vec-001    | prog-001
vec-001    | prog-002

-- Tabla project_subcontractors
project_id | company_id
-----------|-----------
proj-001   | comp-002
proj-001   | comp-003
```

## ⚠️ Notas Importantes

1. **Compatibilidad hacia atrás**: Los campos antiguos de `vehicles` (`site` como string) se mantienen para compatibilidad.

2. **Interventions vs MaintenanceRecords**: 
   - `interventions` es el equivalente directo de la subcolección de Firebase
   - `maintenance_records` puede seguir existiendo para datos históricos o diferentes propósitos

3. **IDs**: Se mantiene el formato de IDs como strings (ej: `prog-001`, `interv-001`) para facilitar la migración de datos.

4. **Foreign Keys**: Todas las relaciones tienen `ON DELETE CASCADE` o `ON DELETE SET NULL` según corresponda.

## 📚 Próximos Pasos

1. ✅ Schema actualizado
2. ✅ Script SQL creado
3. ⏳ Ejecutar script SQL en MySQL
4. ⏳ Regenerar Prisma Client
5. ⏳ Crear Server Actions para las nuevas entidades
6. ⏳ Actualizar componentes UI para usar las nuevas estructuras
7. ⏳ Migrar datos existentes (si aplica)

---

**¿Necesitas ayuda?** Revisa los archivos:
- `database/firebase-structure-migration.sql` - Script SQL completo
- `prisma/schema.prisma` - Esquema de Prisma actualizado
- `src/lib/types.ts` - Tipos TypeScript actualizados
