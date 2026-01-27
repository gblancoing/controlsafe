import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { getVehicleById } from '../actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { VehicleDetailCard } from './_components/vehicle-detail-card';
import { MaintenanceProgramsCard } from './_components/maintenance-programs-card';
import { VehicleQRCard } from './_components/vehicle-qr-card';
import { PredictiveAdvisorCard } from './_components/predictive-advisor-card';

export default async function VehicleAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    notFound();
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            {/* Botón Volver */}
            <Link href="/flota">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver a Flota
              </Button>
            </Link>

            {/* Grid de 4 secciones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sección 1: Detalle del Vehículo */}
              <VehicleDetailCard vehicle={vehicle} />

              {/* Sección 2: Programas de Mantenimiento Asignados */}
              <MaintenanceProgramsCard vehicleId={id} vehicleName={vehicle.name} />

              {/* Sección 3: Ficha del Vehículo mediante QR */}
              <VehicleQRCard vehicleId={id} />

              {/* Sección 4: Asesor de Mantenimiento Predictivo */}
              <PredictiveAdvisorCard vehicleId={id} vehicleName={vehicle.name} />
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
