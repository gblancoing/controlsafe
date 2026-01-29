'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserActions } from './user-actions';

type User = {
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

export function UsersTable({ users }: { users: User[] }) {
  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      SuperAdmin: 'Super Admin',
      Administrator: 'Administrador',
      Supervisor: 'Supervisor',
      Technician: 'Técnico',
      Driver: 'Chofer',
    };
    return roleMap[role] || role;
  };

  const getRoleVariant = (role: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (role) {
      case 'SuperAdmin':
        return 'destructive';
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

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">No hay usuarios registrados</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Habilitado para conducir</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Vehículos Asignados</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={getRoleVariant(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
              </TableCell>
              <TableCell>
                {user.canDrive ? (
                  <Badge variant="default" className="bg-green-500">Sí</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">No</span>
                )}
              </TableCell>
              <TableCell>{user.companyName || '-'}</TableCell>
              <TableCell>
                {user.vehicles.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {user.vehicles.map((vehicle) => (
                      <Badge key={vehicle.id} variant="outline" className="text-xs">
                        {vehicle.patent || vehicle.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <UserActions user={user} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
