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
import { MoreHorizontal, Eye, Pencil, Trash2, Settings } from 'lucide-react';
import { deleteVehicle } from '../actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { EditVehicleDialog } from './edit-vehicle-dialog';
import { ViewVehicleDialog } from './view-vehicle-dialog';
import type { Vehicle } from '@/lib/types';
import Link from 'next/link';

export function VehicleActions({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteVehicle(vehicle.id);
      if (result.success) {
        // Cerrar el diálogo primero
        setShowDeleteDialog(false);
        // Esperar un momento para que el diálogo se cierre completamente
        setTimeout(() => {
          toast({
            title: 'Vehículo eliminado',
            description: 'El vehículo ha sido eliminado correctamente.',
          });
          router.refresh();
        }, 100);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'No se pudo eliminar el vehículo',
          variant: 'destructive',
        });
        setIsDeleting(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al eliminar el vehículo',
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

  const handleDeleteClick = () => {
    setDropdownOpen(false);
    setShowDeleteDialog(true);
  };

  // Limpiar estado cuando los diálogos se cierran
  useEffect(() => {
    if (!showDeleteDialog && !showEditDialog && !showViewDialog) {
      setIsDeleting(false);
    }
  }, [showDeleteDialog, showEditDialog, showViewDialog]);

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
          <DropdownMenuItem asChild>
            <Link href={`/flota/${vehicle.id}`} onClick={() => setDropdownOpen(false)}>
              <Settings className="mr-2 h-4 w-4" />
              Administrar
            </Link>
          </DropdownMenuItem>
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
              Esta acción no se puede deshacer. Se eliminará permanentemente el vehículo{' '}
              <strong>{vehicle.name}</strong> y todos sus datos asociados.
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

      <EditVehicleDialog
        vehicle={vehicle}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <ViewVehicleDialog
        vehicle={vehicle}
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
      />
    </>
  );
}
