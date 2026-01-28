'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Truck, Search, X, Filter } from 'lucide-react';
import type { Vehicle } from '@/lib/types';
import { VehicleActions } from './vehicle-actions';
import { getVehicleTypeLabel, getVehicleStatusLabel, getVehicleStatusVariant } from '@/lib/vehicle-utils';

export function VehiclesTable({
  initialVehicles,
  companiesMap,
}: {
  initialVehicles: Vehicle[] | null;
  companiesMap: Record<string, string>;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('__all__');
  const [selectedStatus, setSelectedStatus] = useState<string>('__all__');
  const [selectedType, setSelectedType] = useState<string>('__all__');

  if (!initialVehicles) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al cargar vehículos</AlertTitle>
        <AlertDescription>
          No se pudieron cargar los datos de los vehículos. Verifica la conexión a la base de datos.
        </AlertDescription>
      </Alert>
    );
  }

  // Obtener valores únicos para los filtros
  const uniqueCompanies = useMemo(() => {
    const companies = new Set<string>();
    initialVehicles.forEach((v) => {
      if (v.companyId) companies.add(v.companyId);
    });
    return Array.from(companies);
  }, [initialVehicles]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    initialVehicles.forEach((v) => {
      statuses.add(v.status);
    });
    return Array.from(statuses);
  }, [initialVehicles]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    initialVehicles.forEach((v) => {
      types.add(v.type);
    });
    return Array.from(types);
  }, [initialVehicles]);

  // Filtrar vehículos
  const filteredVehicles = useMemo(() => {
    return initialVehicles.filter((vehicle) => {
      // Filtro de búsqueda (patente, nombre, marca, modelo)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          vehicle.patent?.toLowerCase().includes(query) ||
          vehicle.name.toLowerCase().includes(query) ||
          vehicle.brand?.toLowerCase().includes(query) ||
          vehicle.model?.toLowerCase().includes(query) ||
          getVehicleTypeLabel(vehicle.type).toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }

      // Filtro por empresa
      if (selectedCompany !== '__all__') {
        if (vehicle.companyId !== selectedCompany) return false;
      }

      // Filtro por estado
      if (selectedStatus !== '__all__') {
        if (vehicle.status !== selectedStatus) return false;
      }

      // Filtro por tipo
      if (selectedType !== '__all__') {
        if (vehicle.type !== selectedType) return false;
      }

      return true;
    });
  }, [initialVehicles, searchQuery, selectedCompany, selectedStatus, selectedType]);

  const hasActiveFilters = 
    searchQuery !== '' ||
    selectedCompany !== '__all__' ||
    selectedStatus !== '__all__' ||
    selectedType !== '__all__';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCompany('__all__');
    setSelectedStatus('__all__');
    setSelectedType('__all__');
  };

  if (initialVehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <Truck className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No hay vehículos registrados</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Para empezar, registra tu primer vehículo usando el botón de arriba.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/50">
        {/* Búsqueda */}
        <div className="flex-1">
          <Label htmlFor="search" className="text-sm mb-2 block">
            Buscar
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Buscar por patente, nombre, marca, modelo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="company-filter" className="text-sm mb-2 block">
              Empresa
            </Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger id="company-filter">
                <SelectValue placeholder="Todas las empresas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todas las empresas</SelectItem>
                {uniqueCompanies.map((companyId) => (
                  <SelectItem key={companyId} value={companyId}>
                    {companiesMap[companyId] || 'Sin empresa'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status-filter" className="text-sm mb-2 block">
              Estado
            </Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los estados</SelectItem>
                {uniqueStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getVehicleStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type-filter" className="text-sm mb-2 block">
              Tipo
            </Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger id="type-filter">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los tipos</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getVehicleTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Información de resultados y limpiar filtros */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-sm text-muted-foreground">
            Mostrando <span className="font-semibold text-foreground">{filteredVehicles.length}</span> de{' '}
            <span className="font-semibold text-foreground">{initialVehicles.length}</span> vehículos
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Tabla */}
      {filteredVehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Filter className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No se encontraron vehículos</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Intenta ajustar los filtros o la búsqueda para encontrar lo que buscas.
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="mt-4 gap-2"
            >
              <X className="h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patente</TableHead>
                <TableHead>Nombre / Tipo</TableHead>
                <TableHead>Marca / Modelo / Año</TableHead>
                <TableHead>Empresa Propietaria</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">
                    {vehicle.patent || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{vehicle.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {getVehicleTypeLabel(vehicle.type)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {vehicle.brand && vehicle.model && (
                        <span className="font-medium">{vehicle.brand} {vehicle.model}</span>
                      )}
                      {vehicle.year && (
                        <span className="text-sm text-muted-foreground">{vehicle.year}</span>
                      )}
                      {!vehicle.brand && !vehicle.model && !vehicle.year && (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {vehicle.companyId ? companiesMap[vehicle.companyId] || '-' : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getVehicleStatusVariant(vehicle.status)}>
                      {getVehicleStatusLabel(vehicle.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <VehicleActions vehicle={vehicle} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
