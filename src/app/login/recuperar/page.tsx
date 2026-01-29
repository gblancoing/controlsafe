'use client';

import { useState } from 'react';
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
import { Truck, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { requestPasswordReset } from '../actions';

export default function RecuperarPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await requestPasswordReset(email);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError('Error al procesar la solicitud. Por favor, inténtelo de nuevo.');
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
          <CardTitle className="text-2xl">Recuperar Contraseña</CardTitle>
          <CardDescription className="text-gray-300">
            Ingrese su correo electrónico para recibir un enlace de recuperación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert className="bg-green-900/50 border-green-500/50 text-white">
              <CheckCircle2 className="h-4 w-4 !text-white" />
              <AlertTitle>Correo Enviado</AlertTitle>
              <AlertDescription>
                Si el correo existe en nuestro sistema, recibirá un enlace para restablecer su contraseña.
                Revise su bandeja de entrada y carpeta de spam.
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
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@controlsafe.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
                />
              </div>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/login" className="w-full">
            <Button
              variant="outline"
              className="w-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
