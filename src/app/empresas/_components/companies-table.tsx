
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Globe } from 'lucide-react';
import type { Company } from '@/lib/types';
import { CompanyActions } from './company-actions';

export function CompaniesTable({ initialCompanies }: { initialCompanies: Company[] | null }) {
  if (!initialCompanies) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al cargar empresas</AlertTitle>
        <AlertDescription>
          No se pudieron cargar los datos de las empresas. Verifica la conexión a la base de datos.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (initialCompanies.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <Globe className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No hay empresas registradas</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                Para empezar, añade tu primera empresa usando el botón de arriba.
            </p>
        </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre de la Empresa</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>País</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialCompanies.map((company) => (
            <TableRow key={company.id}>
              <TableCell className="font-medium">{company.name}</TableCell>
              <TableCell>
                <Badge variant={company.type === 'Mandante' ? 'default' : 'secondary'}>
                  {company.type}
                </Badge>
              </TableCell>
              <TableCell>{company.country}</TableCell>
              <TableCell className="text-right">
                <CompanyActions company={company} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
