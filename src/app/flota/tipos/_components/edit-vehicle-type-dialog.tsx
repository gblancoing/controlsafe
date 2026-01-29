'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateVehicleType, type VehicleTypeModel } from '../actions';
import { useRouter } from 'next/navigation';

export function EditVehicleTypeDialog({
  type,
  open,
  onOpenChange,
}: {
  type: VehicleTypeModel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: type.name,
    displayName: type.displayName,
    description: type.description || '',
    isActive: type.isActive,
  });

  // Actualizar el formulario cuando cambie el tipo
  useEffect(() => {
    setFormData({
      name: type.name,
      displayName: type.displayName,
      description: type.description || '',
      isActive: type.isActive,
    });
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre es obligatorio.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.displayName.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre para mostrar es obligatorio.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const result = await updateVehicleType({
        id: type.id,
        name: formData.name.trim(),
        displayName: formData.displayName.trim(),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive,
      });

      if (result.success) {
        toast({
          title: 'Tipo actualizado',
          description: 'El tipo de vehículo se ha actualizado correctamente.',
        });
        onOpenChange(false);
        setTimeout(() => router.refresh(), 150);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'No se pudo actualizar el tipo de vehículo.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Tipo de Vehículo</DialogTitle>
            <DialogDescription>
              Modifica los detalles del tipo de vehículo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nombre (ID interno) *</Label>
              <Input
                id="edit-name"
                placeholder="Ej: Excavator, Camioneta"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isPending}
                required
              />
              <p className="text-xs text-muted-foreground">
                Nombre técnico único (sin espacios, en inglés preferiblemente)
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-displayName">Nombre para Mostrar *</Label>
              <Input
                id="edit-displayName"
                placeholder="Ej: Excavadora, Camioneta"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                disabled={isPending}
                required
              />
              <p className="text-xs text-muted-foreground">
                Nombre que se mostrará en la interfaz de usuario
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                placeholder="Descripción del tipo de vehículo..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isPending}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked === true })}
                disabled={isPending}
              />
              <Label htmlFor="edit-isActive" className="text-sm font-normal cursor-pointer">
                Tipo activo (disponible para seleccionar)
              </Label>
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
              {isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
