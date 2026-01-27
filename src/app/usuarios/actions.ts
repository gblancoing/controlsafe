'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema de validación
const createUserSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255),
  email: z.string().email('Email inválido').max(255),
  phone: z.string().optional(),
  role: z.enum(['Administrator', 'Supervisor', 'Technician', 'Driver']),
  canDrive: z.boolean().optional().default(false),
  companyId: z.string().optional(),
  projectId: z.string().optional(),
});

// Obtener todos los usuarios (opcionalmente filtrados por empresa)
export async function getUsers(companyId?: string) {
  try {
    const where = companyId ? { companyId } : {};
    
    const users = await prisma.user.findMany({
      where,
      include: {
        company: true,
        project: true,
        vehicles: {
          include: {
            vehicle: {
              select: {
                id: true,
                name: true,
                patent: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || undefined,
      role: u.role,
      canDrive: u.canDrive || false,
      companyId: u.companyId || undefined,
      companyName: u.company?.name || undefined,
      projectId: u.projectId || undefined,
      projectName: u.project?.name || undefined,
      vehicles: u.vehicles.map((uv) => ({
        id: uv.vehicle.id,
        name: uv.vehicle.name,
        patent: uv.vehicle.patent || undefined,
      })),
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Obtener un usuario por ID
export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        company: true,
        project: true,
        vehicles: {
          include: {
            vehicle: {
              select: {
                id: true,
                name: true,
                patent: true,
                type: true,
                brand: true,
                model: true,
              },
            },
          },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || undefined,
      role: user.role,
      canDrive: user.canDrive || false,
      companyId: user.companyId || undefined,
      companyName: user.company?.name || undefined,
      projectId: user.projectId || undefined,
      projectName: user.project?.name || undefined,
      vehicles: user.vehicles.map((uv) => ({
        id: uv.vehicle.id,
        name: uv.vehicle.name,
        patent: uv.vehicle.patent || undefined,
        type: uv.vehicle.type,
        brand: uv.vehicle.brand || undefined,
        model: uv.vehicle.model || undefined,
      })),
    };
  } catch (error) {
    console.error('Error fetching user:', error);
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

// Obtener todos los proyectos (para select)
export async function getAllProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { name: 'asc' },
    });

    return projects.map((p) => ({
      id: p.id,
      name: p.name,
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

// Crear un nuevo usuario
export async function createUser(input: {
  name: string;
  email: string;
  phone?: string;
  role: 'Administrator' | 'Supervisor' | 'Technician' | 'Driver';
  canDrive?: boolean;
  companyId?: string;
  projectId?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = createUserSchema.parse(input);

    // Verificar si el email ya existe
    const existing = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existing) {
      return { success: false, error: `Ya existe un usuario con el email "${validated.email}".` };
    }

    // Validar que si es Driver, debe tener companyId
    if (validated.role === 'Driver' && !validated.companyId) {
      return { success: false, error: 'Los choferes deben pertenecer a una empresa.' };
    }

    // Generar ID único
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Crear el usuario
    await prisma.user.create({
      data: {
        id: userId,
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        role: validated.role,
        canDrive: validated.canDrive || false,
        companyId: validated.companyId || null,
        projectId: validated.projectId || null,
      },
    });

    revalidatePath('/usuarios');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Datos inválidos' };
    }
    return { success: false, error: 'No se pudo crear el usuario. Intente nuevamente.' };
  }
}

// Actualizar un usuario
export async function updateUser(
  id: string,
  input: {
    name: string;
    email: string;
    phone?: string;
    role: 'Administrator' | 'Supervisor' | 'Technician' | 'Driver';
    canDrive?: boolean;
    companyId?: string;
    projectId?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = createUserSchema.parse(input);

    // Verificar si el email ya existe en otro usuario
    const existing = await prisma.user.findFirst({
      where: {
        email: validated.email,
        NOT: { id },
      },
    });

    if (existing) {
      return { success: false, error: `Ya existe otro usuario con el email "${validated.email}".` };
    }

    // Validar que si es Driver, debe tener companyId
    if (validated.role === 'Driver' && !validated.companyId) {
      return { success: false, error: 'Los choferes deben pertenecer a una empresa.' };
    }

    await prisma.user.update({
      where: { id },
      data: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        role: validated.role,
        canDrive: validated.canDrive || false,
        companyId: validated.companyId || null,
        projectId: validated.projectId || null,
      },
    });

    revalidatePath('/usuarios');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Datos inválidos' };
    }
    return { success: false, error: 'No se pudo actualizar el usuario.' };
  }
}

// Eliminar un usuario
export async function deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath('/usuarios');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'No se pudo eliminar el usuario.' };
  }
}

// ============================================
// Asignación de Vehículos a Choferes
// ============================================

// Obtener vehículos de una empresa (para asignar a choferes)
export async function getCompanyVehicles(companyId: string) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        patent: true,
        type: true,
        brand: true,
        model: true,
      },
      orderBy: { name: 'asc' },
    });

    return vehicles;
  } catch (error) {
    console.error('Error fetching company vehicles:', error);
    return [];
  }
}

// Asignar un vehículo a un chofer
export async function assignVehicleToDriver(
  userId: string,
  vehicleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar que el usuario existe y es un chofer
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    if (user.role !== 'Driver') {
      return { success: false, error: 'Solo los choferes pueden tener vehículos asignados.' };
    }

    // Verificar que el vehículo existe
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return { success: false, error: 'Vehículo no encontrado.' };
    }

    // Verificar que ya no está asignado
    const existing = await prisma.userVehicle.findUnique({
      where: {
        userId_vehicleId: {
          userId,
          vehicleId,
        },
      },
    });

    if (existing) {
      return { success: false, error: 'Este vehículo ya está asignado a este chofer.' };
    }

    // Asignar el vehículo
    const assignmentId = `uv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await prisma.userVehicle.create({
      data: {
        id: assignmentId,
        userId,
        vehicleId,
      },
    });

    revalidatePath('/usuarios');
    return { success: true };
  } catch (error: any) {
    console.error('Error assigning vehicle:', error);
    if (error.code === 'P2002') {
      return { success: false, error: 'Este vehículo ya está asignado a este chofer.' };
    }
    return { success: false, error: 'No se pudo asignar el vehículo.' };
  }
}

// Desasignar un vehículo de un chofer
export async function unassignVehicleFromDriver(
  userId: string,
  vehicleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.userVehicle.deleteMany({
      where: {
        userId,
        vehicleId,
      },
    });

    revalidatePath('/usuarios');
    return { success: true };
  } catch (error: any) {
    console.error('Error unassigning vehicle:', error);
    return { success: false, error: 'No se pudo desasignar el vehículo.' };
  }
}
