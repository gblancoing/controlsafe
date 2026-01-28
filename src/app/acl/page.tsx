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
  // Definir roles y sus permisos según el estado actual del proyecto
  const roles = [
    {
      role: 'Administrator',
      roleLabel: 'Administrator',
      description: 'Tiene control total sobre la aplicación. Puede gestionar usuarios, empresas, proyectos y configuraciones del sistema.',
      modules: ['Todo', 'Gestión de Usuarios', 'Gestión de Empresas', 'Gestión de Proyectos', 'Configuración'],
      badgeVariant: 'default' as const,
    },
    {
      role: 'Supervisor',
      roleLabel: 'Supervisor',
      description: 'Gestiona las operaciones diarias. Puede administrar la flota, los programas de mantenimiento y ver reportes, pero no puede gestionar usuarios ni empresas.',
      modules: ['Proyectos', 'Flota', 'Programas', 'Control Preventivo', 'Historial', 'Reportes'],
      badgeVariant: 'secondary' as const,
    },
    {
      role: 'Technician',
      roleLabel: 'Technician',
      description: 'Ejecuta las tareas de mantenimiento. Puede ver la flota, el control preventivo y registrar intervenciones en el historial.',
      modules: ['Flota', 'Control Preventivo', 'Historial'],
      badgeVariant: 'secondary' as const,
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Rol</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Módulos Accesibles</TableHead>
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
                        <TableCell className="max-w-md">
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
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
