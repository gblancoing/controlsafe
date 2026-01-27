'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, FileText, Truck } from 'lucide-react';

type MaintenanceProgram = {
  id: string;
  name: string;
  description?: string;
  applicableVehicleType?: string;
  frequencyValue: number;
  frequencyUnit: string;
};

export function ViewProgramDialog({
  program,
  open,
  onOpenChange,
}: {
  program: MaintenanceProgram;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const formatFrequency = (value: number, unit: string) => {
    return `${value} ${unit}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ficha del Programa de Mantenimiento</DialogTitle>
          <DialogDescription>
            Información detallada del programa de mantenimiento.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Nombre del Programa</span>
            </div>
            <p className="text-sm">{program.name}</p>
          </div>

          <Separator />

          {program.description && (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Descripción</span>
                </div>
                <p className="text-sm text-muted-foreground">{program.description}</p>
              </div>
              <Separator />
            </>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Tipo de Vehículo Aplicable</span>
            </div>
            {program.applicableVehicleType ? (
              <Badge variant="outline">{program.applicableVehicleType}</Badge>
            ) : (
              <Badge variant="outline">Todos los tipos</Badge>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Frecuencia</span>
            </div>
            <Badge variant="secondary" className="text-sm">
              {formatFrequency(program.frequencyValue, program.frequencyUnit)}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
