import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Key } from 'lucide-react';

export default async function ACLPage() {
  // Roles y permisos según la política de alcance: SuperAdmin todo; Admin por proyecto; Supervisor/Técnico/Chofer por empresa.
  const roles = [
    {
      role: 'SuperAdmin',
      roleLabel: 'Super Admin',
      scope: 'Todos los proyectos y empresas. Sin filtro.',
      description: 'Control total del sistema. Ve y gestiona todos los datos, usuarios, empresas, proyectos y configuraciones.',
      modules: [
        'Panel de Control',
        'Empresas',
        'Proyectos',
        'Flota',
        'Mantenimiento',
        'Control Preventivo',
        'Historial',
        'Reportes',
        'Usuarios',
        'Roles y Permisos',
        'Configuración',
      ],
      badgeVariant: 'default' as const,
    },
    {
      role: 'Administrator',
      roleLabel: 'Administrador',
      scope: 'Solo el proyecto asignado y las empresas de ese proyecto (mandante + subcontratistas).',
      description: 'Administra su proyecto. Gestiona usuarios, empresas y datos dentro de su proyecto; no ve otros proyectos.',
      modules: [
        'Panel de Control',
        'Empresas',
        'Proyectos',
        'Flota',
        'Mantenimiento',
        'Control Preventivo',
        'Historial',
        'Reportes',
        'Usuarios',
        'Roles y Permisos',
        'Configuración',
      ],
      badgeVariant: 'default' as const,
    },
    {
      role: 'Supervisor',
      roleLabel: 'Supervisor',
      scope: 'Solo la empresa asignada. Datos filtrados por empresa.',
      description: 'Supervisa operaciones de su empresa. Flota, mantenimiento, control preventivo, historial y reportes de su empresa.',
      modules: [
        'Panel de Control',
        'Proyectos',
        'Flota',
        'Mantenimiento',
        'Control Preventivo',
        'Historial',
        'Reportes',
      ],
      badgeVariant: 'secondary' as const,
    },
    {
      role: 'Technician',
      roleLabel: 'Técnico',
      scope: 'Solo la empresa asignada. Datos filtrados por empresa.',
      description: 'Ejecuta tareas de mantenimiento y controles preventivos. Ve flota, historial y reportes de su empresa.',
      modules: [
        'Panel de Control',
        'Proyectos',
        'Flota',
        'Mantenimiento',
        'Control Preventivo',
        'Historial',
        'Reportes',
      ],
      badgeVariant: 'secondary' as const,
    },
    {
      role: 'Driver',
      roleLabel: 'Chofer',
      scope: 'Solo la empresa asignada. Acceso limitado a reportes.',
      description: 'Rol operativo. Acceso a reportes para consultar información de su ámbito.',
      modules: ['Reportes'],
      badgeVariant: 'outline' as const,
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Roles y Permisos (ACL)</h1>
              <p className="text-muted-foreground mt-2">
                Descripción de los roles de usuario y sus niveles de acceso dentro de ControlSafe.
              </p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Niveles de Acceso</CardTitle>
                </div>
                <CardDescription>
                  Cada rol está diseñado para una función específica dentro de la operación.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Rol</TableHead>
                      <TableHead className="w-[220px]">Alcance</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="min-w-[200px]">Módulos Accesibles</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.role}>
                        <TableCell>
                          <Badge variant={role.badgeVariant}>
                            {role.roleLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {role.scope}
                        </TableCell>
                        <TableCell className="max-w-sm">
                          <p className="text-sm">{role.description}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {role.modules.map((module, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {module}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
