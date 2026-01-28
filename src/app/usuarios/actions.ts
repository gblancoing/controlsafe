'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema de validación para crear usuario
const createUserSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255),
  email: z.string().email('Email inválido').max(255),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phone: z.string().optional(),
  role: z.enum(['Administrator', 'Supervisor', 'Technician', 'Driver']),
  canDrive: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  companyId: z.string().optional(),
  projectId: z.string().optional(),
});

// Schema de validación para actualizar usuario
const updateUserSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255),
  email: z.string().email('Email inválido').max(255),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  phone: z.string().optional(),
  role: z.enum(['Administrator', 'Supervisor', 'Technician', 'Driver']),
  canDrive: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
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

    return users.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || undefined,
      role: u.role,
      canDrive: u.canDrive || false,
      isActive: u.isActive !== undefined ? u.isActive : true,
      companyId: u.companyId || undefined,
      companyName: u.company?.name || undefined,
      projectId: u.projectId || undefined,
      projectName: u.project?.name || undefined,
      vehicles: u.vehicles.map((uv: any) => ({
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
      isActive: (user as any).isActive !== undefined ? (user as any).isActive : true,
      companyId: user.companyId || undefined,
      companyName: user.company?.name || undefined,
      projectId: user.projectId || undefined,
      projectName: user.project?.name || undefined,
      vehicles: user.vehicles.map((uv: any) => ({
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
  password: string;
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

    // Nota: La creación en Firebase Authentication debe hacerse desde el cliente
    // o usando Firebase Admin SDK en el servidor. Por ahora, solo creamos en la BD.
    // La contraseña se usará cuando el usuario inicie sesión por primera vez.
    // TODO: Implementar Firebase Admin SDK para crear usuarios desde el servidor

    // Generar ID único
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Crear el usuario en la base de datos
    await (prisma.user as any).create({
      data: {
        id: userId,
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        role: validated.role,
        canDrive: validated.canDrive || false,
        isActive: validated.isActive !== undefined ? validated.isActive : true,
        companyId: validated.companyId || null,
        projectId: validated.projectId || null,
      } as any,
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
    password?: string;
    phone?: string;
    role: 'Administrator' | 'Supervisor' | 'Technician' | 'Driver';
    canDrive?: boolean;
    isActive?: boolean;
    companyId?: string;
    projectId?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = updateUserSchema.parse(input);

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

    // Si se proporciona una contraseña, actualizarla en Firebase
    if (validated.password) {
      try {
        // Obtener el usuario actual para obtener su email
        const currentUser = await prisma.user.findUnique({
          where: { id },
          select: { email: true },
        });

        if (currentUser) {
          // Actualizar contraseña en Firebase
          // Nota: Esto requiere Firebase Admin SDK o hacerlo desde el cliente
          // Por ahora, solo actualizamos en la BD
          // TODO: Implementar actualización de contraseña en Firebase
        }
      } catch (firebaseError: any) {
        console.warn('Error al actualizar contraseña en Firebase:', firebaseError);
        // Continuar con la actualización en la BD aunque Firebase falle
      }
    }

    await (prisma.user as any).update({
      where: { id },
      data: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        role: validated.role,
        canDrive: validated.canDrive || false,
        isActive: validated.isActive !== undefined ? validated.isActive : true,
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
