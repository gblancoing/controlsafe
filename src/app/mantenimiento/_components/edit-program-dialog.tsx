'use client';

import { useState, useTransition, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { updateMaintenanceProgram } from '../actions';
import { useRouter } from 'next/navigation';

type MaintenanceProgram = {
  id: string;
  name: string;
  description?: string;
  applicableVehicleType?: string;
  frequencyValue: number;
  frequencyUnit: string;
};

export function EditProgramDialog({
  program,
  open,
  onOpenChange,
}: {
  program: MaintenanceProgram;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>(program.applicableVehicleType || '');
  const [selectedUnit, setSelectedUnit] = useState<string>(program.frequencyUnit);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setError(null);
      setSelectedVehicleType(program.applicableVehicleType || '');
      setSelectedUnit(program.frequencyUnit);
    }
  }, [open, program]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const frequencyStr = formData.get('frequency') as string;

    if (!name) {
      setError('El nombre del programa es obligatorio.');
      return;
    }

    if (!selectedUnit) {
      setError('Debe seleccionar una unidad.');
      return;
    }

    const frequencyValue = frequencyStr ? parseInt(frequencyStr, 10) : 0;
    if (frequencyValue <= 0) {
      setError('La frecuencia debe ser mayor a 0.');
      return;
    }

    const applicableVehicleType = selectedVehicleType || undefined;

    startTransition(async () => {
      const result = await updateMaintenanceProgram(program.id, {
        name,
        description: description || undefined,
        applicableVehicleType: applicableVehicleType as 'Todos los tipos' | 'Camioneta' | 'Vehículo Liviano' | 'Camión' | 'Maquinaria Pesada' | undefined,
        frequencyValue,
        frequencyUnit: selectedUnit as 'Horas de Operación' | 'Kilómetros' | 'Días' | 'Semanas' | 'Meses' | 'Años',
      });

      if (result.error) {
        setError(result.error);
      } else {
        onOpenChange(false);
        setTimeout(() => {
          toast({
            title: 'Programa Actualizado',
            description: `El programa "${name}" ha sido actualizado con éxito.`,
          });
          router.refresh();
        }, 100);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) setError(null); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Programa de Mantenimiento</DialogTitle>
            <DialogDescription>
              Modifica los detalles del programa de mantenimiento.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error al actualizar programa</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nombre del Programa
              </Label>
              <Input
                id="edit-name"
                name="name"
                required
                className="col-span-3"
                defaultValue={program.name}
                placeholder="Ej: Servicio de 1000 Horas"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Descripción
              </Label>
              <Textarea
                id="edit-description"
                name="description"
                className="col-span-3"
                defaultValue={program.description}
                placeholder="Describe el propósito de este programa de mantenimiento."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-applicableVehicleType" className="text-right">
                Tipo de Vehículo Aplicable
              </Label>
              <Select
                value={selectedVehicleType}
                onValueChange={setSelectedVehicleType}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos los tipos">Todos los tipos</SelectItem>
                  <SelectItem value="Camioneta">Camioneta</SelectItem>
                  <SelectItem value="Vehículo Liviano">Vehículo Liviano</SelectItem>
                  <SelectItem value="Camión">Camión</SelectItem>
                  <SelectItem value="Maquinaria Pesada">Maquinaria Pesada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-frequency" className="text-right">
                Frecuencia
              </Label>
              <Input
                id="edit-frequency"
                name="frequency"
                type="number"
                required
                min="1"
                className="col-span-3"
                defaultValue={program.frequencyValue}
                placeholder="Ej: 500"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-frequencyUnit" className="text-right">
                Unidad
              </Label>
              <Select
                value={selectedUnit}
                onValueChange={setSelectedUnit}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione unidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Horas de Operación">Horas de Operación</SelectItem>
                  <SelectItem value="Kilómetros">Kilómetros</SelectItem>
                  <SelectItem value="Días">Días</SelectItem>
                  <SelectItem value="Semanas">Semanas</SelectItem>
                  <SelectItem value="Meses">Meses</SelectItem>
                  <SelectItem value="Años">Años</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isPending ? 'Actualizando...' : 'Actualizar Programa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
