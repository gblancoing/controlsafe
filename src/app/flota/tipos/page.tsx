import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getVehicleTypes } from './actions';
import { VehicleTypesTable } from './_components/vehicle-types-table';
import { AddVehicleTypeButton } from './_components/add-vehicle-type-button';

export default async function VehicleTypesPage() {
  const types = await getVehicleTypes();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tipos de Vehículos</CardTitle>
                <CardDescription>Gestiona los tipos de vehículos disponibles en el sistema</CardDescription>
              </div>
              <AddVehicleTypeButton />
            </CardHeader>
            <CardContent>
              <VehicleTypesTable initialTypes={types} />
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
