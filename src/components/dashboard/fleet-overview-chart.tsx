'use client';
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
import { mockVehicles } from '@/lib/data';
import { PieChart, Pie, Cell } from 'recharts';

const statusTranslations: { [key: string]: string } = {
  'Operational': 'Operacional',
  'Maintenance': 'Mantenimiento',
  'Out of Service': 'Fuera de Servicio',
};

const statusColors: { [key: string]: string } = {
  'Operacional': 'hsl(var(--chart-1))',
  'Mantenimiento': 'hsl(var(--chart-2))',
  'Fuera de Servicio': 'hsl(var(--destructive))',
};

const chartData = Object.entries(
    mockVehicles.reduce((acc, vehicle) => {
        const translatedStatus = statusTranslations[vehicle.status] || vehicle.status;
        acc[translatedStatus] = (acc[translatedStatus] || 0) + 1;
        return acc;
    }, {} as Record<string, number>)
).map(([status, count]) => ({ status, count, fill: statusColors[status] }));


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

export function FleetOverviewChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de la Flota</CardTitle>
        <CardDescription>Distribución de los estados de los vehículos</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
            <Pie data={chartData} dataKey="count" nameKey="status" innerRadius={60} strokeWidth={5}>
                 {chartData.map((entry) => (
                    <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="status" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
