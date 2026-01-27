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
import { getTorqueRecords, getVehicles } from '@/lib/db-queries';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, XCircle, PlusCircle } from 'lucide-react';
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

export async function TorqueLog() {
  const vehicles = await getVehicles();
  const records = await getTorqueRecords();
  
  const getVehicleName = (vehicleId: string) => {
    return vehicles.find((v) => v.id === vehicleId)?.name || 'Desconocido';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Registro de Torque</CardTitle>
          <CardDescription>Registros recientes de torque de componentes críticos.</CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Añadir Registro
            </Button>
          </DialogTrigger>
           <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Registro de Torque</DialogTitle>
              <DialogDescription>
                Ingrese los valores de torque para la revisión de un componente crítico.
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
                    {vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="component" className="text-right">Componente</Label>
                <Input id="component" placeholder="Ej: Tuercas rueda delantera izq." className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="required" className="text-right">Requerido (Nm)</Label>
                <Input id="required" type="number" placeholder="650" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="applied" className="text-right">Aplicado (Nm)</Label>
                <Input id="applied" type="number" placeholder="655" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Guardar Registro</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehículo</TableHead>
              <TableHead>Componente</TableHead>
              <TableHead>Torque (Apl/Req)</TableHead>
              <TableHead className="text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <div className="font-medium">{getVehicleName(record.vehicleId)}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(record.date), 'PP', { locale: es })}
                  </div>
                </TableCell>
                <TableCell>{record.component}</TableCell>
                <TableCell>{record.appliedTorque} / {record.requiredTorque} Nm</TableCell>
                <TableCell className="text-right">
                  {record.status === 'OK' ? (
                    <CheckCircle2 className="inline-block h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="inline-block h-5 w-5 text-red-600" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
