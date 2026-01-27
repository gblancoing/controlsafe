# Configuración de Gestión de Usuarios

## Pasos para aplicar los cambios

### 1. Ejecutar la Migración SQL

Ejecuta el siguiente archivo SQL en phpMyAdmin o tu cliente MySQL:

**Archivo:** `database/users-vehicles-migration.sql`

Este script:
- Agrega la columna `company_id` a la tabla `users`
- Agrega la columna `driver_type` a la tabla `users`
- Crea la tabla `user_vehicles` para la relación muchos-a-muchos entre usuarios y vehículos

### 2. Regenerar Prisma Client

**IMPORTANTE:** Cierra el servidor de desarrollo de Next.js antes de ejecutar este comando.

```bash
npm run db:generate
```

O si prefieres usar Prisma directamente:

```bash
npx prisma generate
```

### 3. Reiniciar el servidor de desarrollo

Después de regenerar Prisma Client, reinicia el servidor:

```bash
npm run dev
```

## Verificación

Una vez completados los pasos, deberías poder:

1. Ver la página de usuarios en `/usuarios`
2. Filtrar usuarios por empresa
3. Crear usuarios con empresa asignada
4. Asignar vehículos a choferes
5. Ver los vehículos asignados en la tabla de usuarios

## Solución de problemas

Si encuentras el error "Unknown field `company` for include statement":
- Asegúrate de haber cerrado el servidor de desarrollo
- Ejecuta `npm run db:generate` nuevamente
- Verifica que la migración SQL se haya ejecutado correctamente
