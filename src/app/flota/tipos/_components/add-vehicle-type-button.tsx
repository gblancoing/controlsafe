'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { createVehicleType } from '../actions';
import { useRouter } from 'next/navigation';

export function AddVehicleTypeButton() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    isActive: true,
  });

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
      const result = await createVehicleType({
        name: formData.name.trim(),
        displayName: formData.displayName.trim(),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive,
      });

      if (result.success) {
        toast({
          title: 'Tipo creado',
          description: 'El tipo de vehículo se ha creado correctamente.',
        });
        setOpen(false);
        setFormData({
          name: '',
          displayName: '',
          description: '',
          isActive: true,
        });
        setTimeout(() => router.refresh(), 150);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'No se pudo crear el tipo de vehículo.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Crear Tipo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Tipo de Vehículo</DialogTitle>
            <DialogDescription>
              Completa los detalles para crear un nuevo tipo de vehículo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre (ID interno) *</Label>
              <Input
                id="name"
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
              <Label htmlFor="displayName">Nombre para Mostrar *</Label>
              <Input
                id="displayName"
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
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción del tipo de vehículo..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isPending}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked === true })}
                disabled={isPending}
              />
              <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
                Tipo activo (disponible para seleccionar)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creando...' : 'Crear Tipo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
