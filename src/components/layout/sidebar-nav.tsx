'use client';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import type { User } from '@/lib/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Truck,
  Wrench,
  ShieldCheck,
  Users,
  Settings,
  FileText,
  Building,
  MapPin,
  Key,
  History,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Panel de Control', requiredRoles: ['Administrator', 'Supervisor', 'Technician'] },
  { href: '/empresas', icon: Building, label: 'Empresas', requiredRoles: ['Administrator'] },
  { href: '/faenas', icon: MapPin, label: 'Proyectos', requiredRoles: ['Administrator', 'Supervisor'] },
  { href: '/flota', icon: Truck, label: 'Flota', requiredRoles: ['Administrator', 'Supervisor', 'Technician'] },
  { href: '/mantenimiento', icon: Wrench, label: 'Mantenimiento', requiredRoles: ['Administrator', 'Supervisor', 'Technician'] },
  { href: '/torque', icon: ShieldCheck, label: 'Control Preventivo', requiredRoles: ['Administrator', 'Supervisor', 'Technician'] },
  { href: '/historial', icon: History, label: 'Historial', requiredRoles: ['Administrator', 'Supervisor', 'Technician'] },
  { href: '/reportes', icon: FileText, label: 'Reportes', requiredRoles: ['Administrator', 'Supervisor'] },
  { href: '/usuarios', icon: Users, label: 'Usuarios', requiredRoles: ['Administrator'] },
  { href: '/acl', icon: Key, label: 'Roles y Permisos', requiredRoles: ['Administrator'] },
  { href: '/configuracion', icon: Settings, label: 'Configuración', requiredRoles: ['Administrator'] },
];

export function SidebarNav({ currentUser }: { currentUser: User }) {
  const pathname = usePathname();
  const hasRole = (roles: string[]) => roles.includes(currentUser.role);

  return (
    <SidebarMenu>
      {navItems.map((item) =>
        hasRole(item.requiredRoles) ? (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : null
      )}
    </SidebarMenu>
  );
}
