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
import { createVehicle, getAllCompanies, getDriversByCompany } from '../actions';
import { useRouter } from 'next/navigation';
import type { Vehicle } from '@/lib/types';

export function AddVehicleButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [drivers, setDrivers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const { toast } = useToast();

  // Cargar empresas al abrir el diálogo
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setError(null);
      setSelectedCompanyId('');
      setSelectedDriverId('');
      setSelectedType('');
      setDrivers([]);
      const companiesList = await getAllCompanies();
      setCompanies(companiesList);
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

    const validTypes = ['Excavator', 'Haul Truck', 'Dozer', 'Loader', 'Camioneta'];
    if (!validTypes.includes(selectedType)) {
      setError(`Tipo de vehículo inválido: "${selectedType}". Por favor seleccione un tipo válido.`);
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
      // Usar selectedType directamente para evitar problemas de scope
      const finalType = selectedType as Vehicle['type'];
      
      // Validar nuevamente antes de enviar
      if (!finalType || finalType.trim() === '') {
        setError('El tipo de vehículo es obligatorio. Por favor seleccione un tipo.');
        return;
      }

      // Validar que el tipo sea uno de los valores válidos
      const validTypes: Vehicle['type'][] = ['Excavator', 'Haul Truck', 'Dozer', 'Loader', 'Camioneta'];
      if (!validTypes.includes(finalType)) {
        setError(`Tipo de vehículo inválido: "${finalType}". Por favor seleccione un tipo válido.`);
        return;
      }

      // Debug: verificar que el tipo se está pasando correctamente
      console.log('Enviando vehículo con tipo:', finalType);
      console.log('selectedType estado:', selectedType);
      console.log('Datos completos:', {
        patent,
        name: vehicleName,
        type: finalType,
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
        brand: brand || undefined,
        model: model || undefined,
        year,
        mileage,
        companyId: companyId || undefined,
        driverId: driverId || undefined,
      });
      if (result.error) {
        setError(result.error);
      } else {
        // Cerrar el diálogo primero
        setOpen(false);
        // Esperar un momento para que el diálogo se cierre completamente
        setTimeout(() => {
          toast({
            title: 'Vehículo Registrado',
            description: `El vehículo ${vehicleName} ha sido registrado con éxito.`,
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
                  <SelectItem value="Excavator">Excavator</SelectItem>
                  <SelectItem value="Haul Truck">Haul Truck</SelectItem>
                  <SelectItem value="Dozer">Dozer</SelectItem>
                  <SelectItem value="Loader">Loader</SelectItem>
                  <SelectItem value="Camioneta">Camioneta</SelectItem>
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
