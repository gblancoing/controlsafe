'use client';

import { useState, useTransition } from 'react';
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
import { updateCompany } from '../actions';
import { useRouter } from 'next/navigation';
import type { Company, CompanyType } from '@/lib/types';

export function EditCompanyDialog({
  company,
  open,
  onOpenChange,
}: {
  company: Company;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const country = 'Chile';
    const type = formData.get('type') as CompanyType;

    if (!name || !type) {
      setError('El nombre y el tipo de empresa son obligatorios.');
      return;
    }

    startTransition(async () => {
      const result = await updateCompany(company.id, { name, country, type });
      if (result.error) {
        setError(result.error);
      } else {
        toast({
          title: 'Empresa Actualizada',
          description: `La empresa ${name} ha sido actualizada con éxito.`,
        });
        onOpenChange(false);
        setTimeout(() => router.refresh(), 150);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) setError(null); }}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la empresa.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error al actualizar empresa</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nombre
              </Label>
              <Input
                id="edit-name"
                name="name"
                required
                className="col-span-3"
                defaultValue={company.name}
                placeholder="Ej: Codelco / Constructora XYZ"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">
                Tipo
              </Label>
              <Select name="type" required defaultValue={company.type}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mandante">Mandante</SelectItem>
                  <SelectItem value="Subcontratista">Subcontratista</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-country" className="text-right">
                País
              </Label>
              <Input
                id="edit-country"
                name="country"
                value="Chile"
                disabled
                className="col-span-3"
              />
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
              {isPending ? 'Actualizando...' : 'Actualizar Empresa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
