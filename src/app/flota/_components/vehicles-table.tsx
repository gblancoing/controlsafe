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
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Truck } from 'lucide-react';
import type { Vehicle } from '@/lib/types';
import { VehicleActions } from './vehicle-actions';
import { getVehicleTypeLabel, getVehicleStatusLabel, getVehicleStatusVariant } from '@/lib/vehicle-utils';

export function VehiclesTable({
  initialVehicles,
  companiesMap,
}: {
  initialVehicles: Vehicle[] | null;
  companiesMap: Record<string, string>;
}) {
  if (!initialVehicles) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al cargar vehículos</AlertTitle>
        <AlertDescription>
          No se pudieron cargar los datos de los vehículos. Verifica la conexión a la base de datos.
        </AlertDescription>
      </Alert>
    );
  }

  if (initialVehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <Truck className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No hay vehículos registrados</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Para empezar, registra tu primer vehículo usando el botón de arriba.
        </p>
      </div>
    );
  }


  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patente</TableHead>
            <TableHead>Nombre / Tipo</TableHead>
            <TableHead>Marca / Modelo / Año</TableHead>
            <TableHead>Empresa Propietaria</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialVehicles.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell className="font-medium">
                {vehicle.patent || '-'}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{vehicle.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {vehicle.type === 'Haul Truck' ? 'Camión Minero' :
                     vehicle.type === 'Loader' ? 'Cargador' :
                     vehicle.type === 'Dozer' ? 'Topadora' :
                     vehicle.type === 'Excavator' ? 'Excavadora' :
                     vehicle.type}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  {vehicle.brand && vehicle.model && (
                    <span className="font-medium">{vehicle.brand} {vehicle.model}</span>
                  )}
                  {vehicle.year && (
                    <span className="text-sm text-muted-foreground">{vehicle.year}</span>
                  )}
                  {!vehicle.brand && !vehicle.model && !vehicle.year && (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {vehicle.companyId ? companiesMap[vehicle.companyId] || '-' : '-'}
              </TableCell>
              <TableCell>
                <Badge variant={getVehicleStatusVariant(vehicle.status)}>
                  {getVehicleStatusLabel(vehicle.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <VehicleActions vehicle={vehicle} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
