'use server';

import { prisma } from '@/lib/db';
import { calculateNextDueDate } from '@/lib/date-utils';

// ============================================
// Reporte de Cumplimiento de Controles Preventivos
// ============================================
export type ComplianceReport = {
  totalControls: number;
  pending: number;
  due: number;
  overdue: number;
  complianceRate: number; // Porcentaje de controles a tiempo (pending + due)
  byCompany: Array<{
    companyId: string;
    companyName: string;
    total: number;
    pending: number;
    due: number;
    overdue: number;
  }>;
  byProgram: Array<{
    programId: string;
    programName: string;
    total: number;
    pending: number;
    due: number;
    overdue: number;
  }>;
};

export async function getComplianceReport(): Promise<ComplianceReport> {
  try {
    const assignments = await (prisma.vehicleMaintenanceProgram.findMany as any)({
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
    });

    const now = new Date();
    let totalControls = 0;
    let pending = 0;
    let due = 0;
    let overdue = 0;

    const byCompanyMap = new Map<string, { companyId: string; companyName: string; total: number; pending: number; due: number; overdue: number }>();
    const byProgramMap = new Map<string, { programId: string; programName: string; total: number; pending: number; due: number; overdue: number }>();

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

        let status: 'pending' | 'due' | 'overdue' = 'pending';
        if (daysRemaining < 0) {
          status = 'overdue';
        } else if (daysRemaining <= 7) {
          status = 'due';
        }

        totalControls++;
        if (status === 'pending') pending++;
        else if (status === 'due') due++;
        else if (status === 'overdue') overdue++;

        // Por empresa
        const companyId = assignment.vehicle?.companyId || 'sin-empresa';
        const companyName = assignment.vehicle?.company?.name || 'Sin Empresa';
        if (!byCompanyMap.has(companyId)) {
          byCompanyMap.set(companyId, { companyId, companyName, total: 0, pending: 0, due: 0, overdue: 0 });
        }
        const companyData = byCompanyMap.get(companyId)!;
        companyData.total++;
        if (status === 'pending') companyData.pending++;
        else if (status === 'due') companyData.due++;
        else if (status === 'overdue') companyData.overdue++;

        // Por programa
        const programId = assignment.program?.id || 'sin-programa';
        const programName = assignment.program?.name || 'Sin Programa';
        if (!byProgramMap.has(programId)) {
          byProgramMap.set(programId, { programId, programName, total: 0, pending: 0, due: 0, overdue: 0 });
        }
        const programData = byProgramMap.get(programId)!;
        programData.total++;
        if (status === 'pending') programData.pending++;
        else if (status === 'due') programData.due++;
        else if (status === 'overdue') programData.overdue++;
      } catch (error) {
        console.error(`Error processing assignment ${assignment.id}:`, error);
      }
    }

    const complianceRate = totalControls > 0
      ? Math.round(((pending + due) / totalControls) * 100)
      : 0;

    return {
      totalControls,
      pending,
      due,
      overdue,
      complianceRate,
      byCompany: Array.from(byCompanyMap.values()),
      byProgram: Array.from(byProgramMap.values()),
    };
  } catch (error) {
    console.error('Error generating compliance report:', error);
    return {
      totalControls: 0,
      pending: 0,
      due: 0,
      overdue: 0,
      complianceRate: 0,
      byCompany: [],
      byProgram: [],
    };
  }
}

// ============================================
// Reporte de Estado de Flota
// ============================================
export type FleetStatusReport = {
  totalVehicles: number;
  operational: number;
  maintenance: number;
  outOfService: number;
  notAllowedToOperate: number;
  byType: Array<{
    type: string;
    total: number;
    operational: number;
    maintenance: number;
    outOfService: number;
    notAllowedToOperate: number;
  }>;
  byCompany: Array<{
    companyId: string;
    companyName: string;
    total: number;
    operational: number;
    maintenance: number;
    outOfService: number;
    notAllowedToOperate: number;
  }>;
  inoperationalVehicles: Array<{
    id: string;
    name: string;
    patent?: string;
    companyName?: string;
    status: string;
    reason?: string;
  }>;
};

export async function getFleetStatusReport(): Promise<FleetStatusReport> {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    let totalVehicles = 0;
    let operational = 0;
    let maintenance = 0;
    let outOfService = 0;
    let notAllowedToOperate = 0;

    const byTypeMap = new Map<string, { type: string; total: number; operational: number; maintenance: number; outOfService: number; notAllowedToOperate: number }>();
    const byCompanyMap = new Map<string, { companyId: string; companyName: string; total: number; operational: number; maintenance: number; outOfService: number; notAllowedToOperate: number }>();
    const inoperationalVehicles: Array<{ id: string; name: string; patent?: string; companyName?: string; status: string; reason?: string }> = [];

    for (const vehicle of vehicles) {
      totalVehicles++;
      const status = vehicle.status as string;

      if (status === 'Operational') operational++;
      else if (status === 'Maintenance') maintenance++;
      else if (status === 'Out of Service') outOfService++;
      else if (status === 'Not Allowed to Operate') notAllowedToOperate++;

      // Por tipo
      const type = vehicle.type as string;
      if (!byTypeMap.has(type)) {
        byTypeMap.set(type, { type, total: 0, operational: 0, maintenance: 0, outOfService: 0, notAllowedToOperate: 0 });
      }
      const typeData = byTypeMap.get(type)!;
      typeData.total++;
      if (status === 'Operational') typeData.operational++;
      else if (status === 'Maintenance') typeData.maintenance++;
      else if (status === 'Out of Service') typeData.outOfService++;
      else if (status === 'Not Allowed to Operate') typeData.notAllowedToOperate++;

      // Por empresa
      const companyId = vehicle.companyId || 'sin-empresa';
      const companyName = vehicle.company?.name || 'Sin Empresa';
      if (!byCompanyMap.has(companyId)) {
        byCompanyMap.set(companyId, { companyId, companyName, total: 0, operational: 0, maintenance: 0, outOfService: 0, notAllowedToOperate: 0 });
      }
      const companyData = byCompanyMap.get(companyId)!;
      companyData.total++;
      if (status === 'Operational') companyData.operational++;
      else if (status === 'Maintenance') companyData.maintenance++;
      else if (status === 'Out of Service') companyData.outOfService++;
      else if (status === 'Not Allowed to Operate') companyData.notAllowedToOperate++;

      // Vehículos inoperativos
      if (status === 'Not Allowed to Operate' || !vehicle.isOperational) {
        let reason = '';
        if (vehicle.technicalReviewExpiryDate && new Date(vehicle.technicalReviewExpiryDate) < new Date()) {
          reason = 'Revisión técnica vencida';
        } else if (vehicle.circulationPermitStatus === 'Vencido') {
          reason = 'Permiso de circulación vencido';
        } else {
          reason = 'Marcado como inoperativo';
        }
        inoperationalVehicles.push({
          id: vehicle.id,
          name: vehicle.name,
          patent: vehicle.patent || undefined,
          companyName: vehicle.company?.name || undefined,
          status,
          reason,
        });
      }
    }

    return {
      totalVehicles,
      operational,
      maintenance,
      outOfService,
      notAllowedToOperate,
      byType: Array.from(byTypeMap.values()),
      byCompany: Array.from(byCompanyMap.values()),
      inoperationalVehicles,
    };
  } catch (error) {
    console.error('Error generating fleet status report:', error);
    return {
      totalVehicles: 0,
      operational: 0,
      maintenance: 0,
      outOfService: 0,
      notAllowedToOperate: 0,
      byType: [],
      byCompany: [],
      inoperationalVehicles: [],
    };
  }
}

// ============================================
// Reporte de Utilización de Programas
// ============================================
export type ProgramUtilizationReport = {
  totalPrograms: number;
  assignedPrograms: number;
  unassignedPrograms: number;
  programs: Array<{
    id: string;
    name: string;
    description?: string;
    assignedVehicles: number;
    totalReviews: number;
    approvedReviews: number;
    rejectedReviews: number;
    urgentRejectedReviews: number;
    approvalRate: number;
  }>;
};

export async function getProgramUtilizationReport(): Promise<ProgramUtilizationReport> {
  try {
    const programs = await prisma.maintenanceProgram.findMany({
      include: {
        assignedVehicles: true,
      },
    });

    const reviews = await (prisma.preventiveControlReview.findMany as any)({
      include: {
        vehicleMaintenanceProgram: {
          include: {
            program: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    const programStatsMap = new Map<string, { totalReviews: number; approved: number; rejected: number; urgentRejected: number }>();

    for (const review of reviews) {
      const programId = review.vehicleMaintenanceProgram?.program?.id;
      if (!programId) continue;

      if (!programStatsMap.has(programId)) {
        programStatsMap.set(programId, { totalReviews: 0, approved: 0, rejected: 0, urgentRejected: 0 });
      }
      const stats = programStatsMap.get(programId)!;
      stats.totalReviews++;
      if (review.status === 'Approved') stats.approved++;
      else if (review.status === 'Rejected') stats.rejected++;
      else if (review.status === 'UrgentRejected') stats.urgentRejected++;
    }

    const programsData = programs.map((program) => {
      const stats = programStatsMap.get(program.id) || { totalReviews: 0, approved: 0, rejected: 0, urgentRejected: 0 };
      const approvalRate = stats.totalReviews > 0
        ? Math.round((stats.approved / stats.totalReviews) * 100)
        : 0;

      return {
        id: program.id,
        name: program.name,
        description: program.description || undefined,
        assignedVehicles: program.assignedVehicles.length,
        totalReviews: stats.totalReviews,
        approvedReviews: stats.approved,
        rejectedReviews: stats.rejected,
        urgentRejectedReviews: stats.urgentRejected,
        approvalRate,
      };
    });

    const assignedPrograms = programsData.filter((p) => p.assignedVehicles > 0).length;
    const unassignedPrograms = programsData.filter((p) => p.assignedVehicles === 0).length;

    return {
      totalPrograms: programs.length,
      assignedPrograms,
      unassignedPrograms,
      programs: programsData,
    };
  } catch (error) {
    console.error('Error generating program utilization report:', error);
    return {
      totalPrograms: 0,
      assignedPrograms: 0,
      unassignedPrograms: 0,
      programs: [],
    };
  }
}

// ============================================
// Reporte de Revisiones
// ============================================
export type ReviewsReport = {
  totalReviews: number;
  approved: number;
  rejected: number;
  urgentRejected: number;
  approvalRate: number;
  byMonth: Array<{
    month: string;
    total: number;
    approved: number;
    rejected: number;
    urgentRejected: number;
  }>;
  byCompany: Array<{
    companyId: string;
    companyName: string;
    total: number;
    approved: number;
    rejected: number;
    urgentRejected: number;
  }>;
  byProgram: Array<{
    programId: string;
    programName: string;
    total: number;
    approved: number;
    rejected: number;
    urgentRejected: number;
  }>;
};

export async function getReviewsReport(): Promise<ReviewsReport> {
  try {
    const reviews = await (prisma.preventiveControlReview.findMany as any)({
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
              },
            },
          },
        },
      },
      orderBy: {
        reviewDate: 'desc',
      },
    });

    let totalReviews = 0;
    let approved = 0;
    let rejected = 0;
    let urgentRejected = 0;

    const byMonthMap = new Map<string, { month: string; total: number; approved: number; rejected: number; urgentRejected: number }>();
    const byCompanyMap = new Map<string, { companyId: string; companyName: string; total: number; approved: number; rejected: number; urgentRejected: number }>();
    const byProgramMap = new Map<string, { programId: string; programName: string; total: number; approved: number; rejected: number; urgentRejected: number }>();

    for (const review of reviews) {
      totalReviews++;
      const status = review.status as string;

      if (status === 'Approved') approved++;
      else if (status === 'Rejected') rejected++;
      else if (status === 'UrgentRejected') urgentRejected++;

      // Por mes
      const reviewDate = new Date(review.reviewDate);
      const monthKey = `${reviewDate.getFullYear()}-${String(reviewDate.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = reviewDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
      if (!byMonthMap.has(monthKey)) {
        byMonthMap.set(monthKey, { month: monthLabel, total: 0, approved: 0, rejected: 0, urgentRejected: 0 });
      }
      const monthData = byMonthMap.get(monthKey)!;
      monthData.total++;
      if (status === 'Approved') monthData.approved++;
      else if (status === 'Rejected') monthData.rejected++;
      else if (status === 'UrgentRejected') monthData.urgentRejected++;

      // Por empresa
      const companyId = review.vehicle?.companyId || 'sin-empresa';
      const companyName = review.vehicle?.company?.name || 'Sin Empresa';
      if (!byCompanyMap.has(companyId)) {
        byCompanyMap.set(companyId, { companyId, companyName, total: 0, approved: 0, rejected: 0, urgentRejected: 0 });
      }
      const companyData = byCompanyMap.get(companyId)!;
      companyData.total++;
      if (status === 'Approved') companyData.approved++;
      else if (status === 'Rejected') companyData.rejected++;
      else if (status === 'UrgentRejected') companyData.urgentRejected++;

      // Por programa
      const programId = review.vehicleMaintenanceProgram?.program?.id || 'sin-programa';
      const programName = review.vehicleMaintenanceProgram?.program?.name || 'Sin Programa';
      if (!byProgramMap.has(programId)) {
        byProgramMap.set(programId, { programId, programName, total: 0, approved: 0, rejected: 0, urgentRejected: 0 });
      }
      const programData = byProgramMap.get(programId)!;
      programData.total++;
      if (status === 'Approved') programData.approved++;
      else if (status === 'Rejected') programData.rejected++;
      else if (status === 'UrgentRejected') programData.urgentRejected++;
    }

    const approvalRate = totalReviews > 0
      ? Math.round((approved / totalReviews) * 100)
      : 0;

    return {
      totalReviews,
      approved,
      rejected,
      urgentRejected,
      approvalRate,
      byMonth: Array.from(byMonthMap.values()).sort((a, b) => b.month.localeCompare(a.month)),
      byCompany: Array.from(byCompanyMap.values()),
      byProgram: Array.from(byProgramMap.values()),
    };
  } catch (error) {
    console.error('Error generating reviews report:', error);
    return {
      totalReviews: 0,
      approved: 0,
      rejected: 0,
      urgentRejected: 0,
      approvalRate: 0,
      byMonth: [],
      byCompany: [],
      byProgram: [],
    };
  }
}
