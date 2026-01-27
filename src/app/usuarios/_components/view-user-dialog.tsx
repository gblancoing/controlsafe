'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Building2, Car, Phone, FolderKanban } from 'lucide-react';

type UserData = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  canDrive?: boolean;
  companyName?: string;
  projectName?: string;
  vehicles: Array<{ id: string; name: string; patent?: string }>;
};

export function ViewUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: UserData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      Administrator: 'Administrador',
      Supervisor: 'Supervisor',
      Technician: 'Técnico',
      Driver: 'Chofer',
    };
    return roleMap[role] || role;
  };

  const getRoleVariant = (role: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (role) {
      case 'Administrator':
        return 'destructive';
      case 'Supervisor':
        return 'default';
      case 'Technician':
        return 'secondary';
      case 'Driver':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalles del Usuario
          </DialogTitle>
          <DialogDescription>
            Información completa del usuario
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{user.name}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={getRoleVariant(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
                {user.canDrive && (
                  <Badge variant="default" className="bg-green-500">Habilitado para conducir</Badge>
                )}
              </div>
            </div>
            <Separator />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Celular</p>
                  <p className="text-sm text-muted-foreground">{user.phone}</p>
                </div>
              </div>
            )}

            {user.companyName && (
              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Empresa</p>
                  <p className="text-sm text-muted-foreground">{user.companyName}</p>
                </div>
              </div>
            )}

            {user.projectName && (
              <div className="flex items-start gap-3">
                <FolderKanban className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Proyecto</p>
                  <p className="text-sm text-muted-foreground">{user.projectName}</p>
                </div>
              </div>
            )}
          </div>

          {user.vehicles.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Vehículos Asignados</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.vehicles.map((vehicle) => (
                    <Badge key={vehicle.id} variant="outline">
                      {vehicle.patent || vehicle.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
