'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Truck,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  Building,
  MapPin,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import type { DashboardMetrics as DashboardMetricsType } from '@/app/dashboard/actions';

export function DashboardMetrics({
  metrics,
}: {
  metrics: DashboardMetricsType;
}) {
  const metricCards = [
    {
      title: 'Flota Total',
      value: metrics.fleet.total,
      subtitle: `${metrics.fleet.operational} operacionales`,
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/flota',
      trend: metrics.fleet.operationalRate,
      trendLabel: 'Tasa operacional',
    },
    {
      title: 'Controles Preventivos',
      value: metrics.preventiveControls.total,
      subtitle: `${metrics.preventiveControls.overdue} vencidos`,
      icon: ShieldCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/torque',
      trend: metrics.preventiveControls.complianceRate,
      trendLabel: 'Tasa cumplimiento',
      alert: metrics.preventiveControls.overdue > 0,
    },
    {
      title: 'Revisiones',
      value: metrics.reviews.total,
      subtitle: `${metrics.reviews.thisMonth} este mes`,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/historial',
      trend: metrics.reviews.approvalRate,
      trendLabel: 'Tasa aprobación',
    },
    {
      title: 'Programas',
      value: metrics.programs.total,
      subtitle: `${metrics.programs.assigned} asignados`,
      icon: Wrench,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      link: '/mantenimiento',
    },
    {
      title: 'Empresas',
      value: metrics.companies.total,
      subtitle: `${metrics.companies.active} activas`,
      icon: Building,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      link: '/empresas',
    },
    {
      title: 'Proyectos',
      value: metrics.projects.total,
      subtitle: `${metrics.projects.active} activos`,
      icon: MapPin,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      link: '/faenas',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metricCards.map((metric) => (
        <Link key={metric.title} href={metric.link}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{metric.subtitle}</p>
                </div>
                {metric.alert && (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </div>
              {metric.trend !== undefined && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{metric.trendLabel}</span>
                    <Badge variant={metric.trend >= 80 ? 'default' : 'secondary'} className="text-xs">
                      {metric.trend}%
                    </Badge>
                  </div>
                  <Progress value={metric.trend} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
