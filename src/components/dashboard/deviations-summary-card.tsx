'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { DeviationsSummary } from '@/app/dashboard/actions';

export function DeviationsSummaryCard({ summary }: { summary: DeviationsSummary }) {
  if (summary.totalOccurrences === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Desviaciones</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription>
            Causas detectadas en revisiones de control preventivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sin desviaciones registradas aún.
          </p>
          <Link href="/reportes">
            <Badge variant="outline" className="mt-2 cursor-pointer hover:bg-accent">
              Ver reportes
            </Badge>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Desviaciones</CardTitle>
          <AlertCircle className="h-4 w-4 text-amber-500" />
        </div>
        <CardDescription>
          Causas más frecuentes en revisiones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total ocurrencias</span>
          <Badge variant="secondary">{summary.totalOccurrences}</Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Revisiones con desviación</span>
          <Badge variant="outline">{summary.reviewsWithDeviations}</Badge>
        </div>
        {summary.topCauses.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Principales causas</p>
            <ul className="space-y-1.5">
              {summary.topCauses.map((c) => (
                <li key={c.name} className="flex items-center justify-between text-xs">
                  <span className="truncate pr-2" title={c.name}>{c.name}</span>
                  <Badge variant="secondary" className="shrink-0">{c.count}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
        {summary.byCompany && summary.byCompany.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Por empresa</p>
            <ul className="space-y-1.5">
              {summary.byCompany.map((c) => (
                <li key={c.companyName} className="flex items-center justify-between text-xs">
                  <span className="truncate pr-2" title={c.companyName}>{c.companyName}</span>
                  <Badge variant="outline" className="shrink-0">{c.total}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
        {summary.byVehicleType && summary.byVehicleType.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Por tipo de vehículo</p>
            <ul className="space-y-1.5">
              {summary.byVehicleType.map((v) => (
                <li key={v.vehicleTypeLabel} className="flex items-center justify-between text-xs">
                  <span className="truncate pr-2" title={v.vehicleTypeLabel}>{v.vehicleTypeLabel}</span>
                  <Badge variant="outline" className="shrink-0">{v.total}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Link href="/reportes">
          <Badge variant="outline" className="w-full justify-center cursor-pointer hover:bg-accent">
            Ver análisis completo
          </Badge>
        </Link>
      </CardContent>
    </Card>
  );
}
