'use client';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';

const statusColors: { [key: string]: string } = {
  'Operacional': 'hsl(var(--chart-1))',
  'Mantenimiento': 'hsl(var(--chart-2))',
  'Fuera de Servicio': 'hsl(var(--destructive))',
};

interface FleetOverviewChartClientProps {
  data: Array<{ status: string; count: number }>;
  config: any;
}

export function FleetOverviewChartClient({ data, config }: FleetOverviewChartClientProps) {
  const chartData = data.map((entry) => ({
    ...entry,
    fill: statusColors[entry.status] || 'hsl(var(--muted))',
  }));

  return (
    <ChartContainer
      config={config}
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
  );
}
