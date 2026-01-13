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

const statusColors: { [key: string]: string } = {
  'Operational': 'hsl(var(--chart-1))',
  'Maintenance': 'hsl(var(--chart-2))',
  'Out of Service': 'hsl(var(--destructive))',
};

const chartData = Object.entries(
    mockVehicles.reduce((acc, vehicle) => {
        acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>)
).map(([status, count]) => ({ status, count, fill: statusColors[status] }));


const chartConfig = {
  count: {
    label: 'Vehicles',
  },
  Operational: {
    label: 'Operational',
    color: 'hsl(var(--chart-1))',
  },
  Maintenance: {
    label: 'Maintenance',
    color: 'hsl(var(--chart-2))',
  },
  'Out of Service': {
    label: 'Out of Service',
    color: 'hsl(var(--destructive))',
  },
};

export function FleetOverviewChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fleet Status</CardTitle>
        <CardDescription>Distribution of vehicle statuses</CardDescription>
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
