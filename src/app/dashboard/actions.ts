'use server';

import { prisma } from '@/lib/db';
import { calculateNextDueDate } from '@/lib/date-utils';

// ============================================
// Métricas del Dashboard
// ============================================
export type DashboardMetrics = {
  fleet: {
    total: number;
    operational: number;
    maintenance: number;
    outOfService: number;
    notAllowedToOperate: number;
    operationalRate: number;
  };
  preventiveControls: {
    total: number;
    pending: number;
    due: number;
    overdue: number;
    complianceRate: number;
  };
  reviews: {
    total: number;
    approved: number;
    rejected: number;
    urgentRejected: number;
    approvalRate: number;
    thisMonth: number;
  };
  programs: {
    total: number;
    assigned: number;
    unassigned: number;
  };
  companies: {
    total: number;
    active: number;
  };
  projects: {
    total: number;
    active: number;
  };
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const { getAllowedCompanyIds, getAllowedProjectIds } = await import('@/lib/scope');
    const allowedCompanyIds = await getAllowedCompanyIds();
    const allowedProjectIds = await getAllowedProjectIds();
    const vehicleWhere = allowedCompanyIds === null ? {} : { companyId: { in: allowedCompanyIds } };
    const companyWhere = allowedCompanyIds === null ? {} : { id: { in: allowedCompanyIds } };
    const projectWhere = allowedProjectIds === null ? {} : { id: { in: allowedProjectIds } };

    // Flota
    const vehicles = await prisma.vehicle.findMany({
      where: vehicleWhere,
      select: {
        status: true,
        isOperational: true,
      },
    });

    const fleetStats = {
      total: vehicles.length,
      operational: vehicles.filter((v) => v.status === 'Operational').length,
      maintenance: vehicles.filter((v) => v.status === 'Maintenance').length,
      outOfService: vehicles.filter((v) => v.status === 'OutOfService').length,
      notAllowedToOperate: vehicles.filter((v) => v.status === 'NotAllowedToOperate').length,
    };

    const operationalRate =
      fleetStats.total > 0
        ? Math.round((fleetStats.operational / fleetStats.total) * 100)
        : 0;

    // Controles Preventivos
    const assignments = await (prisma.vehicleMaintenanceProgram.findMany as any)({
      include: {
        program: {
          select: {
            frequencyValue: true,
            frequencyUnit: true,
            useBusinessDays: true,
          },
        },
      },
    });

    const now = new Date();
    let totalControls = 0;
    let pending = 0;
    let due = 0;
    let overdue = 0;

    for (const assignment of assignments) {
      try {
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
        }

        const daysRemaining = Math.ceil(
          (nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        totalControls++;
        if (daysRemaining < 0) overdue++;
        else if (daysRemaining <= 7) due++;
        else pending++;
      } catch (error) {
        console.error(`Error processing assignment ${assignment.id}:`, error);
      }
    }

    const complianceRate =
      totalControls > 0 ? Math.round(((pending + due) / totalControls) * 100) : 0;

    // Revisiones
    const allReviews = await (prisma.preventiveControlReview.findMany as any)({
      where: { vehicle: vehicleWhere },
      select: {
        status: true,
        reviewDate: true,
      },
    });

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const reviewsThisMonth = allReviews.filter(
      (r: any) => new Date(r.reviewDate) >= thisMonth
    ).length;

    const reviewsStats = {
      total: allReviews.length,
      approved: allReviews.filter((r: any) => r.status === 'Approved').length,
      rejected: allReviews.filter((r: any) => r.status === 'Rejected').length,
      urgentRejected: allReviews.filter((r: any) => r.status === 'UrgentRejected').length,
      thisMonth: reviewsThisMonth,
    };

    const approvalRate =
      reviewsStats.total > 0
        ? Math.round((reviewsStats.approved / reviewsStats.total) * 100)
        : 0;

    // Programas
    const programs = await prisma.maintenanceProgram.findMany({
      include: {
        assignedVehicles: true,
      },
    });

    const programsStats = {
      total: programs.length,
      assigned: programs.filter((p) => p.assignedVehicles.length > 0).length,
      unassigned: programs.filter((p) => p.assignedVehicles.length === 0).length,
    };

    // Empresas
    const companies = await prisma.company.findMany({
      where: companyWhere,
      include: {
        vehicles: true,
      },
    });

    const companiesStats = {
      total: companies.length,
      active: companies.filter((c) => c.vehicles.length > 0).length,
    };

    // Proyectos
    const projects = await prisma.project.findMany({
      where: projectWhere,
    });
    const projectsStats = {
      total: projects.length,
      active: projects.length, // Por ahora todos son activos
    };

    return {
      fleet: {
        ...fleetStats,
        operationalRate,
      },
      preventiveControls: {
        total: totalControls,
        pending,
        due,
        overdue,
        complianceRate,
      },
      reviews: {
        ...reviewsStats,
        approvalRate,
      },
      programs: programsStats,
      companies: companiesStats,
      projects: projectsStats,
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return {
      fleet: {
        total: 0,
        operational: 0,
        maintenance: 0,
        outOfService: 0,
        notAllowedToOperate: 0,
        operationalRate: 0,
      },
      preventiveControls: {
        total: 0,
        pending: 0,
        due: 0,
        overdue: 0,
        complianceRate: 0,
      },
      reviews: {
        total: 0,
        approved: 0,
        rejected: 0,
        urgentRejected: 0,
        approvalRate: 0,
        thisMonth: 0,
      },
      programs: {
        total: 0,
        assigned: 0,
        unassigned: 0,
      },
      companies: {
        total: 0,
        active: 0,
      },
      projects: {
        total: 0,
        active: 0,
      },
    };
  }
}

// ============================================
// Alertas Críticas
// ============================================
export type CriticalAlert = {
  id: string;
  type: 'overdue_control' | 'inoperational_vehicle' | 'urgent_rejection' | 'expired_review';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  vehicleId?: string;
  vehicleName?: string;
  link?: string;
};

export async function getCriticalAlerts(): Promise<CriticalAlert[]> {
  try {
    const alerts: CriticalAlert[] = [];

    // Controles vencidos
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
            frequencyValue: true,
            frequencyUnit: true,
            useBusinessDays: true,
          },
        },
      },
    });

    const now = new Date();
    for (const assignment of assignments) {
      try {
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
        }

        const daysRemaining = Math.ceil(
          (nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysRemaining < 0) {
          alerts.push({
            id: `overdue-${assignment.id}`,
            type: 'overdue_control',
            severity: 'high',
            title: 'Control Preventivo Vencido',
            description: `${assignment.vehicle?.name || 'Vehículo'} - ${assignment.program?.name || 'Programa'}`,
            vehicleId: assignment.vehicle?.id,
            vehicleName: assignment.vehicle?.name,
            link: `/torque`,
          });
        }
      } catch (error) {
        console.error(`Error processing assignment ${assignment.id}:`, error);
      }
    }

    // Vehículos inoperativos
    const inoperationalVehicles = await prisma.vehicle.findMany({
      where: {
        OR: [
          { status: 'NotAllowedToOperate' },
          { isOperational: false },
        ],
      },
      include: {
        company: {
          select: {
            name: true,
          },
        },
      },
    });

    for (const vehicle of inoperationalVehicles) {
      alerts.push({
        id: `inoperational-${vehicle.id}`,
        type: 'inoperational_vehicle',
        severity: 'high',
        title: 'Vehículo Inoperativo',
        description: `${vehicle.name}${vehicle.company ? ` - ${vehicle.company.name}` : ''}`,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        link: `/flota/${vehicle.id}/ficha`,
      });
    }

    // Rechazos urgentes recientes (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const urgentRejections = await (prisma.preventiveControlReview.findMany as any)({
      where: {
        status: 'UrgentRejected',
        reviewDate: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 5,
    });

    for (const review of urgentRejections) {
      alerts.push({
        id: `urgent-${review.id}`,
        type: 'urgent_rejection',
        severity: 'high',
        title: 'Rechazo Urgente Reciente',
        description: `${review.vehicle?.name || 'Vehículo'} - ${new Date(review.reviewDate).toLocaleDateString('es-ES')}`,
        vehicleId: review.vehicle?.id,
        vehicleName: review.vehicle?.name,
        link: `/historial`,
      });
    }

    // Revisión técnica vencida
    const expiredTechnicalReviews = await prisma.vehicle.findMany({
      where: {
        technicalReviewExpiryDate: {
          lt: now,
        },
        isOperational: true,
      },
      include: {
        company: {
          select: {
            name: true,
          },
        },
      },
    });

    for (const vehicle of expiredTechnicalReviews) {
      alerts.push({
        id: `expired-review-${vehicle.id}`,
        type: 'expired_review',
        severity: 'high',
        title: 'Revisión Técnica Vencida',
        description: `${vehicle.name}${vehicle.company ? ` - ${vehicle.company.name}` : ''}`,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        link: `/flota/${vehicle.id}/ficha`,
      });
    }

    // Ordenar por severidad y fecha
    return alerts.slice(0, 10); // Limitar a 10 alertas más críticas
  } catch (error) {
    console.error('Error fetching critical alerts:', error);
    return [];
  }
}

// ============================================
// Tendencias (últimos 6 meses)
// ============================================
export type TrendData = {
  month: string;
  reviews: number;
  approvals: number;
  rejections: number;
};

export async function getTrendsData(): Promise<TrendData[]> {
  try {
    const reviews = await (prisma.preventiveControlReview.findMany as any)({
      select: {
        status: true,
        reviewDate: true,
      },
      orderBy: {
        reviewDate: 'desc',
      },
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentReviews = reviews.filter(
      (r: any) => new Date(r.reviewDate) >= sixMonthsAgo
    );

    const monthlyData = new Map<string, { reviews: number; approvals: number; rejections: number }>();

    for (const review of recentReviews) {
      const date = new Date(review.reviewDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { reviews: 0, approvals: 0, rejections: 0 });
      }

      const data = monthlyData.get(monthKey)!;
      data.reviews++;
      if (review.status === 'Approved') {
        data.approvals++;
      } else {
        data.rejections++;
      }
    }

    return Array.from(monthlyData.entries())
      .map(([key, data]) => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          month: date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' }),
          reviews: data.reviews,
          approvals: data.approvals,
          rejections: data.rejections,
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  } catch (error) {
    console.error('Error fetching trends data:', error);
    return [];
  }
}

// ============================================
// Resumen de Desviaciones (para Panel de Control)
// ============================================
const VEHICLE_TYPE_LABELS: Record<string, string> = {
  Excavator: 'Excavadora',
  'Haul Truck': 'Camión Minero',
  HaulTruck: 'Camión Minero',
  Dozer: 'Topadora',
  Loader: 'Cargador',
  Camioneta: 'Camioneta',
};

export type DeviationsSummary = {
  totalOccurrences: number;
  reviewsWithDeviations: number;
  topCauses: Array<{ name: string; count: number }>;
  byCompany: Array<{ companyName: string; total: number }>;
  byVehicleType: Array<{ vehicleTypeLabel: string; total: number }>;
};

export async function getDeviationsSummary(): Promise<DeviationsSummary> {
  try {
    const { getAllowedCompanyIds } = await import('@/lib/scope');
    const allowedIds = await getAllowedCompanyIds();
    const vehicleWhere = allowedIds === null ? {} : { companyId: { in: allowedIds } };
    const reviewWhere = allowedIds === null ? {} : { review: { vehicle: vehicleWhere } };
    const reviewDeviations = await (prisma as any).reviewDeviation.findMany({
      where: reviewWhere,
      include: {
        deviationType: { select: { name: true } },
        review: {
          select: {
            vehicleId: true,
            vehicle: {
              select: {
                type: true,
                companyId: true,
                company: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    const byTypeMap = new Map<string, number>();
    const reviewIdsWithDeviations = new Set<string>();
    const byCompanyMap = new Map<string, number>();
    const byVehicleTypeMap = new Map<string, number>();

    for (const rd of reviewDeviations) {
      const name = rd.deviationType?.name || 'Desconocido';
      byTypeMap.set(name, (byTypeMap.get(name) || 0) + 1);
      if (rd.reviewId) reviewIdsWithDeviations.add(rd.reviewId);

      const vehicle = rd.review?.vehicle;
      const companyName = vehicle?.company?.name || 'Sin empresa';
      byCompanyMap.set(companyName, (byCompanyMap.get(companyName) || 0) + 1);

      const rawType = vehicle?.type ?? 'Otro';
      const typeKey = String(rawType);
      const typeLabel = VEHICLE_TYPE_LABELS[typeKey] || typeKey;
      byVehicleTypeMap.set(typeLabel, (byVehicleTypeMap.get(typeLabel) || 0) + 1);
    }

    const topCauses = Array.from(byTypeMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const byCompany = Array.from(byCompanyMap.entries())
      .map(([companyName, total]) => ({ companyName, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const byVehicleType = Array.from(byVehicleTypeMap.entries())
      .map(([vehicleTypeLabel, total]) => ({ vehicleTypeLabel, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      totalOccurrences: reviewDeviations.length,
      reviewsWithDeviations: reviewIdsWithDeviations.size,
      topCauses,
      byCompany,
      byVehicleType,
    };
  } catch (error) {
    console.error('Error fetching deviations summary:', error);
    return {
      totalOccurrences: 0,
      reviewsWithDeviations: 0,
      topCauses: [],
      byCompany: [],
      byVehicleType: [],
    };
  }
}

// ============================================
// Actividad Reciente
// ============================================
export type RecentReview = {
  id: string;
  reviewDate: Date;
  status: string;
  vehicleName: string;
  programName: string;
  reviewerName?: string;
};

export async function getRecentReviews(): Promise<RecentReview[]> {
  try {
    const { getAllowedCompanyIds } = await import('@/lib/scope');
    const allowedIds = await getAllowedCompanyIds();
    const vehicleWhere = allowedIds === null ? {} : { companyId: { in: allowedIds } };
    const reviews = await (prisma.preventiveControlReview.findMany as any)({
      where: { vehicle: vehicleWhere },
      include: {
        vehicle: {
          select: {
            name: true,
          },
        },
        vehicleMaintenanceProgram: {
          include: {
            program: {
              select: {
                name: true,
              },
            },
          },
        },
        reviewer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        reviewDate: 'desc',
      },
      take: 5,
    });

    return reviews.map((review: any) => ({
      id: review.id,
      reviewDate: review.reviewDate,
      status: review.status,
      vehicleName: review.vehicle?.name || 'Vehículo desconocido',
      programName: review.vehicleMaintenanceProgram?.program?.name || 'Programa desconocido',
      reviewerName: review.reviewer?.name,
    }));
  } catch (error) {
    console.error('Error fetching recent reviews:', error);
    return [];
  }
}
