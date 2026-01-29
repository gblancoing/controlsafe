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
import { updateProject, getMandanteCompanies, getSubcontractorCompanies } from '../actions';
import { useRouter } from 'next/navigation';
import { CHILE_REGIONS } from '@/lib/chile-regions';
import { Checkbox } from '@/components/ui/checkbox';
import type { Project } from '@/lib/types';

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
}: {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mandanteCompanies, setMandanteCompanies] = useState<{ id: string; name: string }[]>([]);
  const [subcontractorCompanies, setSubcontractorCompanies] = useState<{ id: string; name: string }[]>([]);
  const [selectedSubcontractors, setSelectedSubcontractors] = useState<string[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setError(null);
      setSelectedSubcontractors(project.subcontractorIds || []);
      
      // Buscar región por nombre
      const region = project.region 
        ? CHILE_REGIONS.find((r) => r.name === project.region)?.id || ''
        : '';
      setSelectedRegionId(region);

      // Cargar empresas
      Promise.all([
        getMandanteCompanies(),
        getSubcontractorCompanies(),
      ]).then(([mandantes, subcontratistas]) => {
        setMandanteCompanies(mandantes);
        setSubcontractorCompanies(subcontratistas);
      });
    }
  }, [open, project]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const clientCompanyId = formData.get('clientCompanyId') as string;

    if (!name || !clientCompanyId) {
      setError('El nombre y la empresa mandante son obligatorios.');
      return;
    }

    const region = selectedRegionId 
      ? CHILE_REGIONS.find((r) => r.id === selectedRegionId)?.name 
      : undefined;

    startTransition(async () => {
      const result = await updateProject(project.id, {
        name,
        region,
        clientCompanyId,
        subcontractorIds: selectedSubcontractors,
      });
      if (result.error) {
        setError(result.error);
      } else {
        toast({
          title: 'Proyecto Actualizado',
          description: `El proyecto ${name} ha sido actualizado con éxito.`,
        });
        onOpenChange(false);
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
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) setError(null); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Proyecto</DialogTitle>
            <DialogDescription>
              Modifica los detalles del proyecto.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error al actualizar proyecto</AlertTitle>
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
                defaultValue={project.name}
                placeholder="Ej: Expansión Mina Norte"
              />
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-region" className="text-right">
                Región
              </Label>
              <Select value={selectedRegionId} onValueChange={setSelectedRegionId}>
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
              <Label htmlFor="edit-clientCompanyId" className="text-right">
                Mandante
              </Label>
              <Select name="clientCompanyId" required defaultValue={project.clientCompanyId}>
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
                        id={`edit-sub-${company.id}`}
                        checked={selectedSubcontractors.includes(company.id)}
                        onCheckedChange={() => toggleSubcontractor(company.id)}
                      />
                      <Label
                        htmlFor={`edit-sub-${company.id}`}
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
              {isPending ? 'Actualizando...' : 'Actualizar Proyecto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
