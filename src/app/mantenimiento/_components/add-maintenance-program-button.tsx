'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
import { PlusCircle, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { createMaintenanceProgram } from '../actions';
import { useRouter } from 'next/navigation';

export function AddMaintenanceProgramButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const { toast } = useToast();

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setError(null);
      setSelectedVehicleType('');
      setSelectedUnit('');
    }
  };

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
      const result = await createMaintenanceProgram({
        name,
        description: description || undefined,
        applicableVehicleType: applicableVehicleType as 'Todos los tipos' | 'Camioneta' | 'Vehículo Liviano' | 'Camión' | 'Maquinaria Pesada' | undefined,
        frequencyValue,
        frequencyUnit: selectedUnit as 'Horas de Operación' | 'Kilómetros' | 'Días' | 'Semanas' | 'Meses' | 'Años',
      });

      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setTimeout(() => {
          toast({
            title: 'Programa Creado',
            description: `El programa "${name}" ha sido creado con éxito.`,
          });
          router.refresh();
        }, 100);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Crear Programa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Programa de Mantenimiento</DialogTitle>
            <DialogDescription>
              Define una plantilla para mantenimientos recurrentes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error al crear programa</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre del Programa
              </Label>
              <Input
                id="name"
                name="name"
                required
                className="col-span-3"
                placeholder="Ej: Servicio de 1000 Horas"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripción
              </Label>
              <Textarea
                id="description"
                name="description"
                className="col-span-3"
                placeholder="Describe el propósito de este programa de mantenimiento."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="applicableVehicleType" className="text-right">
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
              <Label htmlFor="frequency" className="text-right">
                Frecuencia
              </Label>
              <Input
                id="frequency"
                name="frequency"
                type="number"
                required
                min="1"
                className="col-span-3"
                placeholder="Ej: 500"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frequencyUnit" className="text-right">
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
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isPending ? 'Creando...' : 'Crear Programa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
