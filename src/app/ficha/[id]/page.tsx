import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getVehicleById } from '@/app/flota/actions';
import { Truck, Calendar, Wrench, Building2, ShieldCheck, Clock, FileText } from 'lucide-react';
import { notFound } from 'next/navigation';
import { ReviewHistoryCard } from '@/app/flota/[id]/ficha/_components/review-history-card';
import { getVehicleTypeLabel, getVehicleStatusLabel, getVehicleStatusVariant } from '@/lib/vehicle-utils';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await getVehicleById(id);
  if (!vehicle) return { title: 'Ficha de Vehículo - ControlSafe' };
  return {
    title: `${vehicle.name} - Ficha de Vehículo | ControlSafe`,
    description: `Ficha de vehículo ${vehicle.name}. Acceso rápido a la información del vehículo.`,
  };
}

/** Página pública de la ficha del vehículo: sin login, sin sidebar ni header. Solo la ficha. */
export default async function FichaPublicaPage({
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
    <div className="min-h-svh bg-background">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Encabezado mínimo: solo título de la ficha */}
        <header className="mb-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-12 rounded-lg bg-primary text-primary-foreground">
              <Truck className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{vehicle.name}</h1>
              <p className="text-sm text-muted-foreground">
                Ficha de Vehículo · {vehicle.patent || vehicle.id}
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
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
                  <Truck className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Tipo</p>
                    <p className="text-sm text-muted-foreground">
                      {getVehicleTypeLabel(vehicle.type)}
                    </p>
                  </div>
                </div>

                {(vehicle.brand || vehicle.model) && (
                  <div className="flex items-start gap-3">
                    <Wrench className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
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
                    <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Año</p>
                      <p className="text-sm text-muted-foreground">{vehicle.year}</p>
                    </div>
                  </div>
                )}

                {vehicle.companyName && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Empresa Propietaria</p>
                      <p className="text-sm text-muted-foreground">{vehicle.companyName}</p>
                    </div>
                  </div>
                )}

                {(vehicle.technicalReviewDate || vehicle.technicalReviewExpiryDate) && (
                  <div className="flex items-start gap-3 pt-2 border-t md:col-span-2">
                    <ShieldCheck className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Revisión Técnica</p>
                      <div className="text-sm text-muted-foreground space-y-0.5">
                        {vehicle.technicalReviewDate && (
                          <p>Fecha revisión: {new Date(vehicle.technicalReviewDate).toLocaleDateString('es-CL')}</p>
                        )}
                        {vehicle.technicalReviewExpiryDate && (
                          <p>Vencimiento: {new Date(vehicle.technicalReviewExpiryDate).toLocaleDateString('es-CL')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {vehicle.circulationPermitStatus && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Permiso Circulación</p>
                      <p className="text-sm text-muted-foreground">{vehicle.circulationPermitStatus}</p>
                    </div>
                  </div>
                )}

                {vehicle.documents && vehicle.documents.length > 0 && (
                  <div className="flex items-start gap-3 pt-2 border-t md:col-span-2">
                    <FileText className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Documentación</p>
                      <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                        {vehicle.documents.map((doc) => {
                          const fileSegment = doc.url.split('/').pop() || '';
                          const href = `/api/files/vehicles/${vehicle.id}/${encodeURIComponent(fileSegment)}`;
                          return (
                            <li key={doc.id}>
                              <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {doc.fileName || doc.caption || doc.type}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
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
                              <ShieldCheck className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
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

          {/* Pie mínimo */}
          <footer className="text-center text-xs text-muted-foreground py-6">
            ControlSafe · Ficha de vehículo · {new Date().toLocaleDateString('es-CL')}
          </footer>
        </div>
      </div>
    </div>
  );
}
