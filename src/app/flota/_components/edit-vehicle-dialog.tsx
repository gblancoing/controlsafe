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
import { Loader, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { updateVehicle, getAllCompanies, getVehicleById, uploadVehicleDocuments, deleteVehicleDocument } from '../actions';
import { useRouter } from 'next/navigation';
import type { Vehicle } from '@/lib/types';

type FullVehicle = Awaited<ReturnType<typeof getVehicleById>>;

function formatDateForInput(d: Date | string | undefined): string {
  if (!d) return '';
  try {
    const date = new Date(d);
    return date.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

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
  const [fullVehicle, setFullVehicle] = useState<FullVehicle | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setError(null);
      setNewFiles([]);
      setDeletingDocId(null);
      getAllCompanies().then(setCompanies);
      setLoadingFull(true);
      getVehicleById(vehicle.id)
        .then((v) => {
          setFullVehicle(v);
        })
        .finally(() => {
          setLoadingFull(false);
        });
    }
  }, [open, vehicle.id]);

  const handleDeleteDocument = (docId: string) => {
    if (!confirm('¿Eliminar este documento?')) return;
    setDeletingDocId(docId);
    deleteVehicleDocument(docId, vehicle.id).then((result) => {
      setDeletingDocId(null);
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Documento eliminado' });
        getVehicleById(vehicle.id).then(setFullVehicle);
        router.refresh();
      }
    });
  };

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
    const technicalReviewDateStr = formData.get('technicalReviewDate') as string;
    const technicalReviewExpiryDateStr = formData.get('technicalReviewExpiryDate') as string;
    const circulationPermitStatus = formData.get('circulationPermitStatus') as string;

    if (!name || !type) {
      setError('El nombre y el tipo son obligatorios.');
      return;
    }

    const year = yearStr ? parseInt(yearStr, 10) : undefined;
    const technicalReviewDate = technicalReviewDateStr ? new Date(technicalReviewDateStr) : technicalReviewDateStr === '' ? null : undefined;
    const technicalReviewExpiryDate = technicalReviewExpiryDateStr ? new Date(technicalReviewExpiryDateStr) : technicalReviewExpiryDateStr === '' ? null : undefined;

    startTransition(async () => {
      const result = await updateVehicle(vehicle.id, {
        patent: patent || undefined,
        name,
        type,
        brand: brand || undefined,
        model: model || undefined,
        year,
        companyId: companyId || undefined,
        technicalReviewDate: technicalReviewDate as Date | null | undefined,
        technicalReviewExpiryDate: technicalReviewExpiryDate as Date | null | undefined,
        circulationPermitStatus: circulationPermitStatus ? (circulationPermitStatus as 'Vigente' | 'Vencido' | 'Pendiente') : undefined,
      });
      if (result.error) {
        setError(result.error);
      } else {
        if (newFiles.length > 0) {
          const fd = new FormData();
          newFiles.forEach((f) => fd.append('documents', f));
          const uploadResult = await uploadVehicleDocuments(vehicle.id, fd);
          if (uploadResult.error) {
            toast({ title: 'Vehículo actualizado, documentos con error', description: uploadResult.error, variant: 'destructive' });
          }
        }
        onOpenChange(false);
        setTimeout(() => {
          toast({ title: 'Vehículo Actualizado', description: `El vehículo ${name} ha sido actualizado con éxito.` });
          router.refresh();
        }, 150);
      }
    });
  };

  const docs = fullVehicle?.documents ?? [];
  const techReviewDate = fullVehicle?.technicalReviewDate ?? vehicle.technicalReviewDate;
  const techReviewExpiryDate = fullVehicle?.technicalReviewExpiryDate ?? vehicle.technicalReviewExpiryDate;
  const circulationStatus = fullVehicle?.circulationPermitStatus ?? vehicle.circulationPermitStatus;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) setError(null); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Vehículo</DialogTitle>
            <DialogDescription>
              Modifica los detalles del vehículo, fechas de revisión técnica y documentación.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error al actualizar vehículo</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loadingFull ? (
              <div className="flex items-center gap-2 py-4">
                <Loader className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Cargando datos...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-patent" className="text-right">Patente</Label>
                  <Input id="edit-patent" name="patent" className="col-span-3" defaultValue={vehicle.patent} placeholder="Ej: ABCD-12" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">Nombre</Label>
                  <Input id="edit-name" name="name" required className="col-span-3" defaultValue={vehicle.name} placeholder="Ej: Camioneta Supervisor 1" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-type" className="text-right">Tipo</Label>
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
                  <Label htmlFor="edit-brand" className="text-right">Marca</Label>
                  <Input id="edit-brand" name="brand" className="col-span-3" defaultValue={vehicle.brand} placeholder="Ej: Toyota" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-model" className="text-right">Modelo</Label>
                  <Input id="edit-model" name="model" className="col-span-3" defaultValue={vehicle.model} placeholder="Ej: Hilux" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-year" className="text-right">Año</Label>
                  <Input id="edit-year" name="year" type="number" className="col-span-3" defaultValue={vehicle.year} placeholder="Ej: 2023" min="1900" max="2100" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-companyId" className="text-right">Propietario</Label>
                  <Select name="companyId" defaultValue={vehicle.companyId}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccione una empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Revisión técnica */}
                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Revisión Técnica</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-technicalReviewDate" className="text-right">Fecha revisión</Label>
                    <Input
                      id="edit-technicalReviewDate"
                      name="technicalReviewDate"
                      type="date"
                      className="col-span-3"
                      defaultValue={formatDateForInput(techReviewDate)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-technicalReviewExpiryDate" className="text-right">Vencimiento</Label>
                    <Input
                      id="edit-technicalReviewExpiryDate"
                      name="technicalReviewExpiryDate"
                      type="date"
                      className="col-span-3"
                      defaultValue={formatDateForInput(techReviewExpiryDate)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-circulationPermitStatus" className="text-right">Permiso circulación</Label>
                    <Select name="circulationPermitStatus" defaultValue={circulationStatus ?? ''}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccione estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vigente">Vigente</SelectItem>
                        <SelectItem value="Vencido">Vencido</SelectItem>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Documentación */}
                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Documentación</span>
                  </div>
                  {docs.length > 0 && (
                    <ul className="space-y-2">
                      {docs.map((doc) => (
                        <li key={doc.id} className="flex items-center justify-between rounded border p-2 text-sm">
                          <span className="truncate">{doc.fileName || doc.caption || doc.type}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive shrink-0"
                            disabled={deletingDocId === doc.id}
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            {deletingDocId === doc.id ? <Loader className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div>
                    <Label className="text-sm">Agregar documentos</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="file"
                        multiple
                        accept=".pdf,image/*,.doc,.docx"
                        className="flex-1"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files) setNewFiles((prev) => [...prev, ...Array.from(files)]);
                          e.target.value = '';
                        }}
                      />
                    </div>
                    {newFiles.length > 0 && (
                      <ul className="mt-2 text-xs text-muted-foreground">
                        {newFiles.map((f, i) => (
                          <li key={i}>{f.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || loadingFull}>
              {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isPending ? 'Actualizando...' : 'Actualizar Vehículo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
