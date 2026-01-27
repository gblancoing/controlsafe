'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  getCompanyVehicles,
  assignVehicleToDriver,
  unassignVehicleFromDriver,
  getUserById,
} from '../actions';

type User = {
  id: string;
  name: string;
  companyId?: string;
  vehicles: Array<{ id: string; name: string; patent?: string }>;
};

export function AssignVehiclesDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [availableVehicles, setAvailableVehicles] = useState<Array<{ id: string; name: string; patent?: string }>>([]);
  const [assignedVehicles, setAssignedVehicles] = useState<Array<{ id: string; name: string; patent?: string }>>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && user.companyId) {
      loadData();
    }
  }, [open, user.companyId, user.id]);

  const loadData = async () => {
    if (!user.companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [vehicles, userData] = await Promise.all([
        getCompanyVehicles(user.companyId),
        getUserById(user.id),
      ]);

      setAvailableVehicles(vehicles);
      if (userData?.vehicles) {
        setAssignedVehicles(userData.vehicles);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los vehículos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = () => {
    if (!selectedVehicleId) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un vehículo.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const result = await assignVehicleToDriver(user.id, selectedVehicleId);
      if (result.success) {
        toast({
          title: 'Vehículo asignado',
          description: 'El vehículo ha sido asignado correctamente.',
        });
        setSelectedVehicleId('');
        loadData();
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'No se pudo asignar el vehículo.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleUnassign = (vehicleId: string) => {
    startTransition(async () => {
      const result = await unassignVehicleFromDriver(user.id, vehicleId);
      if (result.success) {
        toast({
          title: 'Vehículo desasignado',
          description: 'El vehículo ha sido desasignado correctamente.',
        });
        loadData();
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'No se pudo desasignar el vehículo.',
          variant: 'destructive',
        });
      }
    });
  };

  // Filtrar vehículos ya asignados
  const unassignedVehicles = availableVehicles.filter(
    (vehicle) => !assignedVehicles.some((assigned) => assigned.id === vehicle.id)
  );

  if (!user.companyId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Vehículos</DialogTitle>
            <DialogDescription>
              Este chofer no tiene una empresa asignada. Debe asignar una empresa primero.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Asignar Vehículos a {user.name}</DialogTitle>
          <DialogDescription>
            Gestiona los vehículos asignados a este chofer.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Asignar Nuevo Vehículo */}
          <div className="flex gap-2">
            <Select
              value={selectedVehicleId}
              onValueChange={setSelectedVehicleId}
              disabled={unassignedVehicles.length === 0 || loading}
            >
              <SelectTrigger className="flex-1">
                <SelectValue
                  placeholder={
                    loading
                      ? 'Cargando...'
                      : unassignedVehicles.length === 0
                        ? 'No hay vehículos disponibles'
                        : 'Seleccionar un vehículo'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {unassignedVehicles.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No hay vehículos disponibles
                  </div>
                ) : (
                  unassignedVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.patent || vehicle.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAssign}
              disabled={!selectedVehicleId || isPending || loading || unassignedVehicles.length === 0}
              size="sm"
              className="gap-2"
            >
              {isPending ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Asignar
            </Button>
          </div>

          {/* Vehículos Asignados */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Vehículos Asignados</h4>
            {loading ? (
              <div className="text-sm text-muted-foreground">Cargando...</div>
            ) : assignedVehicles.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No hay vehículos asignados aún.
              </div>
            ) : (
              <div className="space-y-2">
                {assignedVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <Badge variant="outline">{vehicle.patent || vehicle.name}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnassign(vehicle.id)}
                      disabled={isPending}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
