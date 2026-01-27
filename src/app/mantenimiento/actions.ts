'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema de validación
const createMaintenanceProgramSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255),
  description: z.string().optional(),
  applicableVehicleType: z.enum(['Todos los tipos', 'Camioneta', 'Vehículo Liviano', 'Camión', 'Maquinaria Pesada']).optional(),
  frequencyValue: z.number().int().min(1, 'La frecuencia debe ser mayor a 0'),
  frequencyUnit: z.enum(['Horas de Operación', 'Kilómetros', 'Días', 'Semanas', 'Meses', 'Años']),
});

// Obtener todos los programas de mantenimiento
export async function getMaintenancePrograms() {
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

// Obtener un programa por ID
export async function getMaintenanceProgramById(id: string) {
  try {
    const program = await prisma.maintenanceProgram.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!program) return null;

    return {
      id: program.id,
      name: program.name,
      description: program.description || undefined,
      applicableVehicleType: program.applicableVehicleType || undefined,
      frequencyValue: program.frequencyValue,
      frequencyUnit: program.frequencyUnit,
      tasks: program.tasks.map((t) => ({
        id: t.id,
        task: t.task,
        order: t.order,
      })),
    };
  } catch (error) {
    console.error('Error fetching maintenance program:', error);
    return null;
  }
}

// Crear un nuevo programa de mantenimiento
export async function createMaintenanceProgram(input: {
  name: string;
  description?: string;
  applicableVehicleType?: 'Todos los tipos' | 'Camioneta' | 'Vehículo Liviano' | 'Camión' | 'Maquinaria Pesada';
  frequencyValue: number;
  frequencyUnit: 'Horas de Operación' | 'Kilómetros' | 'Días' | 'Semanas' | 'Meses' | 'Años';
}): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = createMaintenanceProgramSchema.parse(input);

    // Verificar si ya existe un programa con el mismo nombre
    const existing = await prisma.maintenanceProgram.findFirst({
      where: { name: validated.name },
    });

    if (existing) {
      return { success: false, error: `Ya existe un programa con el nombre "${validated.name}".` };
    }

    // Generar ID único
    const programId = `mp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Crear el programa
    await prisma.maintenanceProgram.create({
      data: {
        id: programId,
        name: validated.name,
        description: validated.description || null,
        applicableVehicleType: validated.applicableVehicleType || null,
        frequencyValue: validated.frequencyValue,
        frequencyUnit: validated.frequencyUnit,
      },
    });

    revalidatePath('/mantenimiento');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating maintenance program:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Datos inválidos' };
    }
    return { success: false, error: 'No se pudo crear el programa de mantenimiento. Intente nuevamente.' };
  }
}

// Actualizar un programa de mantenimiento
export async function updateMaintenanceProgram(
  id: string,
  input: {
    name: string;
    description?: string;
    applicableVehicleType?: 'Todos los tipos' | 'Camioneta' | 'Vehículo Liviano' | 'Camión' | 'Maquinaria Pesada';
    frequencyValue: number;
    frequencyUnit: 'Horas de Operación' | 'Kilómetros' | 'Días' | 'Semanas' | 'Meses' | 'Años';
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = createMaintenanceProgramSchema.parse(input);

    // Verificar si ya existe otro programa con el mismo nombre
    const existing = await prisma.maintenanceProgram.findFirst({
      where: {
        name: validated.name,
        NOT: { id },
      },
    });

    if (existing) {
      return { success: false, error: `Ya existe otro programa con el nombre "${validated.name}".` };
    }

    await prisma.maintenanceProgram.update({
      where: { id },
      data: {
        name: validated.name,
        description: validated.description || null,
        applicableVehicleType: validated.applicableVehicleType || null,
        frequencyValue: validated.frequencyValue,
        frequencyUnit: validated.frequencyUnit,
      },
    });

    revalidatePath('/mantenimiento');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating maintenance program:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Datos inválidos' };
    }
    return { success: false, error: 'No se pudo actualizar el programa de mantenimiento.' };
  }
}

// Eliminar un programa de mantenimiento
export async function deleteMaintenanceProgram(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.maintenanceProgram.delete({
      where: { id },
    });

    revalidatePath('/mantenimiento');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting maintenance program:', error);
    return { success: false, error: 'No se pudo eliminar el programa de mantenimiento.' };
  }
}
