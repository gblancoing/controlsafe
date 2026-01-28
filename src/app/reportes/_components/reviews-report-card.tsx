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
import { FileText, CheckCircle2, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import type { ReviewsReport } from '../actions';

export function ReviewsReportCard({ report }: { report: ReviewsReport }) {
  return (
    <div className="space-y-4">
      {/* Resumen General */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revisiones</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalReviews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{report.approved}</div>
            <p className="text-xs text-muted-foreground">
              {report.totalReviews > 0
                ? Math.round((report.approved / report.totalReviews) * 100)
                : 0}
              % del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
            <XCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{report.rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rechazo Urgente</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{report.urgentRejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasa de Aprobación */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tasa de Aprobación</CardTitle>
              <CardDescription>
                Porcentaje de revisiones aprobadas sobre el total
              </CardDescription>
            </div>
            <Badge variant="default" className="text-lg px-4 py-2">
              {report.approvalRate}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={report.approvalRate} className="h-3" />
        </CardContent>
      </Card>

      {/* Por Mes */}
      {report.byMonth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revisiones por Mes</CardTitle>
            <CardDescription>Tendencia de revisiones en el tiempo</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mes</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Aprobadas</TableHead>
                  <TableHead>Rechazadas</TableHead>
                  <TableHead>Urgentes</TableHead>
                  <TableHead>Tasa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.byMonth.map((month) => {
                  const rate = month.total > 0
                    ? Math.round((month.approved / month.total) * 100)
                    : 0;
                  return (
                    <TableRow key={month.month}>
                      <TableCell className="font-medium">{month.month}</TableCell>
                      <TableCell>{month.total}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-500">
                          {month.approved}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{month.rejected}</Badge>
                      </TableCell>
                      <TableCell>
                        {month.urgentRejected > 0 ? (
                          <Badge variant="destructive">{month.urgentRejected}</Badge>
                        ) : (
                          '-'
                        )}
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
          </CardContent>
        </Card>
      )}

      {/* Por Empresa */}
      <Card>
        <CardHeader>
          <CardTitle>Revisiones por Empresa</CardTitle>
          <CardDescription>Desglose de revisiones por empresa</CardDescription>
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
                  <TableHead>Aprobadas</TableHead>
                  <TableHead>Rechazadas</TableHead>
                  <TableHead>Urgentes</TableHead>
                  <TableHead>Tasa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.byCompany.map((company) => {
                  const rate = company.total > 0
                    ? Math.round((company.approved / company.total) * 100)
                    : 0;
                  return (
                    <TableRow key={company.companyId}>
                      <TableCell className="font-medium">{company.companyName}</TableCell>
                      <TableCell>{company.total}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-500">
                          {company.approved}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{company.rejected}</Badge>
                      </TableCell>
                      <TableCell>
                        {company.urgentRejected > 0 ? (
                          <Badge variant="destructive">{company.urgentRejected}</Badge>
                        ) : (
                          '-'
                        )}
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
          <CardTitle>Revisiones por Programa</CardTitle>
          <CardDescription>Desglose de revisiones por programa de mantenimiento</CardDescription>
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
                  <TableHead>Aprobadas</TableHead>
                  <TableHead>Rechazadas</TableHead>
                  <TableHead>Urgentes</TableHead>
                  <TableHead>Tasa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.byProgram.map((program) => {
                  const rate = program.total > 0
                    ? Math.round((program.approved / program.total) * 100)
                    : 0;
                  return (
                    <TableRow key={program.programId}>
                      <TableCell className="font-medium">{program.programName}</TableCell>
                      <TableCell>{program.total}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-500">
                          {program.approved}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{program.rejected}</Badge>
                      </TableCell>
                      <TableCell>
                        {program.urgentRejected > 0 ? (
                          <Badge variant="destructive">{program.urgentRejected}</Badge>
                        ) : (
                          '-'
                        )}
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
