'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { VehicleFichaQR } from '../ficha/_components/vehicle-ficha-qr';

export function VehicleQRCard({ vehicleId }: { vehicleId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ficha de Vehículo</CardTitle>
        <CardDescription>Acceso rápido a la información del vehículo.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 py-6">
        <VehicleFichaQR vehicleId={vehicleId} />
        <Link href={`/flota/${vehicleId}/ficha`}>
          <Button className="gap-2">
            Ver Ficha Completa
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
