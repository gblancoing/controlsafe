'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, BarChart3, FileWarning, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { DeviationsReport } from '../actions';

export function DeviationsReportCard({ report }: { report: DeviationsReport }) {
  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ocurrencias</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalOccurrences}</div>
            <p className="text-xs text-muted-foreground">
              Desviaciones marcadas en revisiones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revisiones con desviaciones</CardTitle>
            <FileWarning className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.reviewsWithDeviations}</div>
            <p className="text-xs text-muted-foreground">
              de {report.totalReviews} revisiones totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Causas distintas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.byDeviationType.length}</div>
            <p className="text-xs text-muted-foreground">
              Tipos de desviación registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">% revisiones con desviación</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {report.totalReviews > 0
                ? Math.round((report.reviewsWithDeviations / report.totalReviews) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Sobre el total de revisiones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Por causa (tabla principal) */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis por causa de desviación</CardTitle>
          <CardDescription>
            Frecuencia de cada causa detectada en las revisiones de control preventivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {report.byDeviationType.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay desviaciones registradas aún. Se mostrarán cuando se marquen causas en el formulario &quot;Revisar Control Preventivo&quot;.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Causa de desviación</TableHead>
                  <TableHead className="text-right">Ocurrencias</TableHead>
                  <TableHead className="text-right">% del total</TableHead>
                  <TableHead className="w-32">Proporción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.byDeviationType.map((row) => (
                  <TableRow key={row.deviationTypeId}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{row.count}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{row.percentage}%</TableCell>
                    <TableCell>
                      <Progress value={row.percentage} className="h-2" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Por empresa */}
      {report.byCompany && report.byCompany.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tendencias por empresa</CardTitle>
            <CardDescription>
              Cantidad de desviaciones detectadas por empresa y principales causas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead>Principales causas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.byCompany.map((row) => (
                  <TableRow key={row.companyId}>
                    <TableCell className="font-medium">{row.companyName}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{row.total}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{row.percentage}%</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {row.topCauses.slice(0, 3).map((c) => (
                          <Badge key={c.name} variant="outline" className="text-xs font-normal">
                            {c.name}: {c.count}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Por tipo de vehículo */}
      {report.byVehicleType && report.byVehicleType.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tendencias por tipo de vehículo</CardTitle>
            <CardDescription>
              Cantidad de desviaciones detectadas por tipo de vehículo y principales causas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de vehículo</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead>Principales causas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.byVehicleType.map((row) => (
                  <TableRow key={row.vehicleType}>
                    <TableCell className="font-medium">{row.vehicleTypeLabel}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{row.total}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{row.percentage}%</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {row.topCauses.slice(0, 3).map((c) => (
                          <Badge key={c.name} variant="outline" className="text-xs font-normal">
                            {c.name}: {c.count}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Por mes */}
      {report.byMonth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Desviaciones por mes</CardTitle>
            <CardDescription>
              Total de desviaciones registradas y principales causas por mes (últimos 12 meses)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mes</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Principales causas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.byMonth.map((month) => (
                  <TableRow key={month.month}>
                    <TableCell className="font-medium">{month.month}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{month.total}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {month.topCauses.slice(0, 3).map((c) => (
                          <Badge key={c.name} variant="secondary" className="text-xs font-normal">
                            {c.name}: {c.count}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
