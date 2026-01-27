import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getVehicles, getAllCompanies } from './actions';
import { VehiclesTable } from './_components/vehicles-table';
import { AddVehicleButton } from './_components/add-vehicle-button';

export default async function FlotaPage() {
  const vehicles = await getVehicles();
  const companies = await getAllCompanies();
  
  // Crear mapa de empresas para búsqueda rápida
  const companiesMap: Record<string, string> = {};
  companies.forEach((company) => {
    companiesMap[company.id] = company.name;
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestión de Flota</CardTitle>
                <CardDescription>Administra los vehículos de la flota</CardDescription>
              </div>
              <AddVehicleButton />
            </CardHeader>
            <CardContent>
              <VehiclesTable initialVehicles={vehicles} companiesMap={companiesMap} />
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
