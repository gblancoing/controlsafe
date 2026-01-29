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
import { PlusCircle, Loader, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { createVehicle, uploadVehicleDocuments, getAllCompanies, getDriversByCompany } from '../actions';
import { getActiveVehicleTypes } from '../tipos/actions';
import { useRouter } from 'next/navigation';
import type { Vehicle } from '@/lib/types';
import { useEffect } from 'react';

export function AddVehicleButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [drivers, setDrivers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<{ id: string; name: string; displayName: string }[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [isOperational, setIsOperational] = useState<boolean>(true);
  const [technicalReviewDate, setTechnicalReviewDate] = useState<string>('');
  const [technicalReviewExpiryDate, setTechnicalReviewExpiryDate] = useState<string>('');
  const [circulationPermitStatus, setCirculationPermitStatus] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  // Cargar empresas al abrir el diálogo
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setError(null);
      setSelectedCompanyId('');
      setSelectedDriverId('');
      setSelectedType('');
      setIsOperational(true);
      setTechnicalReviewDate('');
      setTechnicalReviewExpiryDate('');
      setCirculationPermitStatus('');
      setSelectedFiles([]);
      setDrivers([]);
      const [companiesList, typesList] = await Promise.all([
        getAllCompanies(),
        getActiveVehicleTypes(),
      ]);
      setCompanies(companiesList);
      setVehicleTypes(typesList.map((t) => ({ id: t.id, name: t.name, displayName: t.displayName })));
    }
  };

  // Cargar choferes cuando se selecciona una empresa
  const handleCompanyChange = async (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedDriverId(''); // Resetear chofer cuando cambia la empresa
    if (companyId) {
      const driversList = await getDriversByCompany(companyId);
      setDrivers(driversList);
    } else {
      setDrivers([]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    
    // Validar el tipo ANTES de procesar el formulario
    if (!selectedType || selectedType.trim() === '') {
      setError('Debe seleccionar un tipo de vehículo.');
      return;
    }

    // Validar que el tipo seleccionado existe en la lista de tipos activos
    const selectedTypeObj = vehicleTypes.find(t => t.id === selectedType);
    if (!selectedTypeObj) {
      setError(`Tipo de vehículo inválido. Por favor seleccione un tipo válido.`);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const patent = formData.get('patent') as string;
    const brand = formData.get('brand') as string;
    const model = formData.get('model') as string;
    const yearStr = formData.get('year') as string;
    const mileageStr = formData.get('mileage') as string;
    const companyId = selectedCompanyId;
    const driverId = selectedDriverId;
    const type = selectedType as Vehicle['type'];

    // Generar nombre del vehículo basado en marca/modelo o patente
    const vehicleName = patent 
      ? `${brand || ''} ${model || ''} ${patent}`.trim() || patent
      : `${brand || 'Vehículo'} ${model || ''}`.trim() || 'Vehículo sin nombre';

    const year = yearStr ? parseInt(yearStr, 10) : undefined;
    const mileage = mileageStr ? parseInt(mileageStr, 10) : 0;

    startTransition(async () => {
      // Validar fechas de revisión técnica
      let techReviewDate: Date | undefined;
      let techReviewExpiryDate: Date | undefined;
      let finalIsOperational = isOperational;
      
      if (technicalReviewDate) {
        techReviewDate = new Date(technicalReviewDate);
      }
      if (technicalReviewExpiryDate) {
        techReviewExpiryDate = new Date(technicalReviewExpiryDate);
        // Si la fecha de vencimiento está vencida, el vehículo debe estar inoperativo
        if (techReviewExpiryDate < new Date()) {
          finalIsOperational = false;
        }
      }
      // Obtener el tipo seleccionado
      const selectedTypeObj = vehicleTypes.find(t => t.id === selectedType);
      if (!selectedTypeObj) {
        setError(`Tipo de vehículo inválido. Por favor seleccione un tipo válido.`);
        return;
      }

      // Usar el name del tipo para compatibilidad con el enum
      const finalType = selectedTypeObj.name as Vehicle['type'];
      const finalVehicleTypeId = selectedType;

      // Debug: verificar que el tipo se está pasando correctamente
      console.log('Enviando vehículo con tipo:', finalType);
      console.log('vehicleTypeId:', finalVehicleTypeId);
      console.log('Datos completos:', {
        patent,
        name: vehicleName,
        type: finalType,
        vehicleTypeId: finalVehicleTypeId,
        brand,
        model,
        year,
        mileage,
        companyId,
        driverId,
      });

      const result = await createVehicle({
        patent: patent || undefined,
        name: vehicleName,
        type: finalType,
        vehicleTypeId: finalVehicleTypeId,
        brand: brand || undefined,
        model: model || undefined,
        year,
        mileage,
        companyId: companyId || undefined,
        driverId: driverId || undefined,
        isOperational: finalIsOperational,
        technicalReviewDate: techReviewDate,
        technicalReviewExpiryDate: techReviewExpiryDate,
        circulationPermitStatus: circulationPermitStatus as 'Vigente' | 'Vencido' | 'Pendiente' | undefined,
      });
      if (result.error) {
        setError(result.error);
      } else {
        if (result.vehicleId && selectedFiles.length > 0) {
          const docFormData = new FormData();
          selectedFiles.forEach((file) => docFormData.append('documents', file));
          const uploadResult = await uploadVehicleDocuments(result.vehicleId, docFormData);
          if (uploadResult.error) {
            toast({
              title: 'Vehículo creado, documentos con error',
              description: uploadResult.error,
              variant: 'destructive',
            });
          }
        }
        setOpen(false);
        setTimeout(() => {
          toast({
            title: 'Vehículo Registrado',
            description: `El vehículo ${vehicleName} ha sido registrado con éxito.`,
          });
          router.refresh();
        }, 150);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Añadir Vehículo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Vehículo</DialogTitle>
            <DialogDescription>
              Complete los detalles para agregar un nuevo vehículo a la flota.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error al registrar vehículo</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patent" className="text-right">
                Patente
              </Label>
              <Input
                id="patent"
                name="patent"
                className="col-span-3"
                placeholder="Ej: SRDR84"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brand" className="text-right">
                Marca Vehículo
              </Label>
              <Input
                id="brand"
                name="brand"
                className="col-span-3"
                placeholder="Ej: Toyota"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">
                Modelo
              </Label>
              <Input
                id="model"
                name="model"
                className="col-span-3"
                placeholder="Ej: Hilux"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="year" className="text-right">
                Año
              </Label>
              <Input
                id="year"
                name="year"
                type="number"
                className="col-span-3"
                placeholder="Ej: 2023"
                min="1900"
                max="2100"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mileage" className="text-right">
                Kilometraje Registro
              </Label>
              <Input
                id="mileage"
                name="mileage"
                type="number"
                className="col-span-3"
                placeholder="Ej: 0"
                min="0"
                defaultValue="0"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Tipo
              </Label>
              <Select 
                value={selectedType} 
                onValueChange={setSelectedType}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.length === 0 ? (
                    <SelectItem value="__no_types__" disabled>No hay tipos disponibles</SelectItem>
                  ) : (
                    vehicleTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.displayName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companyId" className="text-right">
                Propietario
              </Label>
              <Select 
                name="companyId"
                value={selectedCompanyId}
                onValueChange={handleCompanyChange}
              >
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="driverId" className="text-right">
                Nombre Chofer
              </Label>
              <Select 
                value={selectedDriverId}
                onValueChange={setSelectedDriverId}
                disabled={!selectedCompanyId || drivers.length === 0}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={
                    !selectedCompanyId 
                      ? "Primero seleccione una empresa" 
                      : drivers.length === 0
                      ? "No hay choferes disponibles"
                      : "Seleccione un chofer"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Estado Operativo/Inoperativo */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Estado</Label>
              <div className="col-span-3 flex items-center space-x-2 p-3 border rounded-lg bg-muted/50">
                <Checkbox
                  id="isOperational"
                  checked={isOperational}
                  onCheckedChange={(checked) => setIsOperational(checked === true)}
                />
                <Label
                  htmlFor="isOperational"
                  className="text-sm font-normal cursor-pointer"
                >
                  Vehículo Operativo
                </Label>
              </div>
            </div>
            {/* Revisión Técnica */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="technicalReviewDate" className="text-right">
                Fecha Revisión Técnica
              </Label>
              <Input
                id="technicalReviewDate"
                name="technicalReviewDate"
                type="date"
                className="col-span-3"
                value={technicalReviewDate}
                onChange={(e) => setTechnicalReviewDate(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="technicalReviewExpiryDate" className="text-right">
                Fecha Vencimiento Revisión
              </Label>
              <Input
                id="technicalReviewExpiryDate"
                name="technicalReviewExpiryDate"
                type="date"
                className="col-span-3"
                value={technicalReviewExpiryDate}
                onChange={(e) => {
                  setTechnicalReviewExpiryDate(e.target.value);
                  // Si la fecha está vencida, marcar como inoperativo
                  if (e.target.value) {
                    const expiryDate = new Date(e.target.value);
                    if (expiryDate < new Date()) {
                      setIsOperational(false);
                    }
                  }
                }}
              />
            </div>
            {/* Permiso Circulación */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="circulationPermitStatus" className="text-right">
                Permiso Circulación
              </Label>
              <Select
                value={circulationPermitStatus}
                onValueChange={setCirculationPermitStatus}
              >
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
            {/* Adjuntar Documentación */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Documentación</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="documents"
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    className="col-span-3"
                    onChange={(e) => {
                      if (e.target.files) {
                        setSelectedFiles(Array.from(e.target.files));
                      }
                    }}
                  />
                </div>
                {selectedFiles.length > 0 && (
                  <div className="space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                        <span className="truncate flex-1">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            const newFiles = selectedFiles.filter((_, i) => i !== index);
                            setSelectedFiles(newFiles);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Opcional: Fotografías, documentos del fabricante, etc.
                </p>
              </div>
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
              {isPending ? 'Registrando...' : 'Registrar Vehículo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
