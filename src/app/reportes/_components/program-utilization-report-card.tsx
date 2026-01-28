'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Wrench, CheckCircle2, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import type { ProgramUtilizationReport } from '../actions';

export function ProgramUtilizationReportCard({
  report,
}: {
  report: ProgramUtilizationReport;
}) {
  return (
    <div className="space-y-4">
      {/* Resumen General */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Programas</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalPrograms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asignados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{report.assignedPrograms}</div>
            <p className="text-xs text-muted-foreground">
              {report.totalPrograms > 0
                ? Math.round((report.assignedPrograms / report.totalPrograms) * 100)
                : 0}
              % del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Asignar</CardTitle>
            <XCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{report.unassignedPrograms}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detalle de Programas */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Programas de Mantenimiento</CardTitle>
          <CardDescription>
            Utilización y efectividad de cada programa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {report.programs.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No hay programas registrados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Programa</TableHead>
                  <TableHead>Vehículos Asignados</TableHead>
                  <TableHead>Total Revisiones</TableHead>
                  <TableHead>Aprobadas</TableHead>
                  <TableHead>Rechazadas</TableHead>
                  <TableHead>Urgentes</TableHead>
                  <TableHead>Tasa Aprobación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.programs
                  .sort((a, b) => b.assignedVehicles - a.assignedVehicles)
                  .map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{program.name}</div>
                          {program.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {program.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {program.assignedVehicles > 0 ? (
                          <Badge variant="default">{program.assignedVehicles}</Badge>
                        ) : (
                          <Badge variant="outline">0</Badge>
                        )}
                      </TableCell>
                      <TableCell>{program.totalReviews}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-500">
                          {program.approvedReviews}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{program.rejectedReviews}</Badge>
                      </TableCell>
                      <TableCell>
                        {program.urgentRejectedReviews > 0 ? (
                          <Badge variant="destructive">
                            {program.urgentRejectedReviews}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            program.approvalRate >= 80
                              ? 'default'
                              : program.approvalRate >= 60
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {program.approvalRate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
