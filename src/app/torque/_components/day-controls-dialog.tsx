'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { type PreventiveControl } from '../actions';
import { AlertTriangle, Clock, CheckCircle2, Calendar, ClipboardCheck } from 'lucide-react';
import { ReviewControlDialog } from './review-control-dialog';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function DayControlsDialog({
  date,
  controls,
  open,
  onOpenChange,
}: {
  date: Date;
  controls: PreventiveControl[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [reviewingControl, setReviewingControl] = useState<PreventiveControl | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const getStatusBadge = (status: PreventiveControl['status']) => {
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
            Por Vencer
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Pendiente
          </Badge>
        );
    }
  };

  // Ordenar controles por hora programada (si existe) o por nombre de vehículo
  const sortedControls = [...controls].sort((a, b) => {
    if (a.scheduledTime && b.scheduledTime) {
      return a.scheduledTime.localeCompare(b.scheduledTime);
    }
    if (a.scheduledTime) return -1;
    if (b.scheduledTime) return 1;
    return a.vehicleName.localeCompare(b.vehicleName);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Controles Preventivos - {format(date, 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es })}
          </DialogTitle>
          <DialogDescription>
            {controls.length === 0
              ? 'No hay controles preventivos programados para este día'
              : `${controls.length} control${controls.length > 1 ? 'es' : ''} programado${controls.length > 1 ? 's' : ''} para este día`}
          </DialogDescription>
        </DialogHeader>

        {controls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay controles preventivos programados para este día
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Hora</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Frecuencia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedControls.map((control) => (
                  <TableRow key={control.id}>
                    <TableCell className="font-medium">
                      {control.scheduledTime ? (
                        <span className="text-sm">{control.scheduledTime}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin hora</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{control.vehicleName}</div>
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
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {control.programDescription}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {control.frequencyValue} {control.frequencyUnit}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(control.status)}</TableCell>
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
          </div>
        )}

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
      </DialogContent>
    </Dialog>
  );
}
