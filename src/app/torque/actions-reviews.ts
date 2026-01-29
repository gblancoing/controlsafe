'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { calculateNextDueDate } from '@/lib/date-utils';
import fs from 'fs';
import path from 'path';

// Schema de validación para crear una revisión
const createReviewSchema = z.object({
  vehicleMaintenanceProgramId: z.string().min(1),
  vehicleId: z.string().min(1),
  driverId: z.string().optional(),
  reviewedBy: z.string().min(1),
  reviewDate: z.date(),
  status: z.enum(['Approved', 'Rejected', 'UrgentRejected']),
  observations: z.string().optional(),
  urgentRejectionReason: z.string().optional(),
  requiredActions: z.string().optional(),
  rejectionRepairProgramId: z.string().optional(), // Programa de reparación para rechazo normal y urgente
  checklistItems: z.array(z.object({
    programTaskId: z.string().optional(),
    item: z.string().min(1),
    checked: z.boolean(),
    notes: z.string().optional(),
    order: z.number().int(),
  })),
  photoUrls: z.array(z.string()).optional(),
  selectedDeviationTypeIds: z.array(z.string()).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// Obtener información del vehículo y chofer para el formulario
export async function getVehicleAndDriverInfo(vehicleId: string) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        company: true,
        drivers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
          take: 1, // Tomar el primer chofer asignado
        },
      },
    });

    if (!vehicle) {
      return null;
    }

    const driver = vehicle.drivers[0]?.user || null;

    return {
      vehicle: {
        id: vehicle.id,
        name: vehicle.name,
        patent: vehicle.patent || undefined,
        brand: vehicle.brand || undefined,
        model: vehicle.model || undefined,
        type: vehicle.type,
        companyName: vehicle.company?.name || undefined,
      },
      driver: driver ? {
        id: driver.id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone || undefined,
      } : null,
    };
  } catch (error) {
    console.error('Error fetching vehicle and driver info:', error);
    return null;
  }
}

// Obtener checklist del programa
export async function getProgramChecklist(programId: string) {
  try {
    const program = await prisma.maintenanceProgram.findUnique({
      where: { id: programId },
      include: {
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!program) {
      return null;
    }

    return {
      id: program.id,
      name: program.name,
      description: program.description || undefined,
      tasks: program.tasks.map((task) => ({
        id: task.id,
        task: task.task,
        order: task.order,
      })),
    };
  } catch (error) {
    console.error('Error fetching program checklist:', error);
    return null;
  }
}

// Crear una revisión de control preventivo
export async function createPreventiveControlReview(
  input: CreateReviewInput
): Promise<{ success: boolean; error?: string; reviewId?: string }> {
  try {
    const validated = createReviewSchema.parse(input);

    // Verificar que el control preventivo existe
    const assignment = await prisma.vehicleMaintenanceProgram.findUnique({
      where: { id: validated.vehicleMaintenanceProgramId },
      include: {
        program: true,
        vehicle: true,
      },
    });

    if (!assignment) {
      return { success: false, error: 'Control preventivo no encontrado.' };
    }

    // Obtener el usuario actual
    // Por ahora usamos el primer usuario Administrator disponible
    // TODO: En producción, obtener de la sesión/autenticación
    let currentUserId = validated.reviewedBy;
    
    // Si el ID es 'admin', buscar un usuario real
    if (currentUserId === 'admin') {
      const currentUser = await prisma.user.findFirst({
        where: { role: 'Administrator' },
        select: { id: true },
      });
      if (!currentUser) {
        // Si no hay Administrator, buscar cualquier usuario
        const anyUser = await prisma.user.findFirst({
          select: { id: true },
        });
        if (!anyUser) {
          return { success: false, error: 'No se encontró ningún usuario en el sistema. Por favor, registre al menos un usuario.' };
        }
        currentUserId = anyUser.id;
      } else {
        currentUserId = currentUser.id;
      }
    }
    
    // Verificar que el usuario existe
    const reviewerExists = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { id: true },
    });
    
    if (!reviewerExists) {
      return { success: false, error: `El usuario revisor con ID "${currentUserId}" no existe en el sistema.` };
    }

    const reviewId = `pcr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await prisma.$transaction(async (tx) => {
      // Crear la revisión
      const review = await (tx as any).preventiveControlReview.create({
        data: {
          id: reviewId,
          vehicleMaintenanceProgramId: validated.vehicleMaintenanceProgramId,
          vehicleId: validated.vehicleId,
          driverId: validated.driverId || null,
          reviewedBy: currentUserId,
          reviewDate: validated.reviewDate,
          status: validated.status,
          observations: validated.observations || null,
          urgentRejectionReason: validated.urgentRejectionReason || null,
          requiredActions: validated.requiredActions || null,
        },
      });

      // Crear items del checklist
      if (validated.checklistItems.length > 0) {
        await (tx as any).reviewChecklistItem.createMany({
          data: validated.checklistItems.map((item, index) => ({
            id: `rci-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            reviewId: review.id,
            programTaskId: item.programTaskId || null,
            item: item.item,
            checked: item.checked,
            notes: item.notes || null,
            order: item.order,
          })),
        });
      }

      // Crear fotos si existen
      if (validated.photoUrls && validated.photoUrls.length > 0) {
        await (tx as any).reviewPhoto.createMany({
          data: validated.photoUrls.map((url, index) => ({
            id: `rp-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            reviewId: review.id,
            url,
            order: index,
          })),
        });
      }

      // Crear desviaciones seleccionadas
      if (validated.selectedDeviationTypeIds && validated.selectedDeviationTypeIds.length > 0) {
        await (tx as any).reviewDeviation.createMany({
          data: validated.selectedDeviationTypeIds.map((deviationTypeId) => ({
            id: `rd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            reviewId: review.id,
            deviationTypeId,
          })),
        });
      }

      // Procesar según el estado de la revisión
      if (validated.status === 'Approved') {
        // Aprobar: Resetear el control preventivo desde la fecha de revisión
        const reviewDate = validated.reviewDate;
        // Obtener useBusinessDays del programa
        const programData = await tx.maintenanceProgram.findUnique({
          where: { id: assignment.programId },
          select: {
            frequencyValue: true,
            frequencyUnit: true,
          },
        });
        // Obtener useBusinessDays directamente del assignment que ya lo tiene
        const useBusinessDays = (assignment.program as any).useBusinessDays || false;
        const nextDueDate = calculateNextDueDate(
          reviewDate,
          programData?.frequencyValue || assignment.program.frequencyValue,
          programData?.frequencyUnit || assignment.program.frequencyUnit,
          useBusinessDays
        );

        await (tx as any).vehicleMaintenanceProgram.update({
          where: { id: validated.vehicleMaintenanceProgramId },
          data: {
            lastResetDate: reviewDate,
            nextDueDate,
          },
        });
      } else if (validated.status === 'UrgentRejected') {
        // Rechazo urgente: Deshabilitar vehículo (Inoperativo)
        await (tx as any).vehicle.update({
          where: { id: validated.vehicleId },
          data: {
            status: 'NotAllowedToOperate',
          },
        });

        // Asignar programa de reparación si se proporciona
        if (validated.rejectionRepairProgramId) {
          const repairProgram = await tx.maintenanceProgram.findUnique({
            where: { id: validated.rejectionRepairProgramId },
          });

          if (repairProgram) {
            const existing = await tx.vehicleMaintenanceProgram.findUnique({
              where: {
                vehicleId_programId: {
                  vehicleId: validated.vehicleId,
                  programId: validated.rejectionRepairProgramId,
                },
              },
            });

            if (!existing && repairProgram) {
              const now = new Date();
              const useBusinessDays = (repairProgram as any).useBusinessDays || false;
              const nextDueDate = calculateNextDueDate(
                now,
                repairProgram.frequencyValue,
                repairProgram.frequencyUnit,
                useBusinessDays
              );

              await (tx as any).vehicleMaintenanceProgram.create({
                data: {
                  id: `vmp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  vehicleId: validated.vehicleId,
                  programId: validated.rejectionRepairProgramId,
                  nextDueDate,
                },
              });
            }
          }
        }
      } else if (validated.status === 'Rejected' && validated.rejectionRepairProgramId) {
        // Rechazo normal: Asignar programa de reparación y ajuste
        const repairProgram = await tx.maintenanceProgram.findUnique({
          where: { id: validated.rejectionRepairProgramId },
        });

        if (repairProgram) {
          // Verificar si ya está asignado
          const existing = await tx.vehicleMaintenanceProgram.findUnique({
            where: {
              vehicleId_programId: {
                vehicleId: validated.vehicleId,
                programId: validated.rejectionRepairProgramId,
              },
            },
          });

          if (!existing && repairProgram) {
            // Calcular próxima fecha de revisión para el programa de reparación
            const now = new Date();
            const useBusinessDays = (repairProgram as any).useBusinessDays || false;
            const nextDueDate = calculateNextDueDate(
              now,
              repairProgram.frequencyValue,
              repairProgram.frequencyUnit,
              useBusinessDays
            );

            await (tx as any).vehicleMaintenanceProgram.create({
              data: {
                id: `vmp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                vehicleId: validated.vehicleId,
                programId: validated.rejectionRepairProgramId,
                nextDueDate,
              },
            });
          }
        }
      }
    });

    revalidatePath('/torque');
    revalidatePath(`/flota/${validated.vehicleId}`);
    revalidatePath(`/flota/${validated.vehicleId}/ficha`);
    return { success: true, reviewId };
  } catch (error: any) {
    console.error('Error creating preventive control review:', error);
    
    // Mejorar el mensaje de error para debugging
    let errorMessage = 'No se pudo crear la revisión. Intente nuevamente.';
    
    if (error instanceof z.ZodError) {
      errorMessage = error.errors[0]?.message || 'Datos inválidos';
    } else if (error?.code === 'P2002') {
      errorMessage = 'Ya existe una revisión con estos datos.';
    } else if (error?.code === 'P2003') {
      errorMessage = 'Error de referencia: Verifique que el vehículo, programa o usuario existan.';
    } else if (error?.code === 'P2025') {
      errorMessage = 'No se encontró el registro necesario en la base de datos.';
    } else if (error?.message) {
      // Incluir el mensaje del error para debugging
      errorMessage = `Error: ${error.message}`;
      console.error('Error details:', {
        code: error.code,
        meta: error.meta,
        message: error.message,
      });
    }
    
    return { success: false, error: errorMessage };
  }
}

/** Sube fotos de una revisión (llamar después de createPreventiveControlReview con el reviewId devuelto). */
export async function uploadReviewPhotos(
  reviewId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const review = await (prisma as any).preventiveControlReview.findUnique({
      where: { id: reviewId },
      select: { id: true, vehicleId: true },
    });
    if (!review) {
      return { success: false, error: 'Revisión no encontrada.' };
    }

    const files = formData.getAll('photos') as File[];
    if (!files?.length) {
      return { success: true };
    }

    const baseDir = path.join(process.cwd(), 'public', 'uploads', 'reviews', reviewId);
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file?.name || file.size === 0) continue;

      const ext = mimeToExt[file.type] || path.extname(file.name).slice(1) || 'jpg';
      const safeName = `${Date.now()}-${i}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`.slice(0, 180);
      const fileName = safeName.endsWith(`.${ext}`) ? safeName : `${safeName}.${ext}`;
      const filePath = path.join(baseDir, fileName);
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      const url = `/uploads/reviews/${reviewId}/${fileName}`;
      const photoId = `rp-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 9)}`;
      await (prisma as any).reviewPhoto.create({
        data: {
          id: photoId,
          reviewId,
          url,
          order: i,
        },
      });
    }

    revalidatePath('/torque');
    revalidatePath(`/flota/${review.vehicleId}`);
    revalidatePath(`/flota/${review.vehicleId}/ficha`);
    return { success: true };
  } catch (error: any) {
    console.error('Error uploading review photos:', error);
    return { success: false, error: error.message || 'No se pudieron subir las fotografías.' };
  }
}

// Obtener historial de revisiones de un vehículo (todas las revisiones)
export async function getVehicleReviewHistory(vehicleId: string) {
  try {
    const reviews = await (prisma as any).preventiveControlReview.findMany({
      where: { vehicleId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        checklistItems: {
          orderBy: { order: 'asc' },
        },
        photos: {
          orderBy: { order: 'asc' },
        },
        deviations: {
          include: {
            deviationType: { select: { id: true, name: true } },
          },
        },
        vehicleMaintenanceProgram: {
          include: {
            program: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { reviewDate: 'desc' },
    });

    return reviews.map((review: any) => ({
      id: review.id,
      reviewDate: review.reviewDate,
      status: review.status,
      observations: review.observations || undefined,
      urgentRejectionReason: review.urgentRejectionReason || undefined,
      requiredActions: review.requiredActions || undefined,
      programName: review.vehicleMaintenanceProgram.program.name,
      reviewer: {
        id: review.reviewer.id,
        name: review.reviewer.name,
        email: review.reviewer.email,
      },
      driver: review.driver ? {
        id: review.driver.id,
        name: review.driver.name,
        email: review.driver.email,
      } : undefined,
      checklistItems: review.checklistItems.map((item: any) => ({
        id: item.id,
        item: item.item,
        checked: item.checked,
        notes: item.notes || undefined,
      })),
      photos: review.photos.map((photo: any) => ({
        id: photo.id,
        url: photo.url,
        caption: photo.caption || undefined,
      })),
      deviations: (review.deviations || []).map((d: any) => ({
        id: d.deviationType?.id,
        name: d.deviationType?.name,
      })),
    }));
  } catch (error) {
    console.error('Error fetching vehicle review history:', error);
    return [];
  }
}

// Obtener historial de revisiones de un control preventivo
export async function getControlReviewHistory(vehicleMaintenanceProgramId: string) {
  try {
    const reviews = await (prisma as any).preventiveControlReview.findMany({
      where: { vehicleMaintenanceProgramId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        checklistItems: {
          orderBy: { order: 'asc' },
        },
        photos: {
          orderBy: { order: 'asc' },
        },
        deviations: {
          include: {
            deviationType: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { reviewDate: 'desc' },
    });

    return reviews.map((review: any) => ({
      id: review.id,
      reviewDate: review.reviewDate,
      status: review.status,
      observations: review.observations || undefined,
      urgentRejectionReason: review.urgentRejectionReason || undefined,
      requiredActions: review.requiredActions || undefined,
      reviewer: {
        id: review.reviewer.id,
        name: review.reviewer.name,
        email: review.reviewer.email,
      },
      driver: review.driver ? {
        id: review.driver.id,
        name: review.driver.name,
        email: review.driver.email,
      } : undefined,
      checklistItems: review.checklistItems.map((item: any) => ({
        id: item.id,
        item: item.item,
        checked: item.checked,
        notes: item.notes || undefined,
      })),
      photos: review.photos.map((photo: any) => ({
        id: photo.id,
        url: photo.url,
        caption: photo.caption || undefined,
      })),
      deviations: (review.deviations || []).map((d: any) => ({
        id: d.deviationType?.id,
        name: d.deviationType?.name,
      })),
    }));
  } catch (error) {
    console.error('Error fetching review history:', error);
    return [];
  }
}
