'use client';

import { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Mail,
  Building2,
  FolderKanban,
  Phone,
  Camera,
  Loader2,
} from 'lucide-react';
import type { ProfileUser } from '../actions';
import { updateUserAvatar } from '../actions';

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    SuperAdmin: 'Super Admin',
    Administrator: 'Administrador',
    Supervisor: 'Supervisor',
    Technician: 'Técnico',
    Driver: 'Chofer',
  };
  return labels[role] ?? role;
}

function getRoleVariant(role: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (role) {
    case 'SuperAdmin':
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
}

function getInitials(name: string) {
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function ProfileCard({ profile }: { profile: ProfileUser }) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(profile.avatarUrl);
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.set('avatar', file);
    const result = await updateUserAvatar(formData);
    setUploading(false);
    e.target.value = '';
    if (result.success && result.avatarUrl) {
      setAvatarUrl(result.avatarUrl);
      toast({ title: 'Foto actualizada', description: 'Tu foto de perfil se actualizó correctamente.' });
    } else {
      toast({
        title: 'Error',
        description: result.error ?? 'No se pudo subir la foto.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/40 pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={avatarUrl} alt={profile.name} />
              <AvatarFallback className="text-2xl">{getInitials(profile.name)}</AvatarFallback>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={uploading}
            />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5" />
              {profile.name}
            </CardTitle>
            <CardDescription className="mt-1">{profile.email}</CardDescription>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant={getRoleVariant(profile.role)}>
                {getRoleLabel(profile.role)}
              </Badge>
              {profile.canDrive && (
                <Badge variant="default" className="bg-green-600">Habilitado para conducir</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground mb-4">
          Información principal según tu rol y asignación en la plataforma.
        </p>
        <Separator className="mb-4" />
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Correo electrónico</p>
              <p className="text-sm text-muted-foreground break-all">{profile.email}</p>
            </div>
          </div>
          {profile.phone && (
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">Celular</p>
                <p className="text-sm text-muted-foreground">{profile.phone}</p>
              </div>
            </div>
          )}
          {profile.companyName && (
            <div className="flex items-start gap-3">
              <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">Empresa</p>
                <p className="text-sm text-muted-foreground">{profile.companyName}</p>
              </div>
            </div>
          )}
          {profile.projectName && (
            <div className="flex items-start gap-3">
              <FolderKanban className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">Proyecto</p>
                <p className="text-sm text-muted-foreground">{profile.projectName}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
