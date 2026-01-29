'use server';

import { prisma } from '@/lib/db';
import type { Vehicle } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { calculateNextDueDate } from '@/lib/date-utils';
import fs from 'fs';
import path from 'path';

// Schema de validación
const createVehicleSchema = z.object({
  patent: z.string().optional(),
  name: z.string().min(1, 'El nombre es obligatorio').max(255),
  type: z.enum(['Excavator', 'Haul Truck', 'Dozer', 'Loader', 'Camioneta']),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  status: z.enum(['Operational', 'Maintenance', 'Out of Service', 'Not Allowed to Operate']).default('Operational'),
  mileage: z.number().int().min(0).default(0),
  operatingHours: z.number().int().min(0).default(0),
  site: z.string().optional(),
  companyId: z.string().optional(),
  driverId: z.string().optional(), // ID del chofer asignado
  isOperational: z.boolean().optional().default(true),
  technicalReviewDate: z.date().nullable().optional(),
  technicalReviewExpiryDate: z.date().nullable().optional(),
  circulationPermitStatus: z.enum(['Vigente', 'Vencido', 'Pendiente']).optional(),
});

// Obtener todos los vehículos (filtrados por alcance: SuperAdmin todos; Admin del proyecto; resto de su empresa)
export async function getVehicles(): Promise<Vehicle[] | null> {
  try {
    const { getAllowedCompanyIds } = await import('@/lib/scope');
    const allowedIds = await getAllowedCompanyIds();
    const where = allowedIds === null ? {} : { companyId: { in: allowedIds } };
    const vehicles = await prisma.vehicle.findMany({
      where,
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
  technicalReviewDate?: Date;
  technicalReviewExpiryDate?: Date;
  circulationPermitStatus?: string;
  documents?: Array<{ id: string; type: string; url: string; fileName?: string; caption?: string }>;
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
        documents: { orderBy: { order: 'asc' } },
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
      technicalReviewDate: vehicle.technicalReviewDate || undefined,
      technicalReviewExpiryDate: vehicle.technicalReviewExpiryDate || undefined,
      circulationPermitStatus: vehicle.circulationPermitStatus || undefined,
      documents: vehicle.documents?.map((d) => ({
        id: d.id,
        type: d.type,
        url: d.url,
        fileName: d.fileName || undefined,
        caption: d.caption || undefined,
      })),
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

// Obtener todas las empresas (para select), filtradas por alcance
export async function getAllCompanies() {
  try {
    const { getAllowedCompanyIds } = await import('@/lib/scope');
    const allowedIds = await getAllowedCompanyIds();
    const where = allowedIds === null ? {} : { id: { in: allowedIds } };
    const companies = await prisma.company.findMany({
      where,
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
  technicalReviewDate?: Date | null;
  technicalReviewExpiryDate?: Date | null;
  circulationPermitStatus?: 'Vigente' | 'Vencido' | 'Pendiente';
};

// Crear un nuevo vehículo (devuelve vehicleId en éxito para poder subir documentos)
export async function createVehicle(input: CreateVehicleInput): Promise<{ success: boolean; error?: string; vehicleId?: string }> {
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

    // Validar: Si la revisión técnica está vencida, el vehículo debe estar inoperativo
    const now = new Date();
    let finalStatus = validated.status || 'Operational';
    let isOperational = validated.isOperational ?? true;

    if (validated.technicalReviewExpiryDate) {
      const expiryDate = new Date(validated.technicalReviewExpiryDate);
      if (expiryDate < now) {
        // Revisión técnica vencida: vehículo inoperativo
        isOperational = false;
        finalStatus = 'Not Allowed to Operate';
      }
    }

    // Crear el vehículo y asignar chofer si se proporciona
    await prisma.$transaction(async (tx) => {
      // Crear el vehículo
      await (tx.vehicle.create as any)({
        data: {
          id: vehicleId,
          patent: validated.patent || null,
          name: validated.name,
          type: validated.type, // Mantener para compatibilidad
          vehicleTypeId: input.vehicleTypeId || null, // Nuevo campo
          brand: validated.brand || null,
          model: validated.model || null,
          year: validated.year || null,
          status: finalStatus,
          mileage: validated.mileage || 0,
          operatingHours: validated.operatingHours || 0,
          site: validated.site || 'Sin sitio asignado',
          companyId: validated.companyId || null,
          isOperational: isOperational,
          technicalReviewDate: validated.technicalReviewDate || null,
          technicalReviewExpiryDate: validated.technicalReviewExpiryDate || null,
          circulationPermitStatus: validated.circulationPermitStatus || null,
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
    return { success: true, vehicleId };
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

/** Sube documentos de un vehículo (llamar después de createVehicle con el vehicleId devuelto). */
export async function uploadVehicleDocuments(
  vehicleId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true },
    });
    if (!vehicle) {
      return { success: false, error: 'Vehículo no encontrado.' };
    }

    const files = formData.getAll('documents') as File[];
    if (!files?.length) {
      return { success: true };
    }

    const baseDir = path.join(process.cwd(), 'public', 'uploads', 'vehicles', vehicleId);
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    const mimeToExt: Record<string, string> = {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file?.name || file.size === 0) continue;

      const ext = mimeToExt[file.type] || path.extname(file.name).slice(1) || 'bin';
      const safeName = `${Date.now()}-${i}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`.slice(0, 180);
      const fileName = safeName.endsWith(`.${ext}`) ? safeName : `${safeName}.${ext}`;
      const filePath = path.join(baseDir, fileName);
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      const url = `/uploads/vehicles/${vehicleId}/${fileName}`;
      const docId = `vd-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 9)}`;
      await prisma.vehicleDocument.create({
        data: {
          id: docId,
          vehicleId,
          type: 'other',
          url,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || undefined,
          order: i,
        },
      });
    }

    revalidatePath('/flota');
    revalidatePath(`/flota/${vehicleId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error uploading vehicle documents:', error);
    return { success: false, error: error.message || 'No se pudieron subir los documentos.' };
  }
}

/** Elimina un documento de un vehículo (y el archivo en disco si existe). */
export async function deleteVehicleDocument(
  docId: string,
  vehicleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const doc = await prisma.vehicleDocument.findFirst({
      where: { id: docId, vehicleId },
    });
    if (!doc) {
      return { success: false, error: 'Documento no encontrado.' };
    }
    const baseDir = path.join(process.cwd(), 'public', 'uploads', 'vehicles', vehicleId);
    const fileSegment = doc.url.split('/').pop();
    if (fileSegment) {
      const filePath = path.join(baseDir, fileSegment);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('No se pudo eliminar el archivo físico:', filePath, e);
        }
      }
    }
    await prisma.vehicleDocument.delete({ where: { id: docId } });
    revalidatePath('/flota');
    revalidatePath(`/flota/${vehicleId}`);
    revalidatePath(`/flota/${vehicleId}/ficha`);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting vehicle document:', error);
    return { success: false, error: error.message || 'No se pudo eliminar el documento.' };
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
        mileage: validated.mileage ?? undefined,
        operatingHours: validated.operatingHours ?? undefined,
        site: validated.site ?? undefined,
        companyId: validated.companyId || null,
        ...(validated.technicalReviewDate !== undefined && { technicalReviewDate: validated.technicalReviewDate }),
        ...(validated.technicalReviewExpiryDate !== undefined && { technicalReviewExpiryDate: validated.technicalReviewExpiryDate }),
        ...(validated.circulationPermitStatus !== undefined && { circulationPermitStatus: validated.circulationPermitStatus }),
      },
    });

    revalidatePath('/flota');
    revalidatePath(`/flota/${id}`);
    revalidatePath(`/flota/${id}/ficha`);
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
    // Usar 'as any' temporalmente si Prisma Client no está sincronizado
    const program = await (prisma.maintenanceProgram.findUnique as any)({
      where: { id: programId },
      select: {
        id: true,
        name: true,
        frequencyValue: true,
        frequencyUnit: true,
        useBusinessDays: true,
      },
    });

    if (!program) {
      return { success: false, error: 'Programa de mantenimiento no encontrado.' };
    }

    // Verificar si ya está asignado
    // Usar 'as any' temporalmente si Prisma Client no está sincronizado
    const existing = await (prisma.vehicleMaintenanceProgram.findUnique as any)({
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

    // Calcular próxima fecha de revisión
    const now = new Date();
    const useBusinessDays = (program as any).useBusinessDays || false;
    console.log('[Asignar Programa] Datos del programa:', {
      id: program.id,
      name: program.name,
      frequencyValue: program.frequencyValue,
      frequencyUnit: program.frequencyUnit,
      useBusinessDays,
    });
    
    const nextDueDate = calculateNextDueDate(
      now,
      program.frequencyValue,
      program.frequencyUnit,
      useBusinessDays
    );
    
    console.log('[Asignar Programa] Próxima fecha calculada:', nextDueDate.toISOString());

    // Asignar el programa
    // Usar 'as any' temporalmente hasta que Prisma Client se regenere después de la migración SQL
    const assignmentId = `vmp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('[Asignar Programa] Creando asignación:', {
      id: assignmentId,
      vehicleId,
      programId,
      nextDueDate: nextDueDate.toISOString(),
    });
    
    await (prisma.vehicleMaintenanceProgram.create as any)({
      data: {
        id: assignmentId,
        vehicleId,
        programId,
        nextDueDate,
      },
    });

    console.log('[Asignar Programa] Asignación creada exitosamente');
    revalidatePath(`/flota/${vehicleId}`);
    revalidatePath(`/flota/${vehicleId}/ficha`);
    revalidatePath('/torque'); // También revalidar Control Preventivo
    revalidatePath('/flota'); // Revalidar lista de flota
    return { success: true };
  } catch (error: any) {
    console.error('[Asignar Programa] Error completo:', error);
    console.error('[Asignar Programa] Detalles del error:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    
    if (error.code === 'P2002') {
      return { success: false, error: 'Este programa ya está asignado al vehículo.' };
    }
    if (error.code === 'P2003') {
      return { success: false, error: 'Error de referencia: Verifique que el vehículo y el programa existen.' };
    }
    if (error.message?.includes('Unknown field') || error.message?.includes('Unknown argument')) {
      return { 
        success: false, 
        error: 'Prisma Client desincronizado. Ejecuta: npm run db:generate' 
      };
    }
    return { 
      success: false, 
      error: error.message || 'No se pudo asignar el programa de mantenimiento. Revisa la consola para más detalles.' 
    };
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
