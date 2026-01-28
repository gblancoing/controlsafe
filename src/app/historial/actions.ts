'use server';

import { prisma } from '@/lib/db';
import { calculateNextDueDate } from '@/lib/date-utils';

export type HistoryReview = {
  id: string;
  reviewDate: Date;
  status: 'Approved' | 'Rejected' | 'UrgentRejected';
  observations?: string;
  urgentRejectionReason?: string;
  requiredActions?: string;
  vehicle: {
    id: string;
    name: string;
    patent?: string;
    companyId?: string;
    companyName?: string;
  };
  program: {
    id: string;
    name: string;
    description?: string;
  };
  reviewer: {
    id: string;
    name: string;
  };
  driver?: {
    id: string;
    name: string;
  };
};

export type PendingControl = {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePatent?: string;
  companyId?: string;
  companyName?: string;
  programId: string;
  programName: string;
  nextDueDate: Date;
  scheduledTime?: string;
  daysRemaining: number;
  status: 'pending' | 'due' | 'overdue';
};

// Obtener historial de revisiones con filtros
export async function getHistoryReviews(
  companyId?: string,
  projectId?: string
): Promise<HistoryReview[]> {
  try {
    // Construir filtros para vehículos
    const vehicleWhere: any = {};
    
    if (companyId) {
      vehicleWhere.companyId = companyId;
    }

    // Si hay proyecto, necesitamos filtrar por usuarios del proyecto
    // Por ahora, filtramos solo por empresa ya que los vehículos están asociados a empresas
    // TODO: Agregar relación vehículo-proyecto si es necesario

    const reviews = await (prisma.preventiveControlReview.findMany as any)({
      where: {
        vehicle: vehicleWhere,
      },
      include: {
        vehicle: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        vehicleMaintenanceProgram: {
          include: {
            program: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        reviewDate: 'desc',
      },
    });

    return reviews.map((review: any) => ({
      id: review.id,
      reviewDate: review.reviewDate,
      status: review.status,
      observations: review.observations || undefined,
      urgentRejectionReason: review.urgentRejectionReason || undefined,
      requiredActions: review.requiredActions || undefined,
      vehicle: {
        id: review.vehicle.id,
        name: review.vehicle.name,
        patent: review.vehicle.patent || undefined,
        companyId: review.vehicle.companyId || undefined,
        companyName: review.vehicle.company?.name || undefined,
      },
      program: {
        id: review.vehicleMaintenanceProgram.program.id,
        name: review.vehicleMaintenanceProgram.program.name,
        description: review.vehicleMaintenanceProgram.program.description || undefined,
      },
      reviewer: {
        id: review.reviewer.id,
        name: review.reviewer.name,
      },
      driver: review.driver
        ? {
            id: review.driver.id,
            name: review.driver.name,
          }
        : undefined,
    }));
  } catch (error) {
    console.error('Error fetching history reviews:', error);
    return [];
  }
}

// Obtener programación pendiente con filtros
export async function getPendingControls(
  companyId?: string,
  projectId?: string
): Promise<PendingControl[]> {
  try {
    const vehicleWhere: any = {};
    
    if (companyId) {
      vehicleWhere.companyId = companyId;
    }

    const assignments = await (prisma.vehicleMaintenanceProgram.findMany as any)({
      where: {
        vehicle: vehicleWhere,
      },
      include: {
        vehicle: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        program: {
          select: {
            id: true,
            name: true,
            frequencyValue: true,
            frequencyUnit: true,
            useBusinessDays: true,
          },
        },
      },
      orderBy: [
        { nextDueDate: 'asc' },
      ],
    });

    const now = new Date();
    const pending: PendingControl[] = [];

    for (const assignment of assignments) {
      try {
        const assignmentWithDates = assignment as any;
        let nextDueDate = assignmentWithDates.nextDueDate
          ? new Date(assignmentWithDates.nextDueDate)
          : null;
        const lastResetDate = assignmentWithDates.lastResetDate
          ? new Date(assignmentWithDates.lastResetDate)
          : null;

        // Si no hay próxima fecha, calcularla
        if (!nextDueDate) {
          const useBusinessDays = assignment.program?.useBusinessDays || false;
          const baseDate = lastResetDate || new Date(assignment.createdAt);
          nextDueDate = calculateNextDueDate(
            baseDate,
            assignment.program.frequencyValue,
            assignment.program.frequencyUnit,
            useBusinessDays
          );
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

        pending.push({
          id: assignment.id,
          vehicleId: assignment.vehicle.id,
          vehicleName: assignment.vehicle.name,
          vehiclePatent: assignment.vehicle.patent || undefined,
          companyId: assignment.vehicle.companyId || undefined,
          companyName: assignment.vehicle.company?.name || undefined,
          programId: assignment.program.id,
          programName: assignment.program.name,
          nextDueDate,
          scheduledTime: assignmentWithDates.scheduledTime || undefined,
          daysRemaining,
          status,
        });
      } catch (error) {
        console.error(`Error processing assignment ${assignment.id}:`, error);
      }
    }

    return pending;
  } catch (error) {
    console.error('Error fetching pending controls:', error);
    return [];
  }
}

// Obtener todas las empresas (para filtro)
export async function getAllCompanies() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    });
    return companies;
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
}

// Obtener todos los proyectos (para filtro)
export async function getAllProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    });
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}
