'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { calculateNextDueDate } from '@/lib/date-utils';

export type PreventiveControl = {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePatent?: string;
  programId: string;
  programName: string;
  programDescription?: string;
  frequencyValue: number;
  frequencyUnit: string;
  lastResetDate?: Date;
  nextDueDate?: Date;
  scheduledTime?: string; // Hora programada (HH:mm)
  daysRemaining?: number;
  status: 'pending' | 'due' | 'overdue';
  createdAt: Date;
};

// Calcular próxima fecha basada en frecuencia y última fecha de reset
// Esta función se mantiene para compatibilidad, pero ahora usa la función helper
function calculateNextDueDateLocal(
  lastResetDate: Date | null,
  assignmentDate: Date,
  frequencyValue: number,
  frequencyUnit: string,
  useBusinessDays: boolean = false
): Date {
  const baseDate = lastResetDate || assignmentDate;
  return calculateNextDueDate(baseDate, frequencyValue, frequencyUnit, useBusinessDays);
}

// Obtener todos los controles preventivos
export async function getPreventiveControls(): Promise<PreventiveControl[]> {
  try {
    // Usar 'as any' temporalmente si Prisma Client no está sincronizado
    const assignments = await (prisma.vehicleMaintenanceProgram.findMany as any)({
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            patent: true,
          },
        },
        program: {
          select: {
            id: true,
            name: true,
            description: true,
            frequencyValue: true,
            frequencyUnit: true,
            useBusinessDays: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    const now = new Date();
    const controls: PreventiveControl[] = [];

    for (const assignment of assignments) {
      try {
        // Calcular próxima fecha si no existe
        // Usar 'as any' temporalmente hasta que Prisma Client se regenere después de la migración SQL
        const assignmentWithDates = assignment as any;
        let nextDueDate = assignmentWithDates.nextDueDate
          ? new Date(assignmentWithDates.nextDueDate)
          : null;
        const lastResetDate = assignmentWithDates.lastResetDate
          ? new Date(assignmentWithDates.lastResetDate)
          : null;

        if (!nextDueDate) {
          const useBusinessDays = assignment.program?.useBusinessDays || false;
          const baseDate = lastResetDate || new Date(assignment.createdAt);
          nextDueDate = calculateNextDueDate(
            baseDate,
            assignment.program.frequencyValue,
            assignment.program.frequencyUnit,
            useBusinessDays
          );
          console.log(`[Control Preventivo] Calculada próxima fecha para ${assignment.vehicle?.name}: ${nextDueDate.toISOString()}`);
        }

      // Calcular días restantes
      const daysRemaining = Math.ceil(
        (nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Determinar estado
      let status: 'pending' | 'due' | 'overdue' = 'pending';
      if (daysRemaining < 0) {
        status = 'overdue';
      } else if (daysRemaining <= 7) {
        status = 'due';
      }

        // Obtener hora programada si existe
        const scheduledTime = assignmentWithDates.scheduledTime || undefined;

        // Validar que tenemos los datos necesarios
        if (!assignment.vehicle || !assignment.program) {
          console.warn(`[Control Preventivo] Asignación ${assignment.id} tiene datos incompletos:`, {
            hasVehicle: !!assignment.vehicle,
            hasProgram: !!assignment.program,
          });
          continue;
        }

        controls.push({
          id: assignment.id,
          vehicleId: assignment.vehicle.id,
          vehicleName: assignment.vehicle.name,
          vehiclePatent: assignment.vehicle.patent || undefined,
          programId: assignment.program.id,
          programName: assignment.program.name,
          programDescription: assignment.program.description || undefined,
          frequencyValue: assignment.program.frequencyValue,
          frequencyUnit: assignment.program.frequencyUnit,
          lastResetDate: lastResetDate || undefined,
          nextDueDate,
          scheduledTime,
          daysRemaining,
          status,
          createdAt: assignment.createdAt,
        });
      } catch (assignmentError: any) {
        console.error(`[Control Preventivo] Error procesando asignación ${assignment.id}:`, assignmentError);
        console.error('[Control Preventivo] Detalles del error:', {
          message: assignmentError.message,
          assignment: {
            id: assignment.id,
            vehicleId: assignment.vehicleId,
            programId: assignment.programId,
          },
        });
        // Continuar con la siguiente asignación en lugar de fallar completamente
        continue;
      }
    }

    console.log(`[Control Preventivo] Encontrados ${controls.length} controles preventivos de ${assignments.length} asignaciones`);
    
    // Debug: Si hay asignaciones pero no controles, investigar
    if (assignments.length > 0 && controls.length === 0) {
      console.warn('[Control Preventivo] Hay asignaciones pero no se generaron controles. Revisando...');
      assignments.forEach((assignment: any, index: number) => {
        console.log(`[Debug] Asignación ${index + 1}:`, {
          id: assignment.id,
          vehicleId: assignment.vehicle?.id,
          vehicleName: assignment.vehicle?.name,
          programId: assignment.program?.id,
          programName: assignment.program?.name,
          nextDueDate: assignment.nextDueDate,
          lastResetDate: assignment.lastResetDate,
          createdAt: assignment.createdAt,
        });
      });
    }
    
    return controls;
  } catch (error: any) {
    console.error('[Control Preventivo] Error fetching preventive controls:', error);
    console.error('[Control Preventivo] Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    // Si es un error de Prisma Client desincronizado, intentar con casting
    if (error.message?.includes('Unknown field') || error.message?.includes('Unknown argument')) {
      console.warn('[Control Preventivo] Prisma Client puede estar desincronizado. Verifica que las migraciones SQL estén aplicadas y regenera Prisma Client.');
      console.warn('[Control Preventivo] Ejecuta: npm run db:generate');
    }
    return [];
  }
}

// Resetear un control preventivo (marcar como completado y recalcular próxima fecha)
export async function resetPreventiveControl(
  assignmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const assignment = await prisma.vehicleMaintenanceProgram.findUnique({
      where: { id: assignmentId },
      include: {
        program: {
          select: {
            frequencyValue: true,
            frequencyUnit: true,
          },
        },
      },
    });

    if (!assignment) {
      return { success: false, error: 'Control preventivo no encontrado.' };
    }

    const now = new Date();
    const nextDueDate = calculateNextDueDate(
      now, // Nueva fecha de reset
      assignment.createdAt,
      assignment.program.frequencyValue,
      assignment.program.frequencyUnit
    );

    // Usar 'as any' temporalmente hasta que Prisma Client se regenere después de la migración SQL
    await (prisma.vehicleMaintenanceProgram.update as any)({
      where: { id: assignmentId },
      data: {
        lastResetDate: now,
        nextDueDate,
      },
    });

    revalidatePath('/torque');
    return { success: true };
  } catch (error: any) {
    console.error('Error resetting preventive control:', error);
    return { success: false, error: 'No se pudo resetear el control preventivo.' };
  }
}

// Obtener controles preventivos por vehículo
export async function getPreventiveControlsByVehicle(
  vehicleId: string
): Promise<PreventiveControl[]> {
  const allControls = await getPreventiveControls();
  return allControls.filter((control) => control.vehicleId === vehicleId);
}
