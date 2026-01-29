'use client';

import { ManualUsuarioContent } from '../_components/manual-usuario-content';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import Link from 'next/link';

/** Página del manual de usuario (sin sidebar, para impresión/PDF) */
export default function ManualUsuarioPage() {
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/configuracion" className="text-sm text-muted-foreground hover:text-foreground">
            ← Volver a Configuración
          </Link>
          <h1 className="text-lg font-semibold">Manual de Usuario - ControlSafe</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 print:hidden"
          onClick={() => window.print()}
        >
          <FileDown className="h-4 w-4" />
          Guardar como PDF / Imprimir
        </Button>
      </header>
      <main id="manual-usuario" className="max-w-4xl mx-auto px-4 py-8 print:py-4">
        <ManualUsuarioContent />
      </main>
    </div>
  );
}
