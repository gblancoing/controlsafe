'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';

export function PredictiveAdvisorCard({
  vehicleId,
  vehicleName,
}: {
  vehicleId: string;
  vehicleName: string;
}) {
  const handleAnalyze = () => {
    // TODO: Implementar análisis predictivo
    console.log('Analizar historial para:', vehicleName);
    // Aquí se implementará la lógica de análisis predictivo
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asesor de Mantenimiento Predictivo</CardTitle>
        <CardDescription>Análisis con IA para {vehicleName}.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 py-6">
        <div className="text-center space-y-2">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-sm font-medium">Listo para Analizar</p>
          <p className="text-sm text-muted-foreground">
            Haga clic en el botón de abajo para comenzar.
          </p>
        </div>
        <Button onClick={handleAnalyze} className="gap-2">
          Analizar Historial
        </Button>
      </CardContent>
    </Card>
  );
}
