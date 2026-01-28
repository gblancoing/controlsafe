'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Truck,
  Wrench,
  ShieldCheck,
  FileText,
  Users,
  Building,
} from 'lucide-react';
import Link from 'next/link';

const actions = [
  {
    title: 'Registrar Vehículo',
    description: 'Agregar nuevo vehículo a la flota',
    icon: Truck,
    href: '/flota',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Asignar Programa',
    description: 'Asignar programa de mantenimiento',
    icon: Wrench,
    href: '/mantenimiento',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    title: 'Revisar Control',
    description: 'Realizar revisión preventiva',
    icon: ShieldCheck,
    href: '/torque',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Ver Reportes',
    description: 'Generar reportes del sistema',
    icon: FileText,
    href: '/reportes',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'Gestionar Usuarios',
    description: 'Administrar usuarios del sistema',
    icon: Users,
    href: '/usuarios',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    title: 'Nueva Empresa',
    description: 'Registrar nueva empresa',
    icon: Building,
    href: '/empresas',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accesos Rápidos</CardTitle>
        <CardDescription>Acciones frecuentes del sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {actions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-3 hover:bg-accent"
              >
                <div className={`p-2 rounded-lg mr-3 ${action.bgColor}`}>
                  <action.icon className={`h-4 w-4 ${action.color}`} />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
