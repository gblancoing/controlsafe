'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, FileDown, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { ManualUsuarioContent } from './manual-usuario-content';

export function InformacionApp() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Información de la aplicación
          </CardTitle>
          <CardDescription>
            Manual de usuario, flujos de trabajo por rol, alertas y módulos de ControlSafe. Puede leerlo aquí en la web o descargarlo en PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="default" className="gap-2">
              <Link href="/configuracion/manual" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Abrir en nueva pestaña
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/configuracion/manual" target="_blank" rel="noopener noreferrer">
                <FileDown className="h-4 w-4" />
                Descargar manual (PDF)
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Para PDF: abra el manual en nueva pestaña, pulse <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">Ctrl+P</kbd> y seleccione &quot;Guardar como PDF&quot;.
          </p>
        </CardContent>
      </Card>

      {/* Manual didáctico en web: visible directamente en la pestaña */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5" />
            Manual de usuario (lectura en línea)
          </CardTitle>
          <CardDescription>
            A continuación puede leer el manual completo sin salir de esta pestaña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/30 p-6">
            <ManualUsuarioContent />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
