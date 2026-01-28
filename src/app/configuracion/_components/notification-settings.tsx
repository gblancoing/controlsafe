'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Bell } from 'lucide-react';
import { saveNotificationPolicy, deleteNotificationPolicy } from '../actions';
import { useTransition } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface NotificationPolicy {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  metricType: string;
  daysBefore: number;
  emailTemplate?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationSettingsProps {
  initialPolicies: NotificationPolicy[];
}

const METRIC_TYPES = [
  { value: 'maintenance_due', label: 'Mantenimiento Preventivo por Vencer' },
  { value: 'document_expiry', label: 'Documentos por Vencer' },
  { value: 'vehicle_inspection', label: 'Inspección de Vehículo' },
  { value: 'license_renewal', label: 'Renovación de Licencia' },
];

export function NotificationSettings({ initialPolicies }: NotificationSettingsProps) {
  const [policies, setPolicies] = useState<NotificationPolicy[]>(initialPolicies);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<NotificationPolicy | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabled: true,
    metricType: 'maintenance_due',
    daysBefore: 7,
    emailTemplate: '',
  });

  const handleOpenDialog = (policy?: NotificationPolicy) => {
    if (policy) {
      setEditingPolicy(policy);
      setFormData({
        name: policy.name,
        description: policy.description || '',
        enabled: policy.enabled,
        metricType: policy.metricType,
        daysBefore: policy.daysBefore,
        emailTemplate: policy.emailTemplate || '',
      });
    } else {
      setEditingPolicy(null);
      setFormData({
        name: '',
        description: '',
        enabled: true,
        metricType: 'maintenance_due',
        daysBefore: 7,
        emailTemplate: '',
      });
    }
    setIsDialogOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPolicy(null);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await saveNotificationPolicy({
        ...formData,
        id: editingPolicy?.id,
      });

      if (result.success) {
        setSuccess('Política guardada exitosamente');
        if (editingPolicy) {
          setPolicies(policies.map(p => p.id === editingPolicy.id ? result.data : p));
        } else {
          setPolicies([...policies, result.data]);
        }
        setTimeout(() => {
          handleCloseDialog();
        }, 1000);
      } else {
        setError(result.error || 'Error al guardar la política');
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta política de notificación?')) {
      return;
    }

    startTransition(async () => {
      const result = await deleteNotificationPolicy(id);
      if (result.success) {
        setPolicies(policies.filter(p => p.id !== id));
        setSuccess('Política eliminada exitosamente');
      } else {
        setError(result.error || 'Error al eliminar la política');
      }
    });
  };

  const handleToggleEnabled = async (policy: NotificationPolicy) => {
    startTransition(async () => {
      const result = await saveNotificationPolicy({
        ...policy,
        enabled: !policy.enabled,
      });

      if (result.success) {
        setPolicies(policies.map(p => p.id === policy.id ? result.data : p));
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Políticas de Notificación</h3>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Política
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo de Métrica</TableHead>
              <TableHead>Días Antes</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay políticas de notificación configuradas
                </TableCell>
              </TableRow>
            ) : (
              policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">{policy.name}</TableCell>
                  <TableCell>
                    {METRIC_TYPES.find(m => m.value === policy.metricType)?.label || policy.metricType}
                  </TableCell>
                  <TableCell>{policy.daysBefore} días</TableCell>
                  <TableCell>
                    <Switch
                      checked={policy.enabled}
                      onCheckedChange={() => handleToggleEnabled(policy)}
                      disabled={isPending}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(policy)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(policy.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPolicy ? 'Editar Política' : 'Nueva Política de Notificación'}
            </DialogTitle>
            <DialogDescription>
              Configura una política de notificación para alertar a los usuarios sobre eventos importantes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre de la Política *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Flota por vencer"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción de la política de notificación"
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="metricType">Tipo de Métrica *</Label>
                <Select
                  value={formData.metricType}
                  onValueChange={(value) => setFormData({ ...formData, metricType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {METRIC_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="daysBefore">Días Antes del Evento *</Label>
                <Input
                  id="daysBefore"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.daysBefore}
                  onChange={(e) => setFormData({ ...formData, daysBefore: parseInt(e.target.value) || 7 })}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Número de días antes del evento para enviar la notificación
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                />
                <Label htmlFor="enabled">Política habilitada</Label>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="emailTemplate">Plantilla de Email (Opcional)</Label>
                <Textarea
                  id="emailTemplate"
                  value={formData.emailTemplate}
                  onChange={(e) => setFormData({ ...formData, emailTemplate: e.target.value })}
                  placeholder="Plantilla HTML para el email. Puede usar variables como {{nombre}}, {{vehiculo}}, {{fecha}}"
                  rows={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Guardando...' : editingPolicy ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
