'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { Vehicle } from '@/lib/types';
import { Truck, Calendar, Wrench, Building2 } from 'lucide-react';

export function ViewVehicleDialog({
  vehicle,
  open,
  onOpenChange,
}: {
  vehicle: Vehicle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const getStatusVariant = (status: Vehicle['status']) => {
    switch (status) {
      case 'Operational':
        return 'default';
      case 'Maintenance':
        return 'secondary';
      case 'Out of Service':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: Vehicle['status']) => {
    switch (status) {
      case 'Operational':
        return 'Operativo';
      case 'Maintenance':
        return 'En Mantenimiento';
      case 'Out of Service':
        return 'Fuera de Servicio';
      default:
        return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Detalles del Vehículo
          </DialogTitle>
          <DialogDescription>
            Información completa del vehículo
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{vehicle.name}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={getStatusVariant(vehicle.status)}>
                  {getStatusLabel(vehicle.status)}
                </Badge>
                {vehicle.patent && (
                  <Badge variant="outline">Patente: {vehicle.patent}</Badge>
                )}
              </div>
            </div>
            <Separator />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Truck className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Tipo</p>
                <p className="text-sm text-muted-foreground">{vehicle.type}</p>
              </div>
            </div>

            {(vehicle.brand || vehicle.model) && (
              <div className="flex items-start gap-3">
                <Wrench className="h-4 w-4 mt-0.5 text-muted-foreground" />
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
                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Año</p>
                  <p className="text-sm text-muted-foreground">{vehicle.year}</p>
                </div>
              </div>
            )}

            {vehicle.site && (
              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Faena</p>
                  <p className="text-sm text-muted-foreground">{vehicle.site}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Kilometraje</p>
              <p className="text-sm text-muted-foreground">
                {vehicle.mileage.toLocaleString()} km
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Horas Operativas</p>
              <p className="text-sm text-muted-foreground">
                {vehicle.operatingHours.toLocaleString()} horas
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
