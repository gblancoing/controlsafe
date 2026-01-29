'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Calendar, Wrench, Building2, FileCheck, FileText, ShieldCheck } from 'lucide-react';
import { getVehicleTypeLabel, getVehicleStatusLabel, getVehicleStatusVariant } from '@/lib/vehicle-utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type VehicleDetailCardProps = {
  vehicle: {
    id: string;
    patent?: string;
    name: string;
    type: string;
    brand?: string;
    model?: string;
    year?: number;
    status: string;
    companyName?: string;
    technicalReviewDate?: Date | string;
    technicalReviewExpiryDate?: Date | string;
    circulationPermitStatus?: string;
    documents?: Array<{ id: string; type: string; url: string; fileName?: string; caption?: string }>;
  };
};

function formatDate(d: Date | string): string {
  try {
    return format(new Date(d), 'dd-MM-yyyy', { locale: es });
  } catch {
    return '—';
  }
}

function getCirculationPermitVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'Vigente') return 'default';
  if (status === 'Vencido') return 'destructive';
  return 'secondary';
}

export function VehicleDetailCard({ vehicle }: VehicleDetailCardProps) {
  const reviewExpired =
    vehicle.technicalReviewExpiryDate != null &&
    new Date(vehicle.technicalReviewExpiryDate) < new Date();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{vehicle.name}</CardTitle>
            <CardDescription>ID/Patente: {vehicle.patent || vehicle.id}</CardDescription>
          </div>
          <Badge variant={getVehicleStatusVariant(vehicle.status)}>
            {getVehicleStatusLabel(vehicle.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Truck className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium">Tipo</p>
              <p className="text-sm text-muted-foreground">
                {getVehicleTypeLabel(vehicle.type)}
              </p>
            </div>
          </div>

          {(vehicle.brand || vehicle.model) && (
            <div className="flex items-start gap-3">
              <Wrench className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">Marca / Modelo</p>
                <p className="text-sm text-muted-foreground">
                  {vehicle.brand} {vehicle.model}
                </p>
              </div>
            </div>
          )}

          {vehicle.year != null && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">Año</p>
                <p className="text-sm text-muted-foreground">{vehicle.year}</p>
              </div>
            </div>
          )}

          {vehicle.companyName && (
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">Empresa Propietaria</p>
                <p className="text-sm text-muted-foreground">{vehicle.companyName}</p>
              </div>
            </div>
          )}

          {/* Fecha Revisión Técnica */}
          {(vehicle.technicalReviewDate || vehicle.technicalReviewExpiryDate) && (
            <div className="flex items-start gap-3 pt-2 border-t">
              <ShieldCheck className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Revisión Técnica</p>
                <div className="text-sm text-muted-foreground space-y-0.5">
                  {vehicle.technicalReviewDate && (
                    <p>Fecha revisión: {formatDate(vehicle.technicalReviewDate)}</p>
                  )}
                  {vehicle.technicalReviewExpiryDate && (
                    <p className={reviewExpired ? 'text-destructive font-medium' : ''}>
                      Vencimiento: {formatDate(vehicle.technicalReviewExpiryDate)}
                      {reviewExpired && ' (Vencida)'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Permiso de Circulación */}
          {vehicle.circulationPermitStatus && (
            <div className="flex items-start gap-3">
              <FileCheck className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">Permiso Circulación</p>
                <Badge
                  variant={getCirculationPermitVariant(vehicle.circulationPermitStatus)}
                  className="mt-0.5"
                >
                  {vehicle.circulationPermitStatus}
                </Badge>
              </div>
            </div>
          )}

          {/* Documentación */}
          <div className="flex items-start gap-3 pt-2 border-t">
            <FileText className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium">Documentación</p>
              {vehicle.documents && vehicle.documents.length > 0 ? (
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  {vehicle.documents.map((doc) => {
                    const fileSegment = doc.url.split('/').pop() || '';
                    const href = `/api/files/vehicles/${vehicle.id}/${encodeURIComponent(fileSegment)}`;
                    return (
                      <li key={doc.id}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {doc.fileName || doc.caption || doc.type}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Sin documentación cargada</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
