'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { TrendData } from '@/app/dashboard/actions';

export function DashboardTrends({ trends }: { trends: TrendData[] }) {
  if (trends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendencias de Revisiones</CardTitle>
          <CardDescription>Últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay datos suficientes para mostrar tendencias
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = trends.map((trend) => ({
    mes: trend.month,
    Aprobadas: trend.approvals,
    Rechazadas: trend.rejections,
    Total: trend.reviews,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tendencias de Revisiones</CardTitle>
            <CardDescription>Evolución de revisiones en los últimos 6 meses</CardDescription>
          </div>
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Aprobadas" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Rechazadas" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
