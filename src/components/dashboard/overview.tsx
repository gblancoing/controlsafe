import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getVehicles, getMaintenanceTasks } from '@/lib/db-queries';
import { Truck, Wrench, AlertTriangle, Building } from 'lucide-react';

export async function Overview() {
  const vehicles = await getVehicles();
  const tasks = await getMaintenanceTasks();
  
  const totalVehicles = vehicles.length;
  const operationalVehicles = vehicles.filter(v => v.status === 'Operational').length;
  const overdueTasks = tasks.filter(t => t.status === 'Overdue').length;
  const totalSites = new Set(vehicles.map(v => v.site)).size;

  const stats = [
    { title: 'Vehículos Totales', value: totalVehicles, icon: Truck, color: 'text-primary' },
    { title: 'Operacionales', value: `${operationalVehicles} / ${totalVehicles}`, icon: Wrench, color: 'text-green-600' },
    { title: 'Tareas Atrasadas', value: overdueTasks, icon: AlertTriangle, color: overdueTasks > 0 ? 'text-red-600' : 'text-muted-foreground' },
    { title: 'Faenas Activas', value: totalSites, icon: Building, color: 'text-primary' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
