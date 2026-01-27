/**
 * Funciones de consulta a la base de datos MySQL
 * Reemplazan los datos mock de data.ts
 */

import { prisma } from './db';
import type { User, Vehicle, MaintenanceTask, TorqueRecord, MaintenanceRecord } from './types';

// ============================================
// Usuarios
// ============================================
export async function getUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatarUrl: u.avatarUrl || undefined,
  }));
}

export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl || undefined,
  };
}

// ============================================
// Vehículos
// ============================================
export async function getVehicles(): Promise<Vehicle[]> {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      company: true,
    },
    orderBy: { name: 'asc' },
  });

  return vehicles.map((v) => ({
    id: v.id,
    patent: v.patent || undefined,
    name: v.name,
    type: v.type as Vehicle['type'],
    brand: v.brand || undefined,
    model: v.model || undefined,
    year: v.year || undefined,
    status: v.status as Vehicle['status'],
    mileage: v.mileage,
    operatingHours: v.operatingHours,
    site: v.site,
    companyId: v.companyId || undefined,
  }));
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      company: true,
      assignedPrograms: {
        include: {
          program: {
            include: {
              tasks: true,
            },
          },
        },
      },
    },
  });

  if (!vehicle) return null;

  return {
    id: vehicle.id,
    patent: vehicle.patent || undefined,
    name: vehicle.name,
    type: vehicle.type as Vehicle['type'],
    brand: vehicle.brand || undefined,
    model: vehicle.model || undefined,
    year: vehicle.year || undefined,
    status: vehicle.status as Vehicle['status'],
    mileage: vehicle.mileage,
    operatingHours: vehicle.operatingHours,
    site: vehicle.site,
    companyId: vehicle.companyId || undefined,
  };
}

// ============================================
// Tareas de Mantenimiento
// ============================================
export async function getMaintenanceTasks(): Promise<MaintenanceTask[]> {
  const tasks = await prisma.maintenanceTask.findMany({
    orderBy: { dueDate: 'asc' },
    include: {
      vehicle: true,
    },
  });

  return tasks.map((t) => ({
    id: t.id,
    vehicleId: t.vehicleId,
    task: t.task,
    dueDate: t.dueDate.toISOString(),
    status: t.status as MaintenanceTask['status'],
    priority: t.priority as MaintenanceTask['priority'],
    assignee: t.assignee || undefined,
  }));
}

export async function getMaintenanceTasksByVehicle(vehicleId: string): Promise<MaintenanceTask[]> {
  const tasks = await prisma.maintenanceTask.findMany({
    where: { vehicleId },
    orderBy: { dueDate: 'asc' },
  });

  return tasks.map((t) => ({
    id: t.id,
    vehicleId: t.vehicleId,
    task: t.task,
    dueDate: t.dueDate.toISOString(),
    status: t.status as MaintenanceTask['status'],
    priority: t.priority as MaintenanceTask['priority'],
    assignee: t.assignee || undefined,
  }));
}

// ============================================
// Registros de Torque
// ============================================
export async function getTorqueRecords(): Promise<TorqueRecord[]> {
  const records = await prisma.torqueRecord.findMany({
    orderBy: { date: 'desc' },
    take: 50, // Limitar a los 50 más recientes
  });

  return records.map((r) => ({
    id: r.id,
    vehicleId: r.vehicleId,
    component: r.component,
    requiredTorque: Number(r.requiredTorque),
    appliedTorque: Number(r.appliedTorque),
    technician: r.technician,
    tool: r.tool,
    date: r.date.toISOString(),
    status: r.status as TorqueRecord['status'],
  }));
}

export async function getTorqueRecordsByVehicle(vehicleId: string): Promise<TorqueRecord[]> {
  const records = await prisma.torqueRecord.findMany({
    where: { vehicleId },
    orderBy: { date: 'desc' },
  });

  return records.map((r) => ({
    id: r.id,
    vehicleId: r.vehicleId,
    component: r.component,
    requiredTorque: Number(r.requiredTorque),
    appliedTorque: Number(r.appliedTorque),
    technician: r.technician,
    tool: r.tool,
    date: r.date.toISOString(),
    status: r.status as TorqueRecord['status'],
  }));
}

// ============================================
// Historial de Mantenimiento
// ============================================
export async function getMaintenanceRecords(vehicleId?: string): Promise<MaintenanceRecord[]> {
  const where = vehicleId ? { vehicleId } : {};

  const records = await prisma.maintenanceRecord.findMany({
    where,
    include: {
      parts: true,
    },
    orderBy: { date: 'desc' },
  });

  return records.map((r) => ({
    recordId: r.recordId,
    vehicleId: r.vehicleId,
    date: r.date.toISOString(),
    description: r.description,
    partsReplaced: r.parts.map((p) => ({
      partName: p.partName,
      quantity: p.quantity,
    })),
    technician: r.technician,
    operatingHours: r.operatingHours,
  }));
}

export async function getMaintenanceRecordsByVehicle(vehicleId: string): Promise<MaintenanceRecord[]> {
  return getMaintenanceRecords(vehicleId);
}

// ============================================
// Empresas
// ============================================
export async function getCompanies() {
  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
  });

  return companies.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type as 'Mandante' | 'Subcontratista',
    country: c.country,
    rut: c.rut || undefined,
    address: c.address || undefined,
    phone: c.phone || undefined,
    email: c.email || undefined,
    contactPerson: c.contactPerson || undefined,
  }));
}

export async function getCompanyById(id: string) {
  const company = await prisma.company.findUnique({
    where: { id },
  });

  if (!company) return null;

  return {
    id: company.id,
    name: company.name,
    type: company.type as 'Mandante' | 'Subcontratista',
    country: company.country,
    rut: company.rut || undefined,
    address: company.address || undefined,
    phone: company.phone || undefined,
    email: company.email || undefined,
    contactPerson: company.contactPerson || undefined,
  };
}
