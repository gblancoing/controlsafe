'use client';
import React, { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getPrediction } from '@/app/actions';
import { mockVehicles, vec001MaintenanceHistory } from '@/lib/data';
import { Bot, Lightbulb, Loader, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PredictiveAdvisor() {
  const [isPending, startTransition] = useTransition();
  const [advice, setAdvice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const targetVehicle = mockVehicles[0];

  const handleAnalysis = () => {
    setError(null);
    setAdvice(null);

    startTransition(async () => {
      const input = {
        vehicleId: targetVehicle.id,
        maintenanceRecords: JSON.stringify(vec001MaintenanceHistory),
      };

      const result = await getPrediction(input);

      if (result.error) {
        setError(result.error);
        toast({
          variant: "destructive",
          title: "Análisis Fallido",
          description: result.error,
        });
      } else {
        setAdvice(result.advice);
      }
    });
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Asesor de Mantenimiento Predictivo</CardTitle>
            <CardDescription>Análisis con IA para su flota.</CardDescription>
          </div>
          <Bot className="h-6 w-6 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-sm text-muted-foreground mb-4">
          Analizar el historial de mantenimiento de{' '}
          <span className="font-semibold text-foreground">{targetVehicle.name}</span> para identificar problemas potenciales y obtener recomendaciones.
        </div>
        
        {isPending && (
            <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
                <div className="flex flex-col items-center gap-2 text-center">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium">Analizando registros...</p>
                    <p className="text-xs text-muted-foreground">La IA está revisando el historial de mantenimiento.</p>
                </div>
            </div>
        )}

        {error && !isPending && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {advice && !isPending && (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Recomendación de la IA</AlertTitle>
            <AlertDescription>
              <pre className="whitespace-pre-wrap font-body text-sm">{advice}</pre>
            </AlertDescription>
          </Alert>
        )}

        {!advice && !error && !isPending && (
             <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
                <div className="flex flex-col items-center gap-2 text-center">
                    <p className="text-sm font-medium">Listo para Analizar</p>
                    <p className="text-xs text-muted-foreground">Haga clic en el botón de abajo para comenzar.</p>
                </div>
            </div>
        )}

      </CardContent>
      <CardFooter>
        <Button onClick={handleAnalysis} disabled={isPending} className="w-full">
          {isPending ? 'Analizando...' : `Analizar ${targetVehicle.name}`}
        </Button>
      </CardFooter>
    </Card>
  );
}
