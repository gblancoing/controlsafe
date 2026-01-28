'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Truck, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { DashboardMetrics as DashboardMetricsType } from '@/app/dashboard/actions';

export function DashboardOverview({
  metrics,
}: {
  metrics: DashboardMetricsType;
}) {
  const statusItems = [
    {
      label: 'Operacionales',
      value: metrics.fleet.operational,
      total: metrics.fleet.total,
      color: 'bg-green-500',
      link: '/flota?status=Operational',
    },
    {
      label: 'En Mantenimiento',
      value: metrics.fleet.maintenance,
      total: metrics.fleet.total,
      color: 'bg-yellow-500',
      link: '/flota?status=Maintenance',
    },
    {
      label: 'Fuera de Servicio',
      value: metrics.fleet.outOfService,
      total: metrics.fleet.total,
      color: 'bg-gray-500',
      link: '/flota?status=Out of Service',
    },
    {
      label: 'No Permitidos',
      value: metrics.fleet.notAllowedToOperate,
      total: metrics.fleet.total,
      color: 'bg-red-500',
      link: '/flota?status=Not Allowed to Operate',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de Estado</CardTitle>
        <CardDescription>Vista general del sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estado de Flota */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Estado de Flota</span>
            </div>
            <Link href="/flota">
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                Ver todos
              </Badge>
            </Link>
          </div>
          <div className="space-y-2">
            {statusItems.map((item) => {
              const percentage = item.total > 0 ? (item.value / item.total) * 100 : 0;
              return (
                <Link key={item.label} href={item.link}>
                  <div className="space-y-1 cursor-pointer hover:bg-accent/50 p-2 rounded transition-colors">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">
                        {item.value} / {item.total}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Controles Preventivos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Controles Preventivos</span>
            </div>
            <Link href="/torque">
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                Ver todos
              </Badge>
            </Link>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Pendientes</span>
              <span className="font-medium">{metrics.preventiveControls.pending}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Por Vencer</span>
              <span className="font-medium text-yellow-600">
                {metrics.preventiveControls.due}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Vencidos</span>
              <span className="font-medium text-red-600">
                {metrics.preventiveControls.overdue}
              </span>
            </div>
          </div>
        </div>

        {/* Revisiones */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Revisiones</span>
            </div>
            <Link href="/historial">
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                Ver historial
              </Badge>
            </Link>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{metrics.reviews.total}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Aprobadas</span>
              <span className="font-medium text-green-600">{metrics.reviews.approved}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Este mes</span>
              <span className="font-medium">{metrics.reviews.thisMonth}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
