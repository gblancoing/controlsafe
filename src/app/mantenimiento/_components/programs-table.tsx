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
import { ProgramActions } from './program-actions';

type MaintenanceProgram = {
  id: string;
  name: string;
  description?: string;
  applicableVehicleType?: string;
  frequencyValue: number;
  frequencyUnit: string;
  useBusinessDays?: boolean;
};

export function ProgramsTable({ programs }: { programs: MaintenanceProgram[] }) {
  const formatFrequency = (value: number, unit: string) => {
    return `${value} ${unit}`;
  };

  if (programs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">No hay programas de mantenimiento registrados</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre del Programa</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Tipo de Vehículo</TableHead>
            <TableHead>Frecuencia</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programs.map((program) => (
            <TableRow key={program.id}>
              <TableCell className="font-medium">{program.name}</TableCell>
              <TableCell className="max-w-md">
                <p className="text-sm text-muted-foreground truncate">
                  {program.description || '-'}
                </p>
              </TableCell>
              <TableCell>
                {program.applicableVehicleType ? (
                  <Badge variant="outline">{program.applicableVehicleType}</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">Todos los tipos</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {formatFrequency(program.frequencyValue, program.frequencyUnit)}
                  </Badge>
                  {program.useBusinessDays && (program.frequencyUnit === 'Días' || program.frequencyUnit === 'Semanas') && (
                    <Badge variant="outline" className="text-xs">
                      Solo días hábiles
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <ProgramActions program={program} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
