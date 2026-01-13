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
  { href: '#', icon: LayoutDashboard, label: 'Dashboard', requiredRoles: ['Administrator', 'Supervisor', 'Technician'] },
  { href: '#', icon: Building, label: 'Companies', requiredRoles: ['Administrator'] },
  { href: '#', icon: Map, label: 'Regions', requiredRoles: ['Administrator', 'Supervisor'] },
  { href: '#', icon: MapPin, label: 'Sites', requiredRoles: ['Administrator', 'Supervisor'] },
  { href: '#', icon: Truck, label: 'Fleet', requiredRoles: ['Administrator', 'Supervisor', 'Technician'] },
  { href: '#', icon: Wrench, label: 'Maintenance', requiredRoles: ['Administrator', 'Supervisor', 'Technician'] },
  { href: '#', icon: ShieldCheck, label: 'Torque Control', requiredRoles: ['Administrator', 'Supervisor', 'Technician'] },
  { href: '#', icon: FileText, label: 'Reports', requiredRoles: ['Administrator', 'Supervisor'] },
  { href: '#', icon: Users, label: 'Users', requiredRoles: ['Administrator'] },
  { href: '#', icon: Settings, label: 'Settings', requiredRoles: ['Administrator'] },
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
              isActive={item.label === 'Dashboard'}
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
