'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Calendar, Wrench, Building2 } from 'lucide-react';
import { getVehicleTypeLabel, getVehicleStatusLabel, getVehicleStatusVariant } from '@/lib/vehicle-utils';

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
  };
};

export function VehicleDetailCard({ vehicle }: VehicleDetailCardProps) {
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
            <Truck className="h-5 w-5 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Tipo</p>
              <p className="text-sm text-muted-foreground">
                {getVehicleTypeLabel(vehicle.type)}
              </p>
            </div>
          </div>

          {(vehicle.brand || vehicle.model) && (
            <div className="flex items-start gap-3">
              <Wrench className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Marca / Modelo</p>
                <p className="text-sm text-muted-foreground">
                  {vehicle.brand} {vehicle.model}
                </p>
              </div>
            </div>
          )}

          {vehicle.year && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Año</p>
                <p className="text-sm text-muted-foreground">{vehicle.year}</p>
              </div>
            </div>
          )}

          {vehicle.companyName && (
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Empresa Propietaria</p>
                <p className="text-sm text-muted-foreground">{vehicle.companyName}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
