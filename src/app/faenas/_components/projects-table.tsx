'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, FolderKanban } from 'lucide-react';
import type { Project } from '@/lib/types';
import { ProjectActions } from './project-actions';
import { getProjectDisplayData } from './project-utils';

export function ProjectsTable({ 
  initialProjects,
  companiesMap 
}: { 
  initialProjects: Project[] | null;
  companiesMap: Record<string, string>;
}) {
  if (!initialProjects) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al cargar proyectos</AlertTitle>
        <AlertDescription>
          No se pudieron cargar los datos de los proyectos. Verifica la conexión a la base de datos.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (initialProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <FolderKanban className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No hay proyectos registrados</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Para empezar, crea tu primer proyecto usando el botón de arriba.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre del Proyecto</TableHead>
            <TableHead>Empresa Mandante</TableHead>
            <TableHead>Región</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialProjects.map((project) => {
            const displayData = getProjectDisplayData(project, companiesMap);
            return (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{displayData.clientCompanyName}</TableCell>
                <TableCell>{displayData.regionName || '-'}</TableCell>
                <TableCell className="text-right">
                  <ProjectActions project={project} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
