'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Settings } from 'lucide-react';
import type { VehicleTypeModel } from '../actions';
import { VehicleTypeActions } from './vehicle-type-actions';

export function VehicleTypesTable({
  initialTypes,
}: {
  initialTypes: VehicleTypeModel[];
}) {
  if (initialTypes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <Settings className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No hay tipos de vehículos registrados</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Para empezar, crea tu primer tipo de vehículo usando el botón de arriba.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Nombre para Mostrar</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialTypes.map((type) => (
            <TableRow key={type.id}>
              <TableCell className="font-medium">
                {type.name}
              </TableCell>
              <TableCell>
                {type.displayName}
              </TableCell>
              <TableCell>
                {type.description || '-'}
              </TableCell>
              <TableCell>
                <Badge variant={type.isActive ? 'default' : 'secondary'}>
                  {type.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <VehicleTypeActions type={type} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
