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
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Clock, ClipboardCheck } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { type PreventiveControl } from '../actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { ReviewControlDialog } from './review-control-dialog';

export function PreventiveControlsList({ controls }: { controls: PreventiveControl[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [reviewingControl, setReviewingControl] = useState<PreventiveControl | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const getStatusBadge = (status: PreventiveControl['status'], daysRemaining?: number) => {
    switch (status) {
      case 'overdue':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Vencido
          </Badge>
        );
      case 'due':
        return (
          <Badge variant="default" className="gap-1 bg-orange-500">
            <Clock className="h-3 w-3" />
            Por Vencer ({daysRemaining} días)
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Pendiente ({daysRemaining} días)
          </Badge>
        );
    }
  };

  if (controls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center space-y-4">
        <ClipboardCheck className="h-12 w-12 text-muted-foreground" />
        <div className="space-y-2">
          <p className="text-sm font-medium">No hay controles preventivos registrados</p>
          <p className="text-xs text-muted-foreground max-w-md">
            Para ver controles preventivos, primero debes asignar programas de mantenimiento a los vehículos desde la página de administración de cada vehículo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehículo</TableHead>
            <TableHead>Programa</TableHead>
            <TableHead>Frecuencia</TableHead>
            <TableHead>Último Reset</TableHead>
            <TableHead>Próxima Revisión</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {controls.map((control) => (
            <TableRow key={control.id}>
              <TableCell className="font-medium">
                <div>
                  <div>{control.vehicleName}</div>
                  {control.vehiclePatent && (
                    <div className="text-xs text-muted-foreground">
                      {control.vehiclePatent}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{control.programName}</div>
                  {control.programDescription && (
                    <div className="text-xs text-muted-foreground">
                      {control.programDescription}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {control.frequencyValue} {control.frequencyUnit}
              </TableCell>
              <TableCell>
                {control.lastResetDate
                  ? format(new Date(control.lastResetDate), 'dd/MM/yyyy', { locale: es })
                  : 'Nunca'}
              </TableCell>
              <TableCell>
                {control.nextDueDate
                  ? format(new Date(control.nextDueDate), 'dd/MM/yyyy', { locale: es })
                  : '-'}
              </TableCell>
              <TableCell>
                {getStatusBadge(control.status, control.daysRemaining)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setReviewingControl(control);
                    setReviewDialogOpen(true);
                  }}
                  className="gap-1"
                >
                  <ClipboardCheck className="h-3 w-3" />
                  Revisar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Diálogo de Revisión */}
      {reviewingControl && (
        <ReviewControlDialog
          control={reviewingControl}
          open={reviewDialogOpen}
          onOpenChange={(open) => {
            setReviewDialogOpen(open);
            if (!open) {
              setReviewingControl(null);
            }
          }}
        />
      )}
    </div>
  );
}
