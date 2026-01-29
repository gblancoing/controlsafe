'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Plus, Pencil, Trash2, Loader, AlertCircle, ClipboardList, AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  getDeviationTypes,
  createDeviationType,
  updateDeviationType,
  deleteDeviationType,
  toggleDeviationTypeVerificationCheck,
} from '@/app/torque/actions-deviations';
import {
  getReviewChecklistTypes,
  createReviewChecklistType,
  updateReviewChecklistType,
  deleteReviewChecklistType,
  toggleReviewChecklistTypeActive,
} from '../actions-review-checklist';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';

type DeviationTypeRow = {
  id: string;
  name: string;
  order: number;
  isPredefined: boolean;
  isVerificationCheck: boolean;
};

type ReviewChecklistRow = {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
};

export function DeviationTypesSettings() {
  const router = useRouter();
  const { toast } = useToast();
  const [reviewItems, setReviewItems] = useState<ReviewChecklistRow[]>([]);
  const [deviationTypes, setDeviationTypes] = useState<DeviationTypeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Revision checklist state
  const [addRevisionOpen, setAddRevisionOpen] = useState(false);
  const [editRevisionOpen, setEditRevisionOpen] = useState(false);
  const [deleteRevisionId, setDeleteRevisionId] = useState<string | null>(null);
  const [newRevisionName, setNewRevisionName] = useState('');
  const [editRevisionId, setEditRevisionId] = useState<string | null>(null);
  const [editRevisionName, setEditRevisionName] = useState('');

  // Deviation types state
  const [addDeviationOpen, setAddDeviationOpen] = useState(false);
  const [editDeviationOpen, setEditDeviationOpen] = useState(false);
  const [deleteDeviationId, setDeleteDeviationId] = useState<string | null>(null);
  const [newDeviationName, setNewDeviationName] = useState('');
  const [editDeviationId, setEditDeviationId] = useState<string | null>(null);
  const [editDeviationName, setEditDeviationName] = useState('');

  const loadAll = async () => {
    setLoading(true);
    const [reviewData, deviationData] = await Promise.all([
      getReviewChecklistTypes(),
      getDeviationTypes(),
    ]);
    setReviewItems(reviewData);
    setDeviationTypes(deviationData);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // --- Check List de revisión ---
  const handleAddRevision = () => {
    setNewRevisionName('');
    setError(null);
    setAddRevisionOpen(true);
  };

  const handleSubmitAddRevision = () => {
    if (!newRevisionName.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    startTransition(async () => {
      const result = await createReviewChecklistType(newRevisionName.trim());
      if (result.error) setError(result.error);
      else {
        setAddRevisionOpen(false);
        toast({ title: 'Ítem agregado', description: 'Se agregó al Check List de revisión.' });
        loadAll();
        router.refresh();
      }
    });
  };

  const handleEditRevision = (row: ReviewChecklistRow) => {
    setEditRevisionId(row.id);
    setEditRevisionName(row.name);
    setError(null);
    setEditRevisionOpen(true);
  };

  const handleSubmitEditRevision = () => {
    if (!editRevisionId || !editRevisionName.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    startTransition(async () => {
      const result = await updateReviewChecklistType(editRevisionId, editRevisionName.trim());
      if (result.error) setError(result.error);
      else {
        setEditRevisionOpen(false);
        setEditRevisionId(null);
        toast({ title: 'Ítem actualizado', description: 'Se actualizó correctamente.' });
        loadAll();
        router.refresh();
      }
    });
  };

  const handleToggleRevisionActive = (row: ReviewChecklistRow, isActive: boolean) => {
    startTransition(async () => {
      const result = await toggleReviewChecklistTypeActive(row.id, isActive);
      if (result.error) toast({ title: 'Error', description: result.error, variant: 'destructive' });
      else {
        setReviewItems((prev) => prev.map((t) => (t.id === row.id ? { ...t, isActive } : t)));
        toast({
          title: isActive ? 'Activo' : 'Inactivo',
          description: isActive ? 'Se mostrará en Revisar Control Preventivo.' : 'No se mostrará en el formulario.',
        });
        router.refresh();
      }
    });
  };

  const handleDeleteRevisionClick = (id: string) => setDeleteRevisionId(id);

  const handleConfirmDeleteRevision = () => {
    if (!deleteRevisionId) return;
    startTransition(async () => {
      const result = await deleteReviewChecklistType(deleteRevisionId);
      if (result.error) toast({ title: 'Error', description: result.error, variant: 'destructive' });
      else {
        toast({ title: 'Ítem eliminado', description: 'Se eliminó del Check List de revisión.' });
        setDeleteRevisionId(null);
        loadAll();
        router.refresh();
      }
    });
  };

  // --- Check List de desviaciones ---
  const handleAddDeviation = () => {
    setNewDeviationName('');
    setError(null);
    setAddDeviationOpen(true);
  };

  const handleSubmitAddDeviation = () => {
    if (!newDeviationName.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    startTransition(async () => {
      const result = await createDeviationType(newDeviationName.trim());
      if (result.error) setError(result.error);
      else {
        setAddDeviationOpen(false);
        toast({ title: 'Causa agregada', description: 'Se agregó al Check List de desviaciones.' });
        loadAll();
        router.refresh();
      }
    });
  };

  const handleEditDeviation = (row: DeviationTypeRow) => {
    setEditDeviationId(row.id);
    setEditDeviationName(row.name);
    setError(null);
    setEditDeviationOpen(true);
  };

  const handleSubmitEditDeviation = () => {
    if (!editDeviationId || !editDeviationName.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    startTransition(async () => {
      const result = await updateDeviationType(editDeviationId, editDeviationName.trim());
      if (result.error) setError(result.error);
      else {
        setEditDeviationOpen(false);
        setEditDeviationId(null);
        toast({ title: 'Causa actualizada', description: 'Se actualizó correctamente.' });
        loadAll();
        router.refresh();
      }
    });
  };

  const handleToggleDeviationActive = (row: DeviationTypeRow, checked: boolean) => {
    startTransition(async () => {
      const result = await toggleDeviationTypeVerificationCheck(row.id, checked);
      if (result.error) toast({ title: 'Error', description: result.error, variant: 'destructive' });
      else {
        setDeviationTypes((prev) =>
          prev.map((t) => (t.id === row.id ? { ...t, isVerificationCheck: checked } : t))
        );
        toast({
          title: checked ? 'Activo' : 'Inactivo',
          description: checked ? 'Se mostrará en Revisar Control Preventivo.' : 'No se mostrará en el formulario.',
        });
        router.refresh();
      }
    });
  };

  const handleDeleteDeviationClick = (id: string) => {
    const row = deviationTypes.find((t) => t.id === id);
    if (row?.isPredefined) return;
    setDeleteDeviationId(id);
  };

  const handleConfirmDeleteDeviation = () => {
    if (!deleteDeviationId) return;
    startTransition(async () => {
      const result = await deleteDeviationType(deleteDeviationId);
      if (result.error) toast({ title: 'Error', description: result.error, variant: 'destructive' });
      else {
        toast({ title: 'Causa eliminada', description: 'Se eliminó del Check List de desviaciones.' });
        setDeleteDeviationId(null);
        loadAll();
        router.refresh();
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <Loader className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        Configure los ítems de ambos check lists del formulario &quot;Revisar Control Preventivo&quot;. Solo los que estén <strong>activos</strong> se mostrarán en el formulario. Solo administradores pueden crear o editar.
      </p>

      {/* Tipo 1: Check List de revisión */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Tipo 1: Check List de revisión
          </h3>
          <Button onClick={handleAddRevision} size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Agregar ítem
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Orden</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="w-36 text-center">Activo (Sí/No)</TableHead>
              <TableHead className="w-32 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviewItems.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-muted-foreground">{row.order + 1}</TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Checkbox
                      id={`rev-active-${row.id}`}
                      checked={row.isActive}
                      onCheckedChange={(c) => handleToggleRevisionActive(row, c === true)}
                      disabled={isPending}
                      title="Activo: se muestra en Revisar Control Preventivo"
                    />
                    <Label htmlFor={`rev-active-${row.id}`} className="text-xs text-muted-foreground cursor-pointer">
                      {row.isActive ? 'Sí' : 'No'}
                    </Label>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditRevision(row)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteRevisionClick(row.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Tipo 2: Check List de desviaciones */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Tipo 2: Check List de desviaciones
          </h3>
          <Button onClick={handleAddDeviation} size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Agregar causa de desviación
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Orden</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="w-24">Tipo</TableHead>
              <TableHead className="w-36 text-center">Activo (Sí/No)</TableHead>
              <TableHead className="w-32 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deviationTypes.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-muted-foreground">{row.order + 1}</TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {row.isPredefined ? 'Predefinido' : 'Personalizado'}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Checkbox
                      id={`dev-active-${row.id}`}
                      checked={row.isVerificationCheck}
                      onCheckedChange={(c) => handleToggleDeviationActive(row, c === true)}
                      disabled={isPending}
                      title="Activo: se muestra en Revisar Control Preventivo"
                    />
                    <Label htmlFor={`dev-active-${row.id}`} className="text-xs text-muted-foreground cursor-pointer">
                      {row.isVerificationCheck ? 'Sí' : 'No'}
                    </Label>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditDeviation(row)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {!row.isPredefined && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteDeviationClick(row.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs Check List de revisión */}
      <Dialog open={addRevisionOpen} onOpenChange={setAddRevisionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar ítem al Check List de revisión</DialogTitle>
            <DialogDescription>
              Este ítem aparecerá en la sección &quot;Check List de Revisión&quot; del formulario Revisar Control Preventivo (si está activo).
            </DialogDescription>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="new-revision-name">Nombre</Label>
            <Input
              id="new-revision-name"
              value={newRevisionName}
              onChange={(e) => setNewRevisionName(e.target.value)}
              placeholder="Ej: Torque, Visual, Luces"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRevisionOpen(false)} disabled={isPending}>Cancelar</Button>
            <Button onClick={handleSubmitAddRevision} disabled={isPending}>
              {isPending ? <Loader className="h-4 w-4 animate-spin" /> : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editRevisionOpen} onOpenChange={setEditRevisionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar ítem del Check List de revisión</DialogTitle>
            <DialogDescription>Modifica el nombre del ítem.</DialogDescription>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="edit-revision-name">Nombre</Label>
            <Input
              id="edit-revision-name"
              value={editRevisionName}
              onChange={(e) => setEditRevisionName(e.target.value)}
              placeholder="Nombre del ítem"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRevisionOpen(false)} disabled={isPending}>Cancelar</Button>
            <Button onClick={handleSubmitEditRevision} disabled={isPending}>
              {isPending ? <Loader className="h-4 w-4 animate-spin" /> : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteRevisionId} onOpenChange={(o) => !o && setDeleteRevisionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar ítem del Check List de revisión?</AlertDialogTitle>
            <AlertDialogDescription>
              Este ítem dejará de estar disponible. Las revisiones ya guardadas no se modifican.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteRevision}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? <Loader className="h-4 w-4 animate-spin" /> : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogs Check List de desviaciones */}
      <Dialog open={addDeviationOpen} onOpenChange={setAddDeviationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar causa de desviación</DialogTitle>
            <DialogDescription>
              Esta causa aparecerá en &quot;Desviaciones detectadas&quot; del formulario Revisar Control Preventivo (si está activa).
            </DialogDescription>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="new-deviation-name">Nombre</Label>
            <Input
              id="new-deviation-name"
              value={newDeviationName}
              onChange={(e) => setNewDeviationName(e.target.value)}
              placeholder="Ej: Falla en sistema de frenos"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDeviationOpen(false)} disabled={isPending}>Cancelar</Button>
            <Button onClick={handleSubmitAddDeviation} disabled={isPending}>
              {isPending ? <Loader className="h-4 w-4 animate-spin" /> : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDeviationOpen} onOpenChange={setEditDeviationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar causa de desviación</DialogTitle>
            <DialogDescription>Modifica el nombre de la causa.</DialogDescription>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="edit-deviation-name">Nombre</Label>
            <Input
              id="edit-deviation-name"
              value={editDeviationName}
              onChange={(e) => setEditDeviationName(e.target.value)}
              placeholder="Nombre de la causa"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDeviationOpen(false)} disabled={isPending}>Cancelar</Button>
            <Button onClick={handleSubmitEditDeviation} disabled={isPending}>
              {isPending ? <Loader className="h-4 w-4 animate-spin" /> : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteDeviationId} onOpenChange={(o) => !o && setDeleteDeviationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar causa de desviación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta causa dejará de aparecer en el formulario. Las revisiones ya guardadas no se modifican.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteDeviation}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? <Loader className="h-4 w-4 animate-spin" /> : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
