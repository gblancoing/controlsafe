'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, Mail, Users, Building2, UserCheck } from 'lucide-react';
import { sendBulkMessage, getUsersForBulkMessage, getCompaniesForBulkMessage, getCurrentUserForBulkMessage } from '../actions';
import { useTransition } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  companyId?: string;
  company?: {
    id: string;
    name: string;
  };
}

interface Company {
  id: string;
  name: string;
  email?: string;
  contactPerson?: string;
}

export function BulkMessageSender() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ total: number; success: number; error: number } | null>(null);

  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    recipientType: 'all' as 'all' | 'companies' | 'users' | 'specific',
    selectedCompanyIds: [] as string[],
    selectedUserIds: [] as string[],
    selectedSpecificIds: [] as string[],
    recipientEmails: '', // correos escritos a mano (usuarios específicos)
  });

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [unauthorized, setUnauthorized] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      setError(null);
      try {
        const currentUserResult = await getCurrentUserForBulkMessage();
        if (!currentUserResult.success) {
          setUnauthorized(true);
          setError(currentUserResult.error ?? 'No autorizado');
          setIsLoadingData(false);
          return;
        }
        setUnauthorized(false);
        setCurrentUserId(currentUserResult.data.id);
        setCurrentUserName(currentUserResult.data.name);

        const [usersResult, companiesResult] = await Promise.all([
          getUsersForBulkMessage(),
          getCompaniesForBulkMessage(),
        ]);

        if (usersResult.success) {
          setUsers(usersResult.data ?? []);
        } else if (usersResult.error) {
          setError(usersResult.error);
        }
        if (companiesResult.success) {
          setCompanies(companiesResult.data ?? []);
        } else if (companiesResult.error && !usersResult.error) {
          setError(companiesResult.error);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error al cargar datos');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentUserId) {
      setError('No se pudo identificar el usuario actual');
      return;
    }

    const parsedEmailsForValidation = formData.recipientEmails
      ? formData.recipientEmails
          .split(/[\n,]+/)
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean)
      : [];

    if (formData.recipientType === 'users') {
      if (
        formData.selectedUserIds.length === 0 &&
        parsedEmailsForValidation.length === 0
      ) {
        setError(
          'Selecciona al menos un usuario de la lista o escribe al menos un correo electrónico.'
        );
        return;
      }
    }
    if (formData.recipientType === 'companies' && formData.selectedCompanyIds.length === 0) {
      setError('Selecciona al menos una empresa.');
      return;
    }

    let recipientIds: string[] = [];

    if (formData.recipientType === 'companies') {
      recipientIds = formData.selectedCompanyIds;
    } else if (formData.recipientType === 'users') {
      recipientIds = formData.selectedUserIds;
    } else if (formData.recipientType === 'specific') {
      recipientIds = formData.selectedSpecificIds;
    }

    const parsedEmails = parsedEmailsForValidation;

    startTransition(async () => {
      const result = await sendBulkMessage({
        subject: formData.subject,
        message: formData.message,
        recipientType: formData.recipientType,
        recipientIds: recipientIds.length > 0 ? recipientIds : undefined,
        recipientEmails: formData.recipientType === 'users' && parsedEmails.length > 0 ? parsedEmails : undefined,
        sentBy: currentUserId,
      });

      if (result.success && result.data) {
        setSuccess({
          total: result.data.totalRecipients,
          success: result.data.successCount,
          error: result.data.errorCount,
        });
        // Limpiar formulario
        setFormData({
          subject: '',
          message: '',
          recipientType: 'all',
          selectedCompanyIds: [],
          selectedUserIds: [],
          selectedSpecificIds: [],
          recipientEmails: '',
        });
      } else {
        setError(result.error || 'Error al enviar el mensaje masivo');
      }
    });
  };

  const toggleCompanySelection = (companyId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCompanyIds: prev.selectedCompanyIds.includes(companyId)
        ? prev.selectedCompanyIds.filter(id => id !== companyId)
        : [...prev.selectedCompanyIds, companyId],
    }));
  };

  const toggleUserSelection = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedUserIds: prev.selectedUserIds.includes(userId)
        ? prev.selectedUserIds.filter(id => id !== userId)
        : [...prev.selectedUserIds, userId],
    }));
  };

  const toggleSpecificSelection = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSpecificIds: prev.selectedSpecificIds.includes(id)
        ? prev.selectedSpecificIds.filter(id2 => id2 !== id)
        : [...prev.selectedSpecificIds, id],
    }));
  };

  if (isLoadingData) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (unauthorized) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Solo Super Admin y Administrador pueden enviar mensajes masivos. Si es Administrador, asegúrese de tener un proyecto asignado para ver empresas y usuarios.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Enviar Mensaje Masivo</h3>
        {currentUserName && (
          <span className="text-sm text-muted-foreground">(Enviando como: {currentUserName})</span>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Mensaje enviado exitosamente. Total: {success.total}, Exitosos: {success.success}, Errores: {success.error}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Destinatarios</CardTitle>
            <CardDescription>Selecciona a quién enviar el mensaje</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="recipientType">Tipo de Destinatario *</Label>
              <Select
                value={formData.recipientType}
                onValueChange={(value: any) => setFormData({ ...formData, recipientType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Todos los usuarios activos
                    </div>
                  </SelectItem>
                  <SelectItem value="companies">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Usuarios de empresas específicas
                    </div>
                  </SelectItem>
                  <SelectItem value="users">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Usuarios específicos
                    </div>
                  </SelectItem>
                  <SelectItem value="specific">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      IDs específicos (usuarios o empresas)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.recipientType === 'companies' && (
              <>
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                  <Label className="mb-3 block">Seleccionar Empresas</Label>
                  <div className="space-y-2">
                    {companies.map((company) => (
                      <div key={company.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`company-${company.id}`}
                          checked={formData.selectedCompanyIds.includes(company.id)}
                          onCheckedChange={() => toggleCompanySelection(company.id)}
                        />
                        <Label
                          htmlFor={`company-${company.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {company.name} {company.email && `(${company.email})`}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {companies.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No hay empresas en su ámbito. Super Admin ve todas; Administrador solo las de su proyecto asignado. Asigne un proyecto con empresas si es Administrador.
                    </p>
                  )}
                </div>
                {formData.selectedCompanyIds.length > 0 && (
                  <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-muted/30">
                    <Label className="mb-3 block">Usuarios que recibirán el mensaje</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Usuarios de las empresas seleccionadas:
                    </p>
                    <div className="space-y-2">
                      {users
                        .filter(
                          (u) =>
                            u.companyId && formData.selectedCompanyIds.includes(u.companyId)
                        )
                        .map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-2 text-sm py-1 border-b border-border/50 last:border-0"
                          >
                            <Mail className="h-3.5 w-3 text-muted-foreground" />
                            {user.name} ({user.email})
                            {user.company && (
                              <span className="text-muted-foreground">— {user.company.name}</span>
                            )}
                          </div>
                        ))}
                    </div>
                    {users.filter(
                      (u) => u.companyId && formData.selectedCompanyIds.includes(u.companyId)
                    ).length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No hay usuarios activos en las empresas seleccionadas.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {formData.recipientType === 'users' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="recipientEmails">Correos electrónicos (opcional)</Label>
                  <Textarea
                    id="recipientEmails"
                    value={formData.recipientEmails}
                    onChange={(e) =>
                      setFormData({ ...formData, recipientEmails: e.target.value })
                    }
                    placeholder="Escribe direcciones de correo, una por línea o separadas por coma. Ej: usuario@ejemplo.com, otro@ejemplo.com"
                    rows={3}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    Añade correos que no estén en la lista de usuarios, o usa solo esta opción.
                  </p>
                </div>
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                  <Label className="mb-3 block">Seleccionar Usuarios</Label>
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={formData.selectedUserIds.includes(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                        />
                        <Label
                          htmlFor={`user-${user.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {user.name} ({user.email}) {user.company && `- ${user.company.name}`}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {users.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No hay usuarios en su ámbito, o puede usar solo los correos de arriba. Super Admin ve todos; Administrador solo los de su proyecto.
                    </p>
                  )}
                </div>
              </>
            )}

            {formData.recipientType === 'specific' && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                  <Label className="mb-3 block">Usuarios</Label>
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`specific-user-${user.id}`}
                          checked={formData.selectedSpecificIds.includes(user.id)}
                          onCheckedChange={() => toggleSpecificSelection(user.id)}
                        />
                        <Label
                          htmlFor={`specific-user-${user.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {user.name} ({user.email})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                  <Label className="mb-3 block">Empresas</Label>
                  <div className="space-y-2">
                    {companies.map((company) => (
                      <div key={company.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`specific-company-${company.id}`}
                          checked={formData.selectedSpecificIds.includes(company.id)}
                          onCheckedChange={() => toggleSpecificSelection(company.id)}
                        />
                        <Label
                          htmlFor={`specific-company-${company.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {company.name} {company.email && `(${company.email})`}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {formData.recipientType === 'all' && (
              <Alert>
                <AlertDescription>
                  El mensaje se enviará a todos los usuarios activos de su ámbito (Super Admin: todo el sistema; Administrador: usuarios de su proyecto).
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contenido del Mensaje</CardTitle>
            <CardDescription>Escribe el asunto y el mensaje que se enviará a los destinatarios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Asunto *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Ej: Recordatorio de Mantenimiento Preventivo"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message">Mensaje *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Escribe el mensaje que se enviará a los destinatarios..."
                rows={8}
                required
              />
              <p className="text-sm text-muted-foreground">
                El mensaje se enviará por correo electrónico a los destinatarios seleccionados.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isPending || !currentUserId}>
            <Send className="mr-2 h-4 w-4" />
            {isPending ? 'Enviando...' : 'Enviar Mensaje Masivo'}
          </Button>
        </div>
      </form>
    </div>
  );
}
