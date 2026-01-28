'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  assignMaintenanceProgram,
  removeMaintenanceProgram,
  getVehicleById,
} from '../../actions';
import { getMaintenancePrograms } from '@/app/mantenimiento/actions';

type MaintenanceProgram = {
  id: string;
  name: string;
  description?: string;
  applicableVehicleType?: string;
  frequencyValue: number;
  frequencyUnit: string;
  tasks: Array<{ id: string; task: string; order: number }>;
};

type AssignedProgram = {
  id: string;
  name: string;
  description?: string;
  frequencyValue: number;
  frequencyUnit: string;
  tasks: Array<{ id: string; task: string; order: number }>;
};

export function MaintenanceProgramsCard({
  vehicleId,
  vehicleName,
}: {
  vehicleId: string;
  vehicleName: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [availablePrograms, setAvailablePrograms] = useState<MaintenanceProgram[]>([]);
  const [assignedPrograms, setAssignedPrograms] = useState<AssignedProgram[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [vehicleId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [programs, vehicle] = await Promise.all([
        getMaintenancePrograms(),
        getVehicleById(vehicleId),
      ]);

      setAvailablePrograms(programs);
      if (vehicle?.maintenancePrograms) {
        setAssignedPrograms(vehicle.maintenancePrograms);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los programas de mantenimiento.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = () => {
    if (!selectedProgramId) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un programa.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      console.log('[Asignar Programa] Iniciando asignación:', {
        vehicleId,
        programId: selectedProgramId,
      });
      
      const result = await assignMaintenanceProgram(vehicleId, selectedProgramId);
      
      console.log('[Asignar Programa] Resultado:', result);
      
      if (result.success) {
        toast({
          title: 'Programa asignado',
          description: 'El programa de mantenimiento ha sido asignado correctamente.',
        });
        setSelectedProgramId('');
        // Recargar datos después de un breve delay para asegurar que la DB se actualizó
        setTimeout(() => {
          loadData();
          router.refresh();
        }, 500);
      } else {
        console.error('[Asignar Programa] Error:', result.error);
        toast({
          title: 'Error al asignar programa',
          description: result.error || 'No se pudo asignar el programa. Revisa la consola para más detalles.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleRemove = (programId: string) => {
    startTransition(async () => {
      const result = await removeMaintenanceProgram(vehicleId, programId);
      if (result.success) {
        toast({
          title: 'Programa eliminado',
          description: 'El programa de mantenimiento ha sido eliminado correctamente.',
        });
        loadData();
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'No se pudo eliminar el programa.',
          variant: 'destructive',
        });
      }
    });
  };

  // Filtrar programas ya asignados
  const unassignedPrograms = availablePrograms.filter(
    (program) => !assignedPrograms.some((assigned) => assigned.id === program.id)
  );

  const formatFrequency = (value: number, unit: string) => {
    if (unit === 'Días') {
      return `${value} Días`;
    } else if (unit === 'Horas de Operación') {
      return `${value} Horas`;
    }
    return `${value} ${unit}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Programas de Mantenimiento Asignados</CardTitle>
        <CardDescription>
          Gestiona las plantillas de mantenimiento para {vehicleName}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Asignar Nuevo Programa */}
        <div className="flex gap-2">
          <Select 
            value={selectedProgramId} 
            onValueChange={setSelectedProgramId}
            disabled={unassignedPrograms.length === 0 || loading}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={
                loading 
                  ? "Cargando..." 
                  : unassignedPrograms.length === 0 
                    ? "No hay programas disponibles" 
                    : "Seleccionar un programa"
              } />
            </SelectTrigger>
            <SelectContent>
              {unassignedPrograms.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No hay programas disponibles
                </div>
              ) : (
                unassignedPrograms.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAssign}
            disabled={!selectedProgramId || isPending || loading || unassignedPrograms.length === 0}
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

        {/* Programas Asignados */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Programas Asignados</h4>
          {loading ? (
            <div className="text-sm text-muted-foreground">Cargando...</div>
          ) : assignedPrograms.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No hay programas asignados aún.
            </div>
          ) : (
            <div className="space-y-2">
              {assignedPrograms.map((program) => (
                <div
                  key={program.id}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{program.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {formatFrequency(program.frequencyValue, program.frequencyUnit)}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(program.id)}
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
      </CardContent>
    </Card>
  );
}
