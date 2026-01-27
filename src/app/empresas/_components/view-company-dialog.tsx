'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Company } from '@/lib/types';
import { Building2, MapPin, Phone, Mail, User, FileText } from 'lucide-react';

export function ViewCompanyDialog({
  company,
  open,
  onOpenChange,
}: {
  company: Company;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Ficha de Empresa
          </DialogTitle>
          <DialogDescription>
            Información detallada de la empresa
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Información Principal */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{company.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant={company.type === 'Mandante' ? 'default' : 'secondary'}>
                  {company.type}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  <MapPin className="inline h-3 w-3 mr-1" />
                  {company.country}
                </span>
              </div>
            </div>
            <Separator />
          </div>

          {/* Información de Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {company.rut && (
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">RUT</p>
                  <p className="text-sm text-muted-foreground">{company.rut}</p>
                </div>
              </div>
            )}

            {company.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Teléfono</p>
                  <p className="text-sm text-muted-foreground">{company.phone}</p>
                </div>
              </div>
            )}

            {company.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{company.email}</p>
                </div>
              </div>
            )}

            {company.contactPerson && (
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Persona de Contacto</p>
                  <p className="text-sm text-muted-foreground">{company.contactPerson}</p>
                </div>
              </div>
            )}
          </div>

          {company.address && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Dirección</p>
                  <p className="text-sm text-muted-foreground">{company.address}</p>
                </div>
              </div>
            </>
          )}

          {!company.rut && !company.phone && !company.email && !company.contactPerson && !company.address && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No hay información adicional disponible.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
