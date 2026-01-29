'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Eye, Pencil, Trash2, Car } from 'lucide-react';
import { deleteUser } from '../actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { EditUserDialog } from './edit-user-dialog';
import { ViewUserDialog } from './view-user-dialog';
import { AssignVehiclesDialog } from './assign-vehicles-dialog';

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  canDrive?: boolean;
  companyId?: string;
  companyName?: string;
  projectName?: string;
  vehicles: Array<{ id: string; name: string; patent?: string }>;
};

export function UserActions({ user }: { user: User }) {
  const router = useRouter();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteUser(user.id);
      if (result.success) {
        setShowDeleteDialog(false);
        setTimeout(() => {
          toast({
            title: 'Usuario eliminado',
            description: 'El usuario ha sido eliminado correctamente.',
          });
          router.refresh();
        }, 150);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'No se pudo eliminar el usuario',
          variant: 'destructive',
        });
        setIsDeleting(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al eliminar el usuario',
        variant: 'destructive',
      });
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleViewClick = () => {
    setDropdownOpen(false);
    setShowViewDialog(true);
  };

  const handleEditClick = () => {
    setDropdownOpen(false);
    setShowEditDialog(true);
  };

  const handleAssignClick = () => {
    setDropdownOpen(false);
    setShowAssignDialog(true);
  };

  const handleDeleteClick = () => {
    setDropdownOpen(false);
    setShowDeleteDialog(true);
  };

  useEffect(() => {
    if (!showDeleteDialog && !showEditDialog && !showViewDialog && !showAssignDialog) {
      setIsDeleting(false);
    }
  }, [showDeleteDialog, showEditDialog, showViewDialog, showAssignDialog]);

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleViewClick}>
            <Eye className="mr-2 h-4 w-4" />
            Ver detalles
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEditClick}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          {user.role === 'Driver' && (
            <DropdownMenuItem onClick={handleAssignClick}>
              <Car className="mr-2 h-4 w-4" />
              Asignar Vehículos
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDeleteClick}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setShowDeleteDialog(open);
            if (!open) {
              setIsDeleting(false);
            }
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{' '}
              <strong>{user.name}</strong> y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={() => {
                if (!isDeleting) {
                  setShowDeleteDialog(false);
                  setIsDeleting(false);
                }
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditUserDialog
        user={user}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <ViewUserDialog
        user={user}
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
      />

      {user.role === 'Driver' && (
        <AssignVehiclesDialog
          user={user}
          open={showAssignDialog}
          onOpenChange={setShowAssignDialog}
        />
      )}
    </>
  );
}
