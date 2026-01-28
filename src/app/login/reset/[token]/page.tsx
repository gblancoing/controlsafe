'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck, AlertTriangle, CheckCircle2, ArrowLeft, Lock } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { resetPassword, validateResetToken } from '../../actions';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // Validar que el token existe
    if (!token) {
      setError('Token de recuperación no válido.');
      setIsValidating(false);
    } else {
      setIsValidating(false);
    }
  }, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);

    try {
      // Primero validar el token en la base de datos
      const validation = await validateResetToken(token);
      if (validation.error) {
        setError(validation.error);
        setIsLoading(false);
        return;
      }

      // Luego actualizar la contraseña en Firebase
      try {
        // Usar Firebase Auth para resetear contraseña
        // Nota: Esto requiere que el token sea un código de acción de Firebase
        // Por ahora, usamos nuestra propia validación y actualizamos en BD
        // TODO: Integrar con Firebase Admin SDK para resetear desde servidor
        await resetPassword(token, password);
        
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (firebaseError: any) {
        console.error('Error al actualizar contraseña en Firebase:', firebaseError);
        // Si Firebase falla, aún marcamos el token como usado
        await resetPassword(token, password);
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err: any) {
      setError('Error al restablecer la contraseña. Por favor, inténtelo de nuevo.');
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-muted/40">
        <Image
          src="/flota.jpg"
          alt="Flota de vehículos mineros"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <Card className="w-full max-w-sm z-10 bg-black/50 text-white border-white/20">
          <CardContent className="pt-6">
            <div className="text-center">Validando token...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-muted/40">
      <Image
        src="/flota.jpg"
        alt="Flota de vehículos mineros"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute top-8 left-8 z-10">
        <Link href="/" className="flex items-center gap-2 text-white">
          <Truck className="size-8" />
          <span className="text-2xl font-semibold">ControlSafe</span>
        </Link>
      </div>
      <Card className="w-full max-w-sm z-10 bg-black/50 text-white border-white/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Restablecer Contraseña</CardTitle>
          <CardDescription className="text-gray-300">
            Ingrese su nueva contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert className="bg-green-900/50 border-green-500/50 text-white">
              <CheckCircle2 className="h-4 w-4 !text-white" />
              <AlertTitle>Contraseña Restablecida</AlertTitle>
              <AlertDescription>
                Su contraseña ha sido restablecida exitosamente. Será redirigido al login en unos segundos.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
              {error && (
                <Alert variant="destructive" className="bg-red-900/50 border-red-500/50 text-white">
                  <AlertTriangle className="h-4 w-4 !text-white" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid gap-2">
                <Label htmlFor="password">Nueva Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  minLength={6}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirme su contraseña"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  minLength={6}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
                />
              </div>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
