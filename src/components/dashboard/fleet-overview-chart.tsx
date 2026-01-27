import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { getVehicles } from '@/lib/db-queries';
import { FleetOverviewChartClient } from './fleet-overview-chart-client';

export async function FleetOverviewChart() {
  const vehicles = await getVehicles();
  
  const statusTranslations: { [key: string]: string } = {
    'Operational': 'Operacional',
    'Maintenance': 'Mantenimiento',
    'Out of Service': 'Fuera de Servicio',
  };

  const chartData = Object.entries(
    vehicles.reduce((acc, vehicle) => {
      const translatedStatus = statusTranslations[vehicle.status] || vehicle.status;
      acc[translatedStatus] = (acc[translatedStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({ status, count }));

  const chartConfig = {
    count: {
      label: 'Vehículos',
    },
    'Operacional': {
      label: 'Operacional',
      color: 'hsl(var(--chart-1))',
    },
    'Mantenimiento': {
      label: 'Mantenimiento',
      color: 'hsl(var(--chart-2))',
    },
    'Fuera de Servicio': {
      label: 'Fuera de Servicio',
      color: 'hsl(var(--destructive))',
    },
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de la Flota</CardTitle>
        <CardDescription>Distribución de los estados de los vehículos</CardDescription>
      </CardHeader>
      <CardContent>
        <FleetOverviewChartClient data={chartData} config={chartConfig} />
      </CardContent>
    </Card>
  );
}
