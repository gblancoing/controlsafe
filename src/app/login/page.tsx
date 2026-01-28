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
import { Truck, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@controlsafe.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Intentar autenticación con Firebase
      await signInWithEmailAndPassword(auth, email, password);
      // Si la autenticación es exitosa, redirigir al dashboard
      router.push('/dashboard');
    } catch (error: any) {
      // Si Firebase no está configurado o hay error, permitir acceso básico
      // En producción, esto debería validarse correctamente
      if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/user-not-found') {
        setError('Credenciales inválidas. Por favor, inténtelo de nuevo.');
      } else if (error?.code === 'auth/network-request-failed' || error?.message?.includes('Firebase')) {
        // Si Firebase no está configurado, permitir acceso básico para desarrollo
        console.warn('Firebase no configurado, permitiendo acceso básico');
        router.push('/dashboard');
      } else {
        setError('Error al iniciar sesión. Por favor, inténtelo de nuevo.');
        console.error("Error de autenticación:", error);
      }
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
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Acceder a ControlSafe</CardTitle>
            <CardDescription className="text-gray-300">
              Ingrese sus credenciales para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {error && (
               <Alert variant="destructive" className="bg-red-900/50 border-red-500/50 text-white">
                <AlertTriangle className="h-4 w-4 !text-white" />
                <AlertTitle>Error de Acceso</AlertTitle>
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
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link 
                  href="/login/recuperar" 
                  className="text-xs text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                autoComplete="current-password"
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="bg-gray-800/50 border-gray-600 text-white focus:border-primary"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? 'Accediendo...' : 'Acceder'}
            </Button>
            <p className="text-xs text-center text-gray-400">
                Al iniciar sesión, aceptas nuestros{' '}
                <Link href="#" className="underline hover:text-white">
                    Términos de Servicio
                </Link>{' '}
                y{' '}
                <Link href="#" className="underline hover:text-white">
                    Política de Privacidad
                </Link>
                .
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
