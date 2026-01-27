'use server';

import { prisma } from '@/lib/db';
import type { Vehicle } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema de validación
const createVehicleSchema = z.object({
  patent: z.string().optional(),
  name: z.string().min(1, 'El nombre es obligatorio').max(255),
  type: z.enum(['Excavator', 'Haul Truck', 'Dozer', 'Loader', 'Camioneta']),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  status: z.enum(['Operational', 'Maintenance', 'Out of Service']).default('Operational'),
  mileage: z.number().int().min(0).default(0),
  operatingHours: z.number().int().min(0).default(0),
  site: z.string().optional(),
  companyId: z.string().optional(),
  driverId: z.string().optional(), // ID del chofer asignado
});

// Obtener todos los vehículos
export async function getVehicles(): Promise<Vehicle[] | null> {
  try {
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
  } catch (error: any) {
    console.error('Error fetching vehicles:', error);
    return null;
  }
}

// Obtener un vehículo por ID con información completa
export async function getVehicleById(id: string): Promise<{
  id: string;
  patent?: string;
  name: string;
  type: Vehicle['type'];
  brand?: string;
  model?: string;
  year?: number;
  status: Vehicle['status'];
  mileage: number;
  operatingHours: number;
  site: string;
  companyId?: string;
  companyName?: string;
  maintenancePrograms?: Array<{
    id: string;
    name: string;
    description?: string;
    frequencyValue: number;
    frequencyUnit: string;
    tasks: Array<{ id: string; task: string; order: number }>;
  }>;
} | null> {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        company: true,
        assignedPrograms: {
          include: {
            program: {
              include: {
                tasks: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!vehicle) {
      return null;
    }

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
      companyName: vehicle.company?.name || undefined,
      maintenancePrograms: vehicle.assignedPrograms.map((vp) => ({
        id: vp.program.id,
        name: vp.program.name,
        description: vp.program.description || undefined,
        frequencyValue: vp.program.frequencyValue,
        frequencyUnit: vp.program.frequencyUnit,
        tasks: vp.program.tasks.map((t) => ({
          id: t.id,
          task: t.task,
          order: t.order,
        })),
      })),
    };
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return null;
  }
}

// Obtener todas las empresas (para select)
export async function getAllCompanies() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
    });

    return companies.map((c) => ({
      id: c.id,
      name: c.name,
    }));
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
}

// Obtener choferes de una empresa (para select)
// Busca usuarios habilitados para conducir (canDrive: true) de la empresa
export async function getDriversByCompany(companyId: string) {
  try {
    const drivers = await prisma.user.findMany({
      where: {
        companyId,
        canDrive: true, // Usuarios habilitados para conducir, independientemente del rol
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return drivers.map((d) => ({
      id: d.id,
      name: d.name,
      email: d.email,
    }));
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return [];
  }
}

type CreateVehicleInput = {
  patent?: string;
  name: string;
  type: Vehicle['type'];
  brand?: string;
  model?: string;
  year?: number;
  status?: Vehicle['status'];
  mileage?: number;
  operatingHours?: number;
  site?: string;
  companyId?: string;
  driverId?: string; // ID del chofer asignado
};

// Crear un nuevo vehículo
export async function createVehicle(input: CreateVehicleInput): Promise<{ success: boolean; error?: string }> {
  try {
    // Debug: verificar qué está llegando
    console.log('createVehicle recibió:', input);
    console.log('Tipo recibido:', input.type, 'Tipo de dato:', typeof input.type);

    // Validación adicional del tipo antes de parsear
    if (!input.type || input.type === '' || input.type.trim() === '') {
      return { success: false, error: 'El tipo de vehículo es obligatorio.' };
    }

    // Validar que el tipo sea uno de los valores válidos
    const validTypes = ['Excavator', 'Haul Truck', 'Dozer', 'Loader', 'Camioneta'];
    if (!validTypes.includes(input.type)) {
      return { success: false, error: `Tipo de vehículo inválido: "${input.type}". Valores válidos: ${validTypes.join(', ')}` };
    }

    const validated = createVehicleSchema.parse(input);
    console.log('Validación exitosa, tipo validado:', validated.type);

    // Generar ID único
    const vehicleId = `vec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Verificar si ya existe un vehículo con la misma patente (si se proporciona)
    if (validated.patent) {
      const existing = await prisma.vehicle.findFirst({
        where: { patent: validated.patent },
      });

      if (existing) {
        return { success: false, error: `Ya existe un vehículo con la patente "${validated.patent}".` };
      }
    }

    // Crear el vehículo y asignar chofer si se proporciona
    await prisma.$transaction(async (tx) => {
      // Crear el vehículo
      await tx.vehicle.create({
        data: {
          id: vehicleId,
          patent: validated.patent || null,
          name: validated.name,
          type: validated.type,
          brand: validated.brand || null,
          model: validated.model || null,
          year: validated.year || null,
          status: validated.status || 'Operational',
          mileage: validated.mileage || 0,
          operatingHours: validated.operatingHours || 0,
          site: validated.site || 'Sin sitio asignado',
          companyId: validated.companyId || null,
        },
      });

      // Asignar chofer al vehículo si se proporciona
      if (validated.driverId) {
        // Verificar que el chofer existe y pertenece a la empresa
        const driver = await tx.user.findUnique({
          where: { id: validated.driverId },
          select: { id: true, companyId: true, canDrive: true },
        });

        if (!driver) {
          throw new Error('El chofer seleccionado no existe.');
        }

        if (driver.companyId !== validated.companyId) {
          throw new Error('El chofer seleccionado no pertenece a la empresa seleccionada.');
        }

        if (!driver.canDrive) {
          throw new Error('El usuario seleccionado no está habilitado para conducir.');
        }

        const userVehicleId = `uv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await tx.userVehicle.create({
          data: {
            id: userVehicleId,
            userId: validated.driverId,
            vehicleId: vehicleId,
          },
        });
      }
    });

    revalidatePath('/flota');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Datos inválidos' };
    }
    // Mensajes de error más específicos
    if (error.code === 'P2002') {
      return { success: false, error: 'Ya existe un vehículo con estos datos. Verifique la patente.' };
    }
    if (error.code === 'P2003') {
      return { success: false, error: 'Error de referencia: Verifique que la empresa y el chofer existen.' };
    }
    // Mostrar el mensaje de error específico si está disponible
    const errorMessage = error.message || 'No se pudo crear el vehículo. Intente nuevamente.';
    return { success: false, error: errorMessage };
  }
}

// Actualizar un vehículo
export async function updateVehicle(
  id: string,
  input: CreateVehicleInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = createVehicleSchema.parse(input);

    // Verificar patente duplicada (si se proporciona y es diferente)
    if (validated.patent) {
      const existing = await prisma.vehicle.findFirst({
        where: {
          patent: validated.patent,
          NOT: { id },
        },
      });

      if (existing) {
        return { success: false, error: `Ya existe otro vehículo con la patente "${validated.patent}".` };
      }
    }

    await prisma.vehicle.update({
      where: { id },
      data: {
        patent: validated.patent || null,
        name: validated.name,
        type: validated.type,
        brand: validated.brand || null,
        model: validated.model || null,
        year: validated.year || null,
        status: validated.status || 'Operational',
        mileage: validated.mileage || 0,
        operatingHours: validated.operatingHours || 0,
        site: validated.site || '',
        companyId: validated.companyId || null,
      },
    });

    revalidatePath('/flota');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating vehicle:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Datos inválidos' };
    }
    return { success: false, error: 'No se pudo actualizar el vehículo.' };
  }
}

// Eliminar un vehículo
export async function deleteVehicle(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.vehicle.delete({
      where: { id },
    });

    revalidatePath('/flota');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting vehicle:', error);
    return { success: false, error: 'No se pudo eliminar el vehículo.' };
  }
}

// ============================================
// Programas de Mantenimiento
// ============================================

// Obtener todos los programas de mantenimiento disponibles
export async function getAllMaintenancePrograms() {
  try {
    const programs = await prisma.maintenanceProgram.findMany({
      include: {
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return programs.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || undefined,
      applicableVehicleType: p.applicableVehicleType || undefined,
      frequencyValue: p.frequencyValue,
      frequencyUnit: p.frequencyUnit,
      tasks: p.tasks.map((t) => ({
        id: t.id,
        task: t.task,
        order: t.order,
      })),
    }));
  } catch (error) {
    console.error('Error fetching maintenance programs:', error);
    return [];
  }
}

// Asignar un programa de mantenimiento a un vehículo
export async function assignMaintenanceProgram(
  vehicleId: string,
  programId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar que el vehículo existe
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return { success: false, error: 'Vehículo no encontrado.' };
    }

    // Verificar que el programa existe
    const program = await prisma.maintenanceProgram.findUnique({
      where: { id: programId },
    });

    if (!program) {
      return { success: false, error: 'Programa de mantenimiento no encontrado.' };
    }

    // Verificar si ya está asignado
    const existing = await prisma.vehicleMaintenanceProgram.findUnique({
      where: {
        vehicleId_programId: {
          vehicleId,
          programId,
        },
      },
    });

    if (existing) {
      return { success: false, error: 'Este programa ya está asignado al vehículo.' };
    }

    // Asignar el programa
    const assignmentId = `vmp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await prisma.vehicleMaintenanceProgram.create({
      data: {
        id: assignmentId,
        vehicleId,
        programId,
      },
    });

    revalidatePath(`/flota/${vehicleId}`);
    revalidatePath(`/flota/${vehicleId}/ficha`);
    return { success: true };
  } catch (error: any) {
    console.error('Error assigning maintenance program:', error);
    if (error.code === 'P2002') {
      return { success: false, error: 'Este programa ya está asignado al vehículo.' };
    }
    return { success: false, error: 'No se pudo asignar el programa de mantenimiento.' };
  }
}

// Eliminar un programa de mantenimiento asignado a un vehículo
export async function removeMaintenanceProgram(
  vehicleId: string,
  programId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.vehicleMaintenanceProgram.deleteMany({
      where: {
        vehicleId,
        programId,
      },
    });

    revalidatePath(`/flota/${vehicleId}`);
    revalidatePath(`/flota/${vehicleId}/ficha`);
    return { success: true };
  } catch (error: any) {
    console.error('Error removing maintenance program:', error);
    return { success: false, error: 'No se pudo eliminar el programa de mantenimiento.' };
  }
}
