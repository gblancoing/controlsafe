'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader, CheckCircle2, XCircle, AlertTriangle, Camera, Truck, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  getVehicleAndDriverInfo,
  getProgramChecklist,
  createPreventiveControlReview,
  type CreateReviewInput,
} from '../actions-reviews';
import { getMaintenancePrograms } from '@/app/mantenimiento/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PreventiveControl } from '../actions';

export function ReviewControlDialog({
  control,
  open,
  onOpenChange,
}: {
  control: PreventiveControl;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
  const [checklist, setChecklist] = useState<any[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<any[]>([]);
  const [observations, setObservations] = useState('');
  const [urgentRejectionReason, setUrgentRejectionReason] = useState('');
  const [requiredActions, setRequiredActions] = useState('');
  const [rejectionRepairProgramId, setRejectionRepairProgramId] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<'Approved' | 'Rejected' | 'UrgentRejected' | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [reviewDate, setReviewDate] = useState(new Date().toISOString().slice(0, 16));

  useEffect(() => {
    if (open && control) {
      setLoading(true);
      setError(null);
      setObservations('');
      setUrgentRejectionReason('');
      setRequiredActions('');
      setRejectionRepairProgramId('');
      setSelectedAction(null);
      setPhotos([]);
      setReviewDate(new Date().toISOString().slice(0, 16));

      Promise.all([
        getVehicleAndDriverInfo(control.vehicleId),
        getProgramChecklist(control.programId),
        getMaintenancePrograms(),
      ]).then(([vehicleData, checklistData, programsData]) => {
        setVehicleInfo(vehicleData);
        setAvailablePrograms(programsData);
        // Controles predefinidos del checklist
        const predefinedControls = [
          'Torque',
          'Visual',
          'Luces',
          'Alarmas',
          'Antenas',
          'Equipamiento',
          'Mecánico',
          'Otros',
        ];

        // Crear checklist combinando controles predefinidos y tareas del programa
        const checklistItems: any[] = [];

        // Primero agregar los controles predefinidos
        predefinedControls.forEach((control, index) => {
          checklistItems.push({
            programTaskId: undefined,
            item: control,
            checked: false,
            notes: '',
            order: index,
            isPredefined: true,
          });
        });

        // Luego agregar las tareas del programa si existen
        if (checklistData && checklistData.tasks.length > 0) {
          checklistData.tasks.forEach((task: any, index: number) => {
            checklistItems.push({
              programTaskId: task.id,
              item: task.task,
              checked: false,
              notes: '',
              order: predefinedControls.length + index,
              isPredefined: false,
            });
          });
        }

        setChecklist(checklistItems);
        setLoading(false);
      }).catch((err) => {
        console.error('Error loading review data:', err);
        setError('Error al cargar los datos del vehículo y programa');
        setLoading(false);
      });
    }
  }, [open, control]);

  const handleChecklistChange = (index: number, field: 'checked' | 'notes', value: boolean | string) => {
    const updated = [...checklist];
    updated[index] = { ...updated[index], [field]: value };
    setChecklist(updated);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Por ahora, simulamos URLs. En producción, deberías subir las fotos a un servidor
    const newPhotos: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPhotos.push(e.target.result as string);
          if (newPhotos.length === files.length) {
            setPhotos([...photos, ...newPhotos]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (status: 'Approved' | 'Rejected' | 'UrgentRejected') => {
    if (!vehicleInfo) {
      setError('No se pudo cargar la información del vehículo');
      return;
    }

    // Validar que al menos un item del checklist esté marcado
    const hasCheckedItems = checklist.some((item) => item.checked);
    if (!hasCheckedItems && status === 'Approved') {
      setError('Debe marcar al menos un item del checklist para aprobar el control');
      return;
    }

    // Validar rechazo urgente
    if (status === 'UrgentRejected') {
      if (!urgentRejectionReason.trim()) {
        setError('Debe especificar el motivo del rechazo urgente');
        return;
      }
      if (!requiredActions.trim()) {
        setError('Debe especificar las acciones requeridas para que el vehículo vuelva a estar operativo');
        return;
      }
      if (!rejectionRepairProgramId.trim()) {
        setError('Debe seleccionar un programa de reparación y ajuste para el rechazo urgente');
        return;
      }
    }

    // Validar rechazo normal - debe tener programa de reparación
    if (status === 'Rejected') {
      if (!rejectionRepairProgramId.trim()) {
        setError('Debe seleccionar un programa de reparación y ajuste para el rechazo');
        return;
      }
    }

    setError(null);

    // Obtener el usuario actual
    // TODO: En producción, obtener de la sesión/autenticación
    // Por ahora usamos el primer usuario Administrator disponible
    const currentUserId = 'admin'; // Se obtendrá del servidor en actions-reviews.ts

    const reviewData: CreateReviewInput = {
      vehicleMaintenanceProgramId: control.id,
      vehicleId: control.vehicleId,
      driverId: vehicleInfo.driver?.id,
      reviewedBy: currentUserId,
      reviewDate: new Date(reviewDate),
      status,
      observations: observations || undefined,
      urgentRejectionReason: status === 'UrgentRejected' ? urgentRejectionReason : undefined,
      requiredActions: status === 'UrgentRejected' ? requiredActions : undefined,
      rejectionRepairProgramId: status === 'Rejected' ? rejectionRepairProgramId : undefined,
      checklistItems: checklist,
      photoUrls: photos.length > 0 ? photos : undefined,
    };

    startTransition(async () => {
      const result = await createPreventiveControlReview(reviewData);
      if (result.error) {
        setError(result.error);
      } else {
        onOpenChange(false);
        setTimeout(() => {
          toast({
            title: status === 'Approved' ? 'Control Aprobado' : status === 'UrgentRejected' ? 'Control Rechazado Urgentemente' : 'Control Rechazado',
            description:
              status === 'Approved'
                ? 'El control preventivo ha sido aprobado y reseteado exitosamente. Nueva fecha programada según frecuencia.'
                : status === 'UrgentRejected'
                ? 'El control ha sido rechazado urgentemente. El vehículo está Inoperativo. Se ha asignado un programa de reparación y ajuste.'
                : 'El control preventivo ha sido rechazado. El vehículo sigue Operativo. Se ha asignado un programa de reparación y ajuste.',
          });
          router.refresh();
        }, 100);
      }
    });
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Revisar Control Preventivo</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader className="h-6 w-6 animate-spin" />
            <span className="ml-2">Cargando datos...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Revisar Control Preventivo</DialogTitle>
          <DialogDescription>
            Realiza la revisión del control preventivo según el programa asignado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Datos del Vehículo y Chofer */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Datos del Vehículo y Chofer
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <Label className="text-xs text-muted-foreground">Vehículo</Label>
                <div className="font-medium">
                  {vehicleInfo?.vehicle.name}
                  {vehicleInfo?.vehicle.patent && (
                    <Badge variant="outline" className="ml-2">
                      {vehicleInfo.vehicle.patent}
                    </Badge>
                  )}
                </div>
                {vehicleInfo?.vehicle.brand && vehicleInfo?.vehicle.model && (
                  <div className="text-sm text-muted-foreground">
                    {vehicleInfo.vehicle.brand} {vehicleInfo.vehicle.model}
                  </div>
                )}
                {vehicleInfo?.vehicle.companyName && (
                  <div className="text-xs text-muted-foreground">
                    Empresa: {vehicleInfo.vehicle.companyName}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Chofer Asignado</Label>
                {vehicleInfo?.driver ? (
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {vehicleInfo.driver.name}
                    </div>
                    <div className="text-sm text-muted-foreground">{vehicleInfo.driver.email}</div>
                    {vehicleInfo.driver.phone && (
                      <div className="text-xs text-muted-foreground">
                        Tel: {vehicleInfo.driver.phone}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Sin chofer asignado</div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Programa y Fecha de Revisión */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="program">Programa</Label>
              <div className="p-2 bg-muted rounded">
                <div className="font-medium">{control.programName}</div>
                {control.programDescription && (
                  <div className="text-sm text-muted-foreground">{control.programDescription}</div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  Frecuencia: {control.frequencyValue} {control.frequencyUnit}
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="reviewDate">Fecha y Hora de Revisión</Label>
              <Input
                id="reviewDate"
                type="datetime-local"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          {/* Checklist de Revisión */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Check List de Revisión</h3>
            <div className="border rounded-lg p-4">
              {/* Controles en horizontal */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {checklist.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Checkbox
                      id={`checklist-${index}`}
                      checked={item.checked}
                      onCheckedChange={(checked) =>
                        handleChecklistChange(index, 'checked', checked === true)
                      }
                    />
                    <Label
                      htmlFor={`checklist-${index}`}
                      className="font-medium cursor-pointer text-sm"
                    >
                      {item.item}
                    </Label>
                  </div>
                ))}
              </div>
              
              {/* Notas de items seleccionados */}
              {checklist.some((item) => item.checked) && (
                <div className="space-y-3 mt-4 pt-4 border-t">
                  <h4 className="text-xs font-semibold text-muted-foreground">Notas sobre items seleccionados:</h4>
                  {checklist.map((item, index) => (
                    item.checked && (
                      <div key={index} className="space-y-1">
                        <Label className="text-sm font-medium">{item.item}:</Label>
                        <Textarea
                          placeholder={`Notas sobre ${item.item}...`}
                          value={item.notes}
                          onChange={(e) => handleChecklistChange(index, 'notes', e.target.value)}
                          className="text-sm"
                          rows={2}
                        />
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observations">Observaciones</Label>
            <Textarea
              id="observations"
              placeholder="Ingrese observaciones generales sobre la revisión..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={4}
            />
          </div>

          {/* Adjuntar Fotos */}
          <div className="space-y-2">
            <Label htmlFor="photos">Adjuntar Fotografías</Label>
            <div className="flex items-center gap-2">
              <Input
                id="photos"
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="flex-1"
              />
              <Camera className="h-4 w-4 text-muted-foreground" />
            </div>
            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-0 right-0 h-5 w-5 p-0"
                      onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Campos para Rechazo Normal - Asignar Programa de Reparación */}
          {selectedAction === 'Rejected' && (
            <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <XCircle className="h-4 w-4" />
                <Label className="font-semibold">Asignar Programa de Reparación y Ajuste</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rejectionRepairProgram">Programa de Reparación</Label>
                <Select
                  value={rejectionRepairProgramId}
                  onValueChange={setRejectionRepairProgramId}
                >
                  <SelectTrigger id="rejectionRepairProgram">
                    <SelectValue placeholder="Seleccione un programa de reparación y ajuste..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePrograms.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No hay programas disponibles
                      </div>
                    ) : (
                      availablePrograms.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Este programa será asignado automáticamente al vehículo para realizar las reparaciones necesarias.
                </p>
              </div>
            </div>
          )}

          {/* Campos para Rechazo Urgente - Solo visible si se selecciona UrgentRejected */}
          {selectedAction === 'UrgentRejected' && (
            <div className="space-y-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <Label className="font-semibold">Rechazo Urgente</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgentRejectionReason">Motivo del Rechazo Urgente</Label>
                <Textarea
                  id="urgentRejectionReason"
                  placeholder="Especifique el motivo por el cual el vehículo no cumple con los requisitos..."
                  value={urgentRejectionReason}
                  onChange={(e) => setUrgentRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requiredActions">Acciones Requeridas para Volver a Operativo</Label>
                <Textarea
                  id="requiredActions"
                  placeholder="Especifique las acciones que se deben realizar para que el vehículo vuelva a estar operativo..."
                  value={requiredActions}
                  onChange={(e) => setRequiredActions(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgentRejectionRepairProgram">Programa de Reparación y Ajuste</Label>
                <Select
                  value={rejectionRepairProgramId}
                  onValueChange={setRejectionRepairProgramId}
                >
                  <SelectTrigger id="urgentRejectionRepairProgram">
                    <SelectValue placeholder="Seleccione un programa de reparación y ajuste..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePrograms.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No hay programas disponibles
                      </div>
                    ) : (
                      availablePrograms.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Este programa será asignado automáticamente al vehículo. Al completarlo, el vehículo volverá a estar operativo.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedAction(null);
              onOpenChange(false);
            }}
            disabled={isPending}
          >
            Cancelar
          </Button>
          {!selectedAction ? (
            <>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setSelectedAction('UrgentRejected')}
                disabled={isPending}
                className="gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Rechazar Urgente
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSelectedAction('Rejected')}
                disabled={isPending}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Rechazar
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit('Approved')}
                disabled={isPending}
                className="gap-2"
              >
                {isPending ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Aprobar Control
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedAction(null)}
                disabled={isPending}
              >
                Volver
              </Button>
              <Button
                type="button"
                variant={selectedAction === 'UrgentRejected' ? 'destructive' : 'secondary'}
                onClick={() => handleSubmit(selectedAction)}
                disabled={isPending}
                className="gap-2"
              >
                {isPending ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : selectedAction === 'UrgentRejected' ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Confirmar {selectedAction === 'UrgentRejected' ? 'Rechazo Urgente' : 'Rechazo'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
