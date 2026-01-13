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
import { mockTorqueRecords, mockVehicles } from '@/lib/data';
import { format } from 'date-fns';
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

export function TorqueLog() {
  const getVehicleName = (vehicleId: string) => {
    return mockVehicles.find((v) => v.id === vehicleId)?.name || 'Unknown';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Torque Log</CardTitle>
          <CardDescription>Recent critical component torque records.</CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Record
            </Button>
          </DialogTrigger>
           <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Torque Record</DialogTitle>
              <DialogDescription>
                Enter the torque values for a critical component check.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vehicle" className="text-right">Vehicle</Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockVehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="component" className="text-right">Component</Label>
                <Input id="component" placeholder="e.g., Front-Left Wheel Nuts" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="required" className="text-right">Required (Nm)</Label>
                <Input id="required" type="number" placeholder="650" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="applied" className="text-right">Applied (Nm)</Label>
                <Input id="applied" type="number" placeholder="655" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Record</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Component</TableHead>
              <TableHead>Torque (Applied/Req)</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTorqueRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <div className="font-medium">{getVehicleName(record.vehicleId)}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(record.date), 'PP')}
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
