import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión - ControlSafe',
  description: 'Accede a ControlSafe - Control Avanzado para la Seguridad Minera',
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
