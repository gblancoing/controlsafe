/**
 * Script de migración de datos mock a MySQL
 * Ejecutar después de crear las tablas con schema.sql
 * 
 * Uso: npx tsx database/migrate-data.ts
 */

import { PrismaClient } from '@prisma/client';
import { mockUsers, mockVehicles, mockMaintenanceTasks, mockTorqueRecords, vec001MaintenanceHistory } from '../src/lib/data';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando migración de datos a MySQL...\n');

  try {
    // 1. Migrar usuarios
    console.log('📝 Migrando usuarios...');
    for (const user of mockUsers) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {
          name: user.name,
          email: user.email,
          role: user.role as any,
          avatarUrl: user.avatarUrl,
        },
        create: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as any,
          avatarUrl: user.avatarUrl,
        },
      });
    }
    console.log(`✅ ${mockUsers.length} usuarios migrados\n`);

    // 2. Migrar vehículos
    console.log('🚛 Migrando vehículos...');
    for (const vehicle of mockVehicles) {
      await prisma.vehicle.upsert({
        where: { id: vehicle.id },
        update: {
          name: vehicle.name,
          type: vehicle.type as any,
          status: vehicle.status as any,
          mileage: vehicle.mileage,
          operatingHours: vehicle.operatingHours,
          site: vehicle.site,
        },
        create: {
          id: vehicle.id,
          name: vehicle.name,
          type: vehicle.type as any,
          status: vehicle.status as any,
          mileage: vehicle.mileage,
          operatingHours: vehicle.operatingHours,
          site: vehicle.site,
        },
      });
    }
    console.log(`✅ ${mockVehicles.length} vehículos migrados\n`);

    // 3. Migrar tareas de mantenimiento
    console.log('🔧 Migrando tareas de mantenimiento...');
    for (const task of mockMaintenanceTasks) {
      await prisma.maintenanceTask.upsert({
        where: { id: task.id },
        update: {
          vehicleId: task.vehicleId,
          task: task.task,
          dueDate: new Date(task.dueDate),
          status: task.status as any,
          priority: task.priority as any,
          assignee: task.assignee || null,
        },
        create: {
          id: task.id,
          vehicleId: task.vehicleId,
          task: task.task,
          dueDate: new Date(task.dueDate),
          status: task.status as any,
          priority: task.priority as any,
          assignee: task.assignee || null,
        },
      });
    }
    console.log(`✅ ${mockMaintenanceTasks.length} tareas migradas\n`);

    // 4. Migrar registros de torque
    console.log('🔩 Migrando registros de torque...');
    for (const record of mockTorqueRecords) {
      await prisma.torqueRecord.upsert({
        where: { id: record.id },
        update: {
          vehicleId: record.vehicleId,
          component: record.component,
          requiredTorque: record.requiredTorque,
          appliedTorque: record.appliedTorque,
          technician: record.technician,
          tool: record.tool,
          date: new Date(record.date),
          status: record.status as any,
        },
        create: {
          id: record.id,
          vehicleId: record.vehicleId,
          component: record.component,
          requiredTorque: record.requiredTorque,
          appliedTorque: record.appliedTorque,
          technician: record.technician,
          tool: record.tool,
          date: new Date(record.date),
          status: record.status as any,
        },
      });
    }
    console.log(`✅ ${mockTorqueRecords.length} registros de torque migrados\n`);

    // 5. Migrar historial de mantenimiento
    console.log('📋 Migrando historial de mantenimiento...');
    for (const record of vec001MaintenanceHistory) {
      // Crear el registro principal
      await prisma.maintenanceRecord.upsert({
        where: { recordId: record.recordId },
        update: {
          vehicleId: record.vehicleId,
          date: new Date(record.date),
          description: record.description,
          technician: record.technician,
          operatingHours: record.operatingHours,
        },
        create: {
          recordId: record.recordId,
          vehicleId: record.vehicleId,
          date: new Date(record.date),
          description: record.description,
          technician: record.technician,
          operatingHours: record.operatingHours,
        },
      });

      // Eliminar partes existentes y crear nuevas
      await prisma.maintenanceRecordPart.deleteMany({
        where: { recordId: record.recordId },
      });

      // Crear las partes reemplazadas
      if (record.partsReplaced && record.partsReplaced.length > 0) {
        await prisma.maintenanceRecordPart.createMany({
          data: record.partsReplaced.map((part) => ({
            recordId: record.recordId,
            partName: part.partName,
            quantity: part.quantity,
          })),
        });
      }
    }
    console.log(`✅ ${vec001MaintenanceHistory.length} registros de historial migrados\n`);

    console.log('✨ Migración completada exitosamente!');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
