'use server';

import { getCurrentUserScope } from '@/lib/auth';
import { prisma } from '@/lib/db';

/** IDs de empresas que el usuario puede ver. SuperAdmin: null = todas. Admin: del proyecto. Otros: solo la suya. */
export async function getAllowedCompanyIds(): Promise<string[] | null> {
  const scope = await getCurrentUserScope();
  if (!scope) return [];
  if (scope.role === 'SuperAdmin') return null; // null = sin filtro (todas)
  if (scope.role === 'Administrator' && scope.projectId) {
    const project = await (prisma as any).project.findUnique({
      where: { id: scope.projectId },
      include: {
        clientCompany: { select: { id: true } },
        subcontractors: { select: { companyId: true } },
      },
    });
    if (!project) return [];
    const ids = [project.clientCompany?.id].filter(Boolean) as string[];
    const subIds = (project.subcontractors || []).map((s: any) => s.companyId);
    return [...new Set([...ids, ...subIds])];
  }
  if (scope.companyId) return [scope.companyId];
  return [];
}

/** IDs de proyectos que el usuario puede ver. SuperAdmin: null = todos. Admin: solo el suyo. Otros: solo el suyo si tiene. */
export async function getAllowedProjectIds(): Promise<string[] | null> {
  const scope = await getCurrentUserScope();
  if (!scope) return [];
  if (scope.role === 'SuperAdmin') return null;
  if (scope.role === 'Administrator' && scope.projectId) return [scope.projectId];
  if (scope.projectId) return [scope.projectId];
  return [];
}
