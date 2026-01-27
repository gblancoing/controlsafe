import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getMaintenancePrograms } from './actions';
import { ProgramsTable } from './_components/programs-table';
import { AddMaintenanceProgramButton } from './_components/add-maintenance-program-button';

export default async function MantenimientoPage() {
  const programs = await getMaintenancePrograms();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestión de Programas de Mantenimiento</CardTitle>
                <CardDescription>
                  Administra los programas de mantenimiento recurrentes del sistema.
                </CardDescription>
              </div>
              <AddMaintenanceProgramButton />
            </CardHeader>
            <CardContent>
              <ProgramsTable programs={programs} />
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
