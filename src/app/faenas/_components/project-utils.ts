import type { Project } from '@/lib/types';
import { CHILE_REGIONS } from '@/lib/chile-regions';

export function getProjectDisplayData(
  project: Project,
  companiesMap: Record<string, string>
) {
  const clientCompanyName = companiesMap[project.clientCompanyId] || 'N/A';
  
  // Buscar región por nombre (si está almacenado como string)
  const regionName = project.region || undefined;
  
  return {
    clientCompanyName,
    regionName,
  };
}
