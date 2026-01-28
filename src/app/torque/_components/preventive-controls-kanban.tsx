'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { type PreventiveControl } from '../actions';
import { AlertTriangle, Clock, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { ReviewControlDialog } from './review-control-dialog';

export function PreventiveControlsKanban({ controls }: { controls: PreventiveControl[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [reviewingControl, setReviewingControl] = useState<PreventiveControl | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const pendingControls = controls.filter((c) => c.status === 'pending');
  const dueControls = controls.filter((c) => c.status === 'due');
  const overdueControls = controls.filter((c) => c.status === 'overdue');

  if (controls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center space-y-4">
        <ClipboardCheck className="h-12 w-12 text-muted-foreground" />
        <div className="space-y-2">
          <p className="text-sm font-medium">No hay controles preventivos registrados</p>
          <p className="text-xs text-muted-foreground max-w-md">
            Para ver controles preventivos en el kanban, primero debes asignar programas de mantenimiento a los vehículos desde la página de administración de cada vehículo.
          </p>
        </div>
      </div>
    );
  }

  const ControlCard = ({ control }: { control: PreventiveControl }) => (
    <Card className="mb-2">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div>
            <div className="font-medium">{control.vehicleName}</div>
            {control.vehiclePatent && (
              <div className="text-xs text-muted-foreground">{control.vehiclePatent}</div>
            )}
          </div>
          <div>
            <div className="text-sm font-medium">{control.programName}</div>
            {control.programDescription && (
              <div className="text-xs text-muted-foreground line-clamp-2">
                {control.programDescription}
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Frecuencia: {control.frequencyValue} {control.frequencyUnit}
          </div>
          {control.nextDueDate && (
            <div className="text-xs">
              <div>
                Próxima: {format(new Date(control.nextDueDate), 'dd/MM/yyyy', { locale: es })}
              </div>
              {control.daysRemaining !== undefined && (
                <div className={control.daysRemaining < 0 ? 'text-red-600 font-medium' : ''}>
                  {control.daysRemaining < 0
                    ? `${Math.abs(control.daysRemaining)} días vencidos`
                    : `${control.daysRemaining} días restantes`}
                </div>
              )}
            </div>
          )}
          <div className="pt-2">
            <Button
              variant="default"
              size="sm"
              className="w-full gap-1"
              onClick={() => {
                setReviewingControl(control);
                setReviewDialogOpen(true);
              }}
            >
              <ClipboardCheck className="h-3 w-3" />
              Revisar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Columna: Pendientes */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
          <CheckCircle2 className="h-4 w-4" />
          <span className="font-semibold">Pendientes</span>
          <Badge variant="secondary">{pendingControls.length}</Badge>
        </div>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {pendingControls.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center p-4">
              No hay controles pendientes
            </div>
          ) : (
            pendingControls.map((control) => (
              <ControlCard key={control.id} control={control} />
            ))
          )}
        </div>
      </div>

      {/* Columna: Por Vencer */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <Clock className="h-4 w-4 text-orange-600" />
          <span className="font-semibold">Por Vencer</span>
          <Badge variant="default" className="bg-orange-500">
            {dueControls.length}
          </Badge>
        </div>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {dueControls.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center p-4">
              No hay controles por vencer
            </div>
          ) : (
            dueControls.map((control) => (
              <ControlCard key={control.id} control={control} />
            ))
          )}
        </div>
      </div>

      {/* Columna: Vencidos */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="font-semibold">Vencidos</span>
          <Badge variant="destructive">{overdueControls.length}</Badge>
        </div>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {overdueControls.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center p-4">
              No hay controles vencidos
            </div>
          ) : (
            overdueControls.map((control) => (
              <ControlCard key={control.id} control={control} />
            ))
          )}
        </div>
      </div>

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
