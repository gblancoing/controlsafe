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
import { CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import type { ComplianceReport } from '../actions';

export function ComplianceReportCard({ report }: { report: ComplianceReport }) {
  return (
    <div className="space-y-4">
      {/* Resumen General */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Controles</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalControls}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{report.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{report.due}</div>
            <p className="text-xs text-muted-foreground">Próximos 7 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{report.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasa de Cumplimiento */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tasa de Cumplimiento</CardTitle>
              <CardDescription>
                Porcentaje de controles a tiempo (pendientes + por vencer)
              </CardDescription>
            </div>
            <Badge variant="default" className="text-lg px-4 py-2">
              {report.complianceRate}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={report.complianceRate} className="h-3" />
        </CardContent>
      </Card>

      {/* Por Empresa */}
      <Card>
        <CardHeader>
          <CardTitle>Cumplimiento por Empresa</CardTitle>
          <CardDescription>Desglose de controles por empresa</CardDescription>
        </CardHeader>
        <CardContent>
          {report.byCompany.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No hay datos disponibles
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pendientes</TableHead>
                  <TableHead>Por Vencer</TableHead>
                  <TableHead>Vencidos</TableHead>
                  <TableHead>Tasa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.byCompany.map((company) => {
                  const rate = company.total > 0
                    ? Math.round(((company.pending + company.due) / company.total) * 100)
                    : 0;
                  return (
                    <TableRow key={company.companyId}>
                      <TableCell className="font-medium">{company.companyName}</TableCell>
                      <TableCell>{company.total}</TableCell>
                      <TableCell>{company.pending}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          {company.due}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{company.overdue}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rate >= 80 ? 'default' : 'secondary'}>
                          {rate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Por Programa */}
      <Card>
        <CardHeader>
          <CardTitle>Cumplimiento por Programa</CardTitle>
          <CardDescription>Desglose de controles por programa de mantenimiento</CardDescription>
        </CardHeader>
        <CardContent>
          {report.byProgram.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No hay datos disponibles
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Programa</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pendientes</TableHead>
                  <TableHead>Por Vencer</TableHead>
                  <TableHead>Vencidos</TableHead>
                  <TableHead>Tasa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.byProgram.map((program) => {
                  const rate = program.total > 0
                    ? Math.round(((program.pending + program.due) / program.total) * 100)
                    : 0;
                  return (
                    <TableRow key={program.programId}>
                      <TableCell className="font-medium">{program.programName}</TableCell>
                      <TableCell>{program.total}</TableCell>
                      <TableCell>{program.pending}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          {program.due}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{program.overdue}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rate >= 80 ? 'default' : 'secondary'}>
                          {rate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
