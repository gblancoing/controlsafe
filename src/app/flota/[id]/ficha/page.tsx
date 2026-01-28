import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getVehicleById } from '../../actions';
import { Truck, Calendar, Wrench, Building2, ShieldCheck, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';
import { VehicleFichaQR } from './_components/vehicle-ficha-qr';
import { ReviewHistoryCard } from './_components/review-history-card';
import { getVehicleTypeLabel, getVehicleStatusLabel, getVehicleStatusVariant } from '@/lib/vehicle-utils';

export default async function VehicleFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    notFound();
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Operational':
        return 'default';
      case 'Maintenance':
        return 'secondary';
      case 'Out of Service':
        return 'destructive';
      case 'Not Allowed to Operate':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Operational':
        return 'Operativo';
      case 'Maintenance':
        return 'En Mantenimiento';
      case 'Out of Service':
        return 'Fuera de Servicio';
      case 'Not Allowed to Operate':
        return 'Inoperativo';
      default:
        return status;
    }
  };

  // URL para el QR code - usar la URL del servidor
  const fichaUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/flota/${id}/ficha`
    : `http://127.0.0.1:9002/flota/${id}/ficha`;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            {/* Header con QR Code */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-16 rounded-lg bg-primary text-primary-foreground">
                  <Truck className="size-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{vehicle.name}</h1>
                  <p className="text-muted-foreground">
                    Ficha de Vehículo / ID: {vehicle.patent || vehicle.id}
                  </p>
                </div>
              </div>
              <VehicleFichaQR vehicleId={id} />
            </div>

            {/* Información General */}
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
                <CardDescription>
                  Detalles y estado actual del vehículo
                </CardDescription>
                <div className="mt-4 flex justify-end">
                  <Badge variant={getVehicleStatusVariant(vehicle.status)} className="text-sm">
                    {getVehicleStatusLabel(vehicle.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Tipo</p>
                      <p className="text-sm text-muted-foreground">
                        {getVehicleTypeLabel(vehicle.type)}
                      </p>
                    </div>
                  </div>

                  {(vehicle.brand || vehicle.model) && (
                    <div className="flex items-start gap-3">
                      <Wrench className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Marca / Modelo</p>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.brand} {vehicle.model}
                        </p>
                      </div>
                    </div>
                  )}

                  {vehicle.year && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Año</p>
                        <p className="text-sm text-muted-foreground">{vehicle.year}</p>
                      </div>
                    </div>
                  )}

                  {vehicle.companyName && (
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Empresa Propietaria</p>
                        <p className="text-sm text-muted-foreground">{vehicle.companyName}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Programas de Mantenimiento */}
            {vehicle.maintenancePrograms && vehicle.maintenancePrograms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Programas de Mantenimiento Asignados</CardTitle>
                  <CardDescription>
                    Planes de mantenimiento preventivo para este vehículo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {vehicle.maintenancePrograms.map((program) => (
                      <div key={program.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{program.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                              Frecuencia: {program.frequencyValue} {program.frequencyUnit}
                            </span>
                          </div>
                        </div>
                        {program.description && (
                          <p className="text-sm text-muted-foreground">{program.description}</p>
                        )}
                        {program.tasks && program.tasks.length > 0 && (
                          <div className="space-y-2 pl-4 border-l-2">
                            {program.tasks.map((task) => (
                              <div key={task.id} className="flex items-start gap-2">
                                <ShieldCheck className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">{task.task}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <Separator />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Historial de Revisiones */}
            <ReviewHistoryCard vehicleId={id} />

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground py-4">
              <p>Ficha generada por ControlSafe el {new Date().toLocaleDateString('es-CL')}.</p>
              <p className="mt-1">URL: {fichaUrl}</p>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
