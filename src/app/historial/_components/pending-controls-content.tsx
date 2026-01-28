'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import type { PendingControl } from '../actions';
import { format } from 'date-fns';

type PendingControlsContentProps = {
  pendingControls: PendingControl[];
  companies: { id: string; name: string }[];
  projects: { id: string; name: string }[];
  initialCompanyId?: string;
  initialProjectId?: string;
};

export function PendingControlsContent({
  pendingControls,
  companies,
  projects,
  initialCompanyId,
  initialProjectId,
}: PendingControlsContentProps) {
  const router = useRouter();
  const [selectedCompany, setSelectedCompany] = useState<string>(initialCompanyId || '__all__');
  const [selectedProject, setSelectedProject] = useState<string>(initialProjectId || '__all__');

  const handleFilterChange = (type: 'company' | 'project', value: string) => {
    const params = new URLSearchParams();
    
    if (type === 'company') {
      setSelectedCompany(value);
      if (value !== '__all__') {
        params.set('company', value);
      }
      if (selectedProject !== '__all__') {
        params.set('project', selectedProject);
      }
    } else {
      setSelectedProject(value);
      if (value !== '__all__') {
        params.set('project', value);
      }
      if (selectedCompany !== '__all__') {
        params.set('company', selectedCompany);
      }
    }

    const queryString = params.toString();
    router.push(`/historial${queryString ? `?${queryString}` : ''}`);
  };

  const clearFilters = () => {
    setSelectedCompany('__all__');
    setSelectedProject('__all__');
    router.push('/historial');
  };

  const getStatusBadge = (status: string, daysRemaining: number) => {
    if (status === 'overdue') {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Vencido ({Math.abs(daysRemaining)} días)
        </Badge>
      );
    } else if (status === 'due') {
      return (
        <Badge variant="secondary" className="gap-1 bg-yellow-500">
          <Clock className="h-3 w-3" />
          Por vencer ({daysRemaining} días)
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Pendiente ({daysRemaining} días)
        </Badge>
      );
    }
  };

  // Ordenar: primero vencidos, luego por vencer, luego pendientes
  const sortedControls = [...pendingControls].sort((a, b) => {
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (a.status !== 'overdue' && b.status === 'overdue') return 1;
    if (a.status === 'due' && b.status === 'pending') return -1;
    if (a.status === 'pending' && b.status === 'due') return 1;
    return a.daysRemaining - b.daysRemaining;
  });

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <Label htmlFor="company-filter-pending" className="text-sm whitespace-nowrap">
            Empresa:
          </Label>
          <Select value={selectedCompany} onValueChange={(value) => handleFilterChange('company', value)}>
            <SelectTrigger id="company-filter-pending" className="w-[200px]">
              <SelectValue placeholder="Todas las empresas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas las empresas</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="project-filter-pending" className="text-sm whitespace-nowrap">
            Proyecto:
          </Label>
          <Select value={selectedProject} onValueChange={(value) => handleFilterChange('project', value)}>
            <SelectTrigger id="project-filter-pending" className="w-[200px]">
              <SelectValue placeholder="Todos los proyectos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos los proyectos</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(selectedCompany !== '__all__' || selectedProject !== '__all__') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Tabla de programación pendiente */}
      {sortedControls.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay controles pendientes con los filtros seleccionados.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehículo</TableHead>
                <TableHead>Patente</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Programa</TableHead>
                <TableHead>Próxima Revisión</TableHead>
                <TableHead>Hora Programada</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Días Restantes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedControls.map((control) => (
                <TableRow key={control.id}>
                  <TableCell>{control.vehicleName}</TableCell>
                  <TableCell>{control.vehiclePatent || '-'}</TableCell>
                  <TableCell>{control.companyName || '-'}</TableCell>
                  <TableCell>{control.programName}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(control.nextDueDate), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{control.scheduledTime || '-'}</TableCell>
                  <TableCell>{getStatusBadge(control.status, control.daysRemaining)}</TableCell>
                  <TableCell className={control.daysRemaining < 0 ? 'text-destructive font-semibold' : ''}>
                    {control.daysRemaining < 0 
                      ? `${Math.abs(control.daysRemaining)} días vencidos`
                      : `${control.daysRemaining} días`
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
