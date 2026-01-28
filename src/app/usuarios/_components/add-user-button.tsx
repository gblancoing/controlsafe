'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
import { PlusCircle, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { createUser, getAllCompanies, getAllProjects } from '../actions';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export function AddUserButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [role, setRole] = useState<string>('');
  const { toast } = useToast();

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setError(null);
      setRole('');
      const [companiesList, projectsList] = await Promise.all([
        getAllCompanies(),
        getAllProjects(),
      ]);
      setCompanies(companiesList);
      setProjects(projectsList);
    }
  };

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

    if (selectedRole === 'Driver' && (!companyId || companyId === '__none__')) {
      setError('Los choferes deben pertenecer a una empresa.');
      return;
    }

    // Normalizar companyId: si es "__none__" o vacío, usar undefined
    const finalCompanyId = companyId && companyId !== '__none__' ? companyId : undefined;
    // Normalizar projectId: si es "__none__" o vacío, usar undefined
    const finalProjectId = projectId && projectId !== '__none__' ? projectId : undefined;

    startTransition(async () => {
      // Primero crear el usuario en Firebase Authentication
      try {
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (firebaseError: any) {
        if (firebaseError?.code === 'auth/email-already-in-use') {
          setError(`El email "${email}" ya está registrado en el sistema.`);
          return;
        } else if (firebaseError?.code === 'auth/weak-password') {
          setError('La contraseña es muy débil. Use al menos 6 caracteres.');
          return;
        } else if (firebaseError?.code === 'auth/invalid-email') {
          setError('El email proporcionado no es válido.');
          return;
        } else {
          // Si Firebase no está configurado, continuar de todas formas
          console.warn('Error al crear usuario en Firebase (puede que no esté configurado):', firebaseError);
          // Continuar con la creación en la base de datos
        }
      }

      // Luego crear el usuario en la base de datos
      const result = await createUser({
        name,
        email,
        password,
        phone: phone || undefined,
        role: selectedRole as 'Administrator' | 'Supervisor' | 'Technician' | 'Driver',
        canDrive,
        isActive,
        companyId: finalCompanyId,
        projectId: finalProjectId,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setTimeout(() => {
          toast({
            title: 'Usuario Registrado',
            description: `El usuario ${name} ha sido registrado con éxito.`,
          });
          router.refresh();
        }, 100);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Añadir Usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Complete los detalles para agregar un nuevo usuario al sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error al registrar usuario</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                name="name"
                required
                className="col-span-3"
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="col-span-3"
                placeholder="Ej: juan@example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Celular
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                className="col-span-3"
                placeholder="Ej: +56 9 1234 5678"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="col-span-3"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Rol
              </Label>
              <Select
                name="role"
                required
                value={role}
                onValueChange={setRole}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrator">Administrador</SelectItem>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                  <SelectItem value="Technician">Técnico</SelectItem>
                  <SelectItem value="Driver">Chofer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="canDrive" className="text-right">
                Habilitado para conducir
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox id="canDrive" name="canDrive" />
                <Label htmlFor="canDrive" className="text-sm font-normal cursor-pointer">
                  El usuario está habilitado para conducir vehículos
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                Estado del Usuario
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox id="isActive" name="isActive" defaultChecked={true} />
                <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
                  Usuario activo (puede acceder al sistema)
                </Label>
              </div>
            </div>
            {/* Campo de Empresa - siempre visible */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companyId" className="text-right">
                Empresa {role === 'Driver' ? '' : '(Opcional)'}
              </Label>
              <Select name="companyId" required={role === 'Driver'}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={
                    role === 'Driver' 
                      ? "Seleccione una empresa" 
                      : "Seleccione una empresa (opcional)"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {role !== 'Driver' && (
                    <SelectItem value="__none__">Sin empresa</SelectItem>
                  )}
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Campo de Proyecto - siempre visible */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectId" className="text-right">
                Proyecto (Opcional)
              </Label>
              <Select name="projectId">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione un proyecto (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin proyecto</SelectItem>
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
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isPending ? 'Registrando...' : 'Registrar Usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
