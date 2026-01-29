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
import { X, Eye, FileDown } from 'lucide-react';
import type { HistoryReview } from '../actions';
import { format } from 'date-fns';
import { ReviewDetailDialog } from './review-detail-dialog';

type HistoryContentProps = {
  reviews: HistoryReview[];
  companies: { id: string; name: string }[];
  projects: { id: string; name: string }[];
  initialCompanyId?: string;
  initialProjectId?: string;
};

export function HistoryContent({
  reviews,
  companies,
  projects,
  initialCompanyId,
  initialProjectId,
}: HistoryContentProps) {
  const router = useRouter();
  const [selectedCompany, setSelectedCompany] = useState<string>(initialCompanyId || '__all__');
  const [selectedProject, setSelectedProject] = useState<string>(initialProjectId || '__all__');
  const [detailReviewId, setDetailReviewId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="default" className="bg-green-500">Aprobado</Badge>;
      case 'Rejected':
        return <Badge variant="secondary">Rechazado</Badge>;
      case 'UrgentRejected':
        return <Badge variant="destructive">Rechazo Urgente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <Label htmlFor="company-filter" className="text-sm whitespace-nowrap">
            Empresa:
          </Label>
          <Select value={selectedCompany} onValueChange={(value) => handleFilterChange('company', value)}>
            <SelectTrigger id="company-filter" className="w-[200px]">
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
          <Label htmlFor="project-filter" className="text-sm whitespace-nowrap">
            Proyecto:
          </Label>
          <Select value={selectedProject} onValueChange={(value) => handleFilterChange('project', value)}>
            <SelectTrigger id="project-filter" className="w-[200px]">
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

      {/* Tabla de historial */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay revisiones registradas con los filtros seleccionados.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Patente</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Programa</TableHead>
                <TableHead>Chofer</TableHead>
                <TableHead>Revisor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Observaciones</TableHead>
                <TableHead className="text-right w-[180px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(review.reviewDate), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>{review.vehicle.name}</TableCell>
                  <TableCell>{review.vehicle.patent || '-'}</TableCell>
                  <TableCell>{review.vehicle.companyName || '-'}</TableCell>
                  <TableCell>{review.program.name}</TableCell>
                  <TableCell>{review.driver?.name || '-'}</TableCell>
                  <TableCell>{review.reviewer.name}</TableCell>
                  <TableCell>{getStatusBadge(review.status)}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {review.observations || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 h-8"
                        onClick={() => {
                          setDetailReviewId(review.id);
                          setDetailOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        Ver registro
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 h-8"
                        asChild
                      >
                        <a
                          href={`/api/historial/revision/${review.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          <FileDown className="h-4 w-4" />
                          PDF
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ReviewDetailDialog
        reviewId={detailReviewId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        baseUrl={typeof window !== 'undefined' ? window.location.origin : ''}
      />
    </div>
  );
}
