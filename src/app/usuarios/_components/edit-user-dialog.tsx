'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { updateUser, getAllCompanies, getAllProjects } from '../actions';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  canDrive?: boolean;
  isActive?: boolean;
  companyId?: string;
  projectId?: string;
};

export function EditUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [role, setRole] = useState<string>(user.role);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setError(null);
      setRole(user.role);
      Promise.all([getAllCompanies(), getAllProjects()]).then(([companiesList, projectsList]) => {
        setCompanies(companiesList);
        setProjects(projectsList);
      });
    }
  }, [open, user.role]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;
    const selectedRole = formData.get('role') as string;
    const canDrive = formData.get('canDrive') === 'on';
    const isActive = formData.get('isActive') === 'on';
    const companyId = formData.get('companyId') as string;
    const projectId = formData.get('projectId') as string;

    if (!name || !email || !selectedRole) {
      setError('El nombre, email y rol son obligatorios.');
      return;
    }
    if (!companyId || companyId === '__none__') {
      setError('Debe seleccionar una empresa.');
      return;
    }
    if (!projectId || projectId === '__none__') {
      setError('Debe seleccionar un proyecto.');
      return;
    }
    if (password && password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const finalCompanyId = companyId;
    const finalProjectId = projectId;

    startTransition(async () => {
      const result = await updateUser(user.id, {
        name,
        email,
        password: password || undefined,
        phone: phone || undefined,
        role: selectedRole as 'SuperAdmin' | 'Administrator' | 'Supervisor' | 'Technician' | 'Driver',
        canDrive,
        isActive,
        companyId: finalCompanyId,
        projectId: finalProjectId,
      });
      if (result.error) {
        setError(result.error);
      } else {
        onOpenChange(false);
        setTimeout(() => {
          toast({
            title: 'Usuario Actualizado',
            description: `El usuario ${name} ha sido actualizado con éxito.`,
          });
          router.refresh();
        }, 150);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) setError(null); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los detalles del usuario.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error al actualizar usuario</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nombre
              </Label>
              <Input
                id="edit-name"
                name="name"
                required
                className="col-span-3"
                defaultValue={user.name}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                required
                className="col-span-3"
                defaultValue={user.email}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">
                Celular
              </Label>
              <Input
                id="edit-phone"
                name="phone"
                type="tel"
                className="col-span-3"
                defaultValue={user.phone || ''}
                placeholder="Ej: +56 9 1234 5678"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Rol
              </Label>
              <Select name="role" required defaultValue={user.role} value={role} onValueChange={setRole}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SuperAdmin">Super Admin</SelectItem>
                  <SelectItem value="Administrator">Administrador</SelectItem>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                  <SelectItem value="Technician">Técnico</SelectItem>
                  <SelectItem value="Driver">Chofer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-canDrive" className="text-right">
                Habilitado para conducir
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox id="edit-canDrive" name="canDrive" defaultChecked={user.canDrive} />
                <Label htmlFor="edit-canDrive" className="text-sm font-normal cursor-pointer">
                  El usuario está habilitado para conducir vehículos
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-isActive" className="text-right">
                Estado del Usuario
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox id="edit-isActive" name="isActive" defaultChecked={user.isActive !== false} />
                <Label htmlFor="edit-isActive" className="text-sm font-normal cursor-pointer">
                  Usuario activo (puede acceder al sistema)
                </Label>
              </div>
            </div>
            {/* Empresa y Proyecto obligatorios */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-companyId" className="text-right">
                Empresa
              </Label>
              <Select name="companyId" required defaultValue={user.companyId || ''}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione una empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-projectId" className="text-right">
                Proyecto
              </Label>
              <Select name="projectId" required defaultValue={user.projectId || ''}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione un proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isPending ? 'Actualizando...' : 'Actualizar Usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
