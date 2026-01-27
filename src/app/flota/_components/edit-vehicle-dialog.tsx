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
import { updateVehicle, getAllCompanies } from '../actions';
import { useRouter } from 'next/navigation';
import type { Vehicle } from '@/lib/types';

export function EditVehicleDialog({
  vehicle,
  open,
  onOpenChange,
}: {
  vehicle: Vehicle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setError(null);
      getAllCompanies().then(setCompanies);
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const patent = formData.get('patent') as string;
    const name = formData.get('name') as string;
    const type = formData.get('type') as Vehicle['type'];
    const brand = formData.get('brand') as string;
    const model = formData.get('model') as string;
    const yearStr = formData.get('year') as string;
    const companyId = formData.get('companyId') as string;

    if (!name || !type) {
      setError('El nombre y el tipo son obligatorios.');
      return;
    }

    const year = yearStr ? parseInt(yearStr, 10) : undefined;

    startTransition(async () => {
      const result = await updateVehicle(vehicle.id, {
        patent: patent || undefined,
        name,
        type,
        brand: brand || undefined,
        model: model || undefined,
        year,
        companyId: companyId || undefined,
      });
      if (result.error) {
        setError(result.error);
      } else {
        // Cerrar el diálogo primero
        onOpenChange(false);
        // Esperar un momento para que el diálogo se cierre completamente
        setTimeout(() => {
          toast({
            title: 'Vehículo Actualizado',
            description: `El vehículo ${name} ha sido actualizado con éxito.`,
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
            <DialogTitle>Editar Vehículo</DialogTitle>
            <DialogDescription>
              Modifica los detalles del vehículo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error al actualizar vehículo</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-patent" className="text-right">
                Patente
              </Label>
              <Input
                id="edit-patent"
                name="patent"
                className="col-span-3"
                defaultValue={vehicle.patent}
                placeholder="Ej: ABCD-12"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nombre
              </Label>
              <Input
                id="edit-name"
                name="name"
                required
                className="col-span-3"
                defaultValue={vehicle.name}
                placeholder="Ej: Camioneta Supervisor 1"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">
                Tipo
              </Label>
              <Select name="type" required defaultValue={vehicle.type}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excavator">Excavator</SelectItem>
                  <SelectItem value="Haul Truck">Haul Truck</SelectItem>
                  <SelectItem value="Dozer">Dozer</SelectItem>
                  <SelectItem value="Loader">Loader</SelectItem>
                  <SelectItem value="Camioneta">Camioneta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-brand" className="text-right">
                Marca
              </Label>
              <Input
                id="edit-brand"
                name="brand"
                className="col-span-3"
                defaultValue={vehicle.brand}
                placeholder="Ej: Toyota"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-model" className="text-right">
                Modelo
              </Label>
              <Input
                id="edit-model"
                name="model"
                className="col-span-3"
                defaultValue={vehicle.model}
                placeholder="Ej: Hilux"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-year" className="text-right">
                Año
              </Label>
              <Input
                id="edit-year"
                name="year"
                type="number"
                className="col-span-3"
                defaultValue={vehicle.year}
                placeholder="Ej: 2023"
                min="1900"
                max="2100"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-companyId" className="text-right">
                Propietario
              </Label>
              <Select name="companyId" defaultValue={vehicle.companyId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione una empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
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
              {isPending ? 'Actualizando...' : 'Actualizar Vehículo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
