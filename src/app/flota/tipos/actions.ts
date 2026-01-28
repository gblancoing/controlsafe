'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema de validación
const createVehicleTypeSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255),
  displayName: z.string().min(1, 'El nombre para mostrar es obligatorio').max(255),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

const updateVehicleTypeSchema = createVehicleTypeSchema.extend({
  id: z.string().min(1),
});

export type VehicleTypeModel = {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Obtener todos los tipos de vehículos
export async function getVehicleTypes(): Promise<VehicleTypeModel[]> {
  try {
    const types = await prisma.vehicleTypeModel.findMany({
      orderBy: { displayName: 'asc' },
    });
    return types;
  } catch (error: any) {
    console.error('Error fetching vehicle types:', error);
    return [];
  }
}

// Obtener tipos activos solamente
export async function getActiveVehicleTypes(): Promise<VehicleTypeModel[]> {
  try {
    const types = await prisma.vehicleTypeModel.findMany({
      where: { isActive: true },
      orderBy: { displayName: 'asc' },
    });
    return types;
  } catch (error: any) {
    console.error('Error fetching active vehicle types:', error);
    return [];
  }
}

// Obtener un tipo por ID
export async function getVehicleTypeById(id: string): Promise<VehicleTypeModel | null> {
  try {
    const type = await prisma.vehicleTypeModel.findUnique({
      where: { id },
    });
    return type;
  } catch (error: any) {
    console.error('Error fetching vehicle type:', error);
    return null;
  }
}

// Crear un nuevo tipo de vehículo
export async function createVehicleType(input: z.infer<typeof createVehicleTypeSchema>): Promise<{ success: boolean; error?: string; data?: VehicleTypeModel }> {
  try {
    const validated = createVehicleTypeSchema.parse(input);

    // Verificar que el nombre no exista
    const existing = await prisma.vehicleTypeModel.findUnique({
      where: { name: validated.name },
    });

    if (existing) {
      return { success: false, error: `Ya existe un tipo de vehículo con el nombre "${validated.name}".` };
    }

    // Generar ID único
    const typeId = `vt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newType = await prisma.vehicleTypeModel.create({
      data: {
        id: typeId,
        name: validated.name,
        displayName: validated.displayName,
        description: validated.description,
        isActive: validated.isActive,
      },
    });

    revalidatePath('/flota/tipos');
    revalidatePath('/flota');

    return { success: true, data: newType };
  } catch (error: any) {
    console.error('Error creating vehicle type:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'No se pudo crear el tipo de vehículo. Intente nuevamente.' };
  }
}

// Actualizar un tipo de vehículo
export async function updateVehicleType(input: z.infer<typeof updateVehicleTypeSchema>): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = updateVehicleTypeSchema.parse(input);

    // Verificar que el tipo existe
    const existing = await prisma.vehicleTypeModel.findUnique({
      where: { id: validated.id },
    });

    if (!existing) {
      return { success: false, error: 'El tipo de vehículo no existe.' };
    }

    // Verificar que el nombre no esté en uso por otro tipo
    const nameConflict = await prisma.vehicleTypeModel.findFirst({
      where: {
        name: validated.name,
        id: { not: validated.id },
      },
    });

    if (nameConflict) {
      return { success: false, error: `Ya existe otro tipo de vehículo con el nombre "${validated.name}".` };
    }

    await prisma.vehicleTypeModel.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        displayName: validated.displayName,
        description: validated.description,
        isActive: validated.isActive,
      },
    });

    revalidatePath('/flota/tipos');
    revalidatePath('/flota');

    return { success: true };
  } catch (error: any) {
    console.error('Error updating vehicle type:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'No se pudo actualizar el tipo de vehículo. Intente nuevamente.' };
  }
}

// Eliminar un tipo de vehículo
export async function deleteVehicleType(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar que el tipo existe
    const existing = await prisma.vehicleTypeModel.findUnique({
      where: { id },
      include: {
        vehicles: {
          take: 1,
        },
      },
    });

    if (!existing) {
      return { success: false, error: 'El tipo de vehículo no existe.' };
    }

    // Verificar si hay vehículos usando este tipo
    if (existing.vehicles.length > 0) {
      return { success: false, error: 'No se puede eliminar este tipo porque hay vehículos que lo están usando. Primero debe cambiar el tipo de esos vehículos.' };
    }

    await prisma.vehicleTypeModel.delete({
      where: { id },
    });

    revalidatePath('/flota/tipos');
    revalidatePath('/flota');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting vehicle type:', error);
    return { success: false, error: 'No se pudo eliminar el tipo de vehículo. Intente nuevamente.' };
  }
}
