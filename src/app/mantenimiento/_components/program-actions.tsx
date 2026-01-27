'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteMaintenanceProgram } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { ViewProgramDialog } from './view-program-dialog';
import { EditProgramDialog } from './edit-program-dialog';

type MaintenanceProgram = {
  id: string;
  name: string;
  description?: string;
  applicableVehicleType?: string;
  frequencyValue: number;
  frequencyUnit: string;
};

export function ProgramActions({ program }: { program: MaintenanceProgram }) {
  const router = useRouter();
  const { toast } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    setShowDeleteDialog(false);
    setDropdownOpen(false);

    const result = await deleteMaintenanceProgram(program.id);

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
      setIsDeleting(false);
    } else {
      setTimeout(() => {
        toast({
          title: 'Programa Eliminado',
          description: `El programa "${program.name}" ha sido eliminado.`,
        });
        router.refresh();
        setIsDeleting(false);
      }, 100);
    }
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isDeleting}>
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              setDropdownOpen(false);
              setShowViewDialog(true);
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver Ficha
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setDropdownOpen(false);
              setShowEditDialog(true);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => {
              setDropdownOpen(false);
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el programa
              &quot;{program.name}&quot; y todas sus tareas asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ViewProgramDialog
        program={program}
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
      />

      <EditProgramDialog
        program={program}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
}
