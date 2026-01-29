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
import { createProject, getMandanteCompanies, getSubcontractorCompanies } from '../actions';
import { useRouter } from 'next/navigation';
import { CHILE_REGIONS } from '@/lib/chile-regions';
import { Checkbox } from '@/components/ui/checkbox';

export function AddProjectButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mandanteCompanies, setMandanteCompanies] = useState<{ id: string; name: string }[]>([]);
  const [subcontractorCompanies, setSubcontractorCompanies] = useState<{ id: string; name: string }[]>([]);
  const [selectedSubcontractors, setSelectedSubcontractors] = useState<string[]>([]);
  const { toast } = useToast();

  // Cargar empresas al abrir el diálogo
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setError(null);
      setSelectedSubcontractors([]);
      const [mandantes, subcontratistas] = await Promise.all([
        getMandanteCompanies(),
        getSubcontractorCompanies(),
      ]);
      setMandanteCompanies(mandantes);
      setSubcontractorCompanies(subcontratistas);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const regionId = formData.get('region') as string;
    const clientCompanyId = formData.get('clientCompanyId') as string;

    if (!name || !clientCompanyId) {
      setError('El nombre y la empresa mandante son obligatorios.');
      return;
    }

    const region = regionId ? CHILE_REGIONS.find((r) => r.id === regionId)?.name : undefined;

    startTransition(async () => {
      const result = await createProject({
        name,
        region,
        clientCompanyId,
        subcontractorIds: selectedSubcontractors,
      });
      if (result.error) {
        setError(result.error);
      } else {
        toast({
          title: 'Proyecto Creado',
          description: `El proyecto ${name} ha sido creado con éxito.`,
        });
        setOpen(false);
        setTimeout(() => router.refresh(), 150);
      }
    });
  };

  const toggleSubcontractor = (companyId: string) => {
    setSelectedSubcontractors((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Crear Proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
            <DialogDescription>
              Complete los detalles para agregar un nuevo proyecto.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error al crear proyecto</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                name="name"
                required
                className="col-span-3"
                placeholder="Ej: Expansión Mina Norte"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="country" className="text-right">
                País
              </Label>
              <Input
                id="country"
                name="country"
                value="Chile"
                disabled
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region" className="text-right">
                Región
              </Label>
              <Select name="region">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione una región" />
                </SelectTrigger>
                <SelectContent>
                  {CHILE_REGIONS.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientCompanyId" className="text-right">
                Mandante
              </Label>
              <Select name="clientCompanyId" required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione empresa mandante" />
                </SelectTrigger>
                <SelectContent>
                  {mandanteCompanies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {subcontractorCompanies.length > 0 && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Subcontratistas</Label>
                <div className="col-span-3 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {subcontractorCompanies.map((company) => (
                    <div key={company.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sub-${company.id}`}
                        checked={selectedSubcontractors.includes(company.id)}
                        onCheckedChange={() => toggleSubcontractor(company.id)}
                      />
                      <Label
                        htmlFor={`sub-${company.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {company.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isPending ? 'Creando...' : 'Crear Proyecto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
