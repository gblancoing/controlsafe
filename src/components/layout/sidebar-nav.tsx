'use client';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import type { User } from '@/lib/types';
import {
  LayoutDashboard,
  Truck,
  Wrench,
  ShieldCheck,
  Users,
  Settings,
  FileText,
  Building,
  Map,
  MapPin,
} from 'lucide-react';

const navItems = [
  { href: '#', icon: LayoutDashboard, label: 'Panel de Control', requiredRoles: ['Administrator', 'Supervisor', 'Technician'] },
  { href: '#', icon: Building, label: 'Empresas', requiredRoles: ['Administrator'] },
  { href: '#', icon: Map, label: 'Regiones', requiredRoles: ['Administrator', 'Supervisor'] },
  { href: '#', icon: MapPin, label: 'Faenas', requiredRoles: ['Administrator', 'Supervisor'] },
  { href: '#', icon: Truck, label: 'Flota', requiredRoles: ['Administrator', 'Supervisor', 'Technician'] },
  { href: '#', icon: Wrench, label: 'Mantenimiento', requiredRoles: ['Administrator', 'Supervisor', 'Technician'] },
  { href: '#', icon: ShieldCheck, label: 'Control de Torque', requiredRoles: ['Administrator', 'Supervisor', 'Technician'] },
  { href: '#', icon: FileText, label: 'Reportes', requiredRoles: ['Administrator', 'Supervisor'] },
  { href: '#', icon: Users, label: 'Usuarios', requiredRoles: ['Administrator'] },
  { href: '#', icon: Settings, label: 'Configuración', requiredRoles: ['Administrator'] },
];

export function SidebarNav({ currentUser }: { currentUser: User }) {
  const hasRole = (roles: string[]) => roles.includes(currentUser.role);

  return (
    <SidebarMenu>
      {navItems.map((item) =>
        hasRole(item.requiredRoles) ? (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              href={item.href}
              isActive={item.label === 'Panel de Control'}
              tooltip={item.label}
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : null
      )}
    </SidebarMenu>
  );
}
