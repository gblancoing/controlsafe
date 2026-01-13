import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockMaintenanceTasks, mockVehicles } from '@/lib/data';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function MaintenanceSchedule() {
  const getVehicleName = (vehicleId: string) => {
    return mockVehicles.find((v) => v.id === vehicleId)?.name || 'Vehículo Desconocido';
  };

  const statusTranslations: { [key: string]: string } = {
    'Overdue': 'Atrasado',
    'Completed': 'Completado',
    'In Progress': 'En Progreso',
    'Scheduled': 'Programado'
  };

  const priorityTranslations: { [key: string]: string } = {
      'High': 'Alta',
      'Medium': 'Media',
      'Low': 'Baja'
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Overdue': return 'destructive';
      case 'Completed': return 'secondary';
      case 'In Progress': return 'default';
      default: return 'outline';
    }
  };

  const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Plan de Mantenimiento</CardTitle>
          <CardDescription>Tareas de mantenimiento próximas y atrasadas.</CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Programar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Programar Nuevo Mantenimiento</DialogTitle>
              <DialogDescription>
                Complete los detalles para agregar una nueva tarea de mantenimiento.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vehicle" className="text-right">Vehículo</Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccione un vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockVehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task" className="text-right">Tarea</Label>
                <Input id="task" placeholder="Ej: Cambio de aceite del motor" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right">Fecha Límite</Label>
                <Input id="dueDate" type="date" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Programar Tarea</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehículo</TableHead>
              <TableHead>Tarea</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockMaintenanceTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{getVehicleName(task.vehicleId)}</TableCell>
                <TableCell>{task.task}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true, locale: es })}
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityVariant(task.priority)}>{priorityTranslations[task.priority]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(task.status)}>{statusTranslations[task.status]}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
