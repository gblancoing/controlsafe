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
import { Truck, CheckCircle2, Wrench, XCircle, AlertTriangle } from 'lucide-react';
import type { FleetStatusReport } from '../actions';

export function FleetStatusReportCard({ report }: { report: FleetStatusReport }) {
  const operationalRate = report.totalVehicles > 0
    ? Math.round((report.operational / report.totalVehicles) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Resumen General */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehículos</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalVehicles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operacionales</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{report.operational}</div>
            <p className="text-xs text-muted-foreground">{operationalRate}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Mantenimiento</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{report.maintenance}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuera de Servicio</CardTitle>
            <XCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{report.outOfService}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Permitidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{report.notAllowedToOperate}</div>
          </CardContent>
        </Card>
      </div>

      {/* Vehículos Inoperativos */}
      {report.inoperationalVehicles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Vehículos Inoperativos</CardTitle>
            <CardDescription>
              Vehículos que no pueden operar y requieren atención inmediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Patente</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.inoperationalVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.name}</TableCell>
                    <TableCell>{vehicle.patent || '-'}</TableCell>
                    <TableCell>{vehicle.companyName || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{vehicle.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {vehicle.reason}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Por Tipo */}
      <Card>
        <CardHeader>
          <CardTitle>Estado por Tipo de Vehículo</CardTitle>
          <CardDescription>Desglose de vehículos por tipo</CardDescription>
        </CardHeader>
        <CardContent>
          {report.byType.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No hay datos disponibles
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Operacionales</TableHead>
                  <TableHead>Mantenimiento</TableHead>
                  <TableHead>Fuera de Servicio</TableHead>
                  <TableHead>No Permitidos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.byType.map((type) => (
                  <TableRow key={type.type}>
                    <TableCell className="font-medium">{type.type}</TableCell>
                    <TableCell>{type.total}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-500">
                        {type.operational}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {type.maintenance}
                      </Badge>
                    </TableCell>
                    <TableCell>{type.outOfService}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{type.notAllowedToOperate}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Por Empresa */}
      <Card>
        <CardHeader>
          <CardTitle>Estado por Empresa</CardTitle>
          <CardDescription>Desglose de vehículos por empresa</CardDescription>
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
                  <TableHead>Operacionales</TableHead>
                  <TableHead>Mantenimiento</TableHead>
                  <TableHead>Fuera de Servicio</TableHead>
                  <TableHead>No Permitidos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.byCompany.map((company) => (
                  <TableRow key={company.companyId}>
                    <TableCell className="font-medium">{company.companyName}</TableCell>
                    <TableCell>{company.total}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-500">
                        {company.operational}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {company.maintenance}
                      </Badge>
                    </TableCell>
                    <TableCell>{company.outOfService}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{company.notAllowedToOperate}</Badge>
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
