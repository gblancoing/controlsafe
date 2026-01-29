/**
 * Fuente única de verdad para rutas protegidas y roles.
 * Define qué rutas puede ver/operar cada rol. Usado por:
 * - sidebar-nav (menú lateral)
 * - middleware (bloqueo por URL)
 */

import type { LucideIcon } from 'lucide-react';
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

export const PATH_REQUIRED_ROLES: Record<string, string[]> = {
  '/dashboard': ['SuperAdmin', 'Administrator', 'Supervisor', 'Technician'],
  '/empresas': ['SuperAdmin', 'Administrator'],
  '/faenas': ['SuperAdmin', 'Administrator', 'Supervisor'],
  '/flota': ['SuperAdmin', 'Administrator', 'Supervisor', 'Technician'],
  '/mantenimiento': ['SuperAdmin', 'Administrator', 'Supervisor', 'Technician'],
  '/torque': ['SuperAdmin', 'Administrator', 'Supervisor', 'Technician'],
  '/historial': ['SuperAdmin', 'Administrator', 'Supervisor', 'Technician'],
  '/reportes': ['SuperAdmin', 'Administrator', 'Supervisor', 'Technician', 'Driver'],
  '/perfil': ['SuperAdmin', 'Administrator', 'Supervisor', 'Technician', 'Driver'],
  '/usuarios': ['SuperAdmin', 'Administrator'],
  '/acl': ['SuperAdmin', 'Administrator'],
  '/configuracion': ['SuperAdmin', 'Administrator'],
  '/regiones': ['SuperAdmin', 'Administrator'],
};

/** Rutas ordenadas para el menú lateral (solo las que tienen entrada en PATH_REQUIRED_ROLES). */
export const NAV_ITEMS: Array<{
  href: string;
  icon: LucideIcon;
  label: string;
  requiredRoles: string[];
}> = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Panel de Control', requiredRoles: PATH_REQUIRED_ROLES['/dashboard']! },
  { href: '/empresas', icon: Building, label: 'Empresas', requiredRoles: PATH_REQUIRED_ROLES['/empresas']! },
  { href: '/faenas', icon: MapPin, label: 'Proyectos', requiredRoles: PATH_REQUIRED_ROLES['/faenas']! },
  { href: '/flota', icon: Truck, label: 'Flota', requiredRoles: PATH_REQUIRED_ROLES['/flota']! },
  { href: '/mantenimiento', icon: Wrench, label: 'Mantenimiento', requiredRoles: PATH_REQUIRED_ROLES['/mantenimiento']! },
  { href: '/torque', icon: ShieldCheck, label: 'Control Preventivo', requiredRoles: PATH_REQUIRED_ROLES['/torque']! },
  { href: '/historial', icon: History, label: 'Historial', requiredRoles: PATH_REQUIRED_ROLES['/historial']! },
  { href: '/reportes', icon: FileText, label: 'Reportes', requiredRoles: PATH_REQUIRED_ROLES['/reportes']! },
  { href: '/usuarios', icon: Users, label: 'Usuarios', requiredRoles: PATH_REQUIRED_ROLES['/usuarios']! },
  { href: '/acl', icon: Key, label: 'Roles y Permisos', requiredRoles: PATH_REQUIRED_ROLES['/acl']! },
  { href: '/configuracion', icon: Settings, label: 'Configuración', requiredRoles: PATH_REQUIRED_ROLES['/configuracion']! },
];

/** Comprueba si el pathname está permitido para el rol. Compara por prefijo. */
export function isPathAllowedForRole(pathname: string, role: string): boolean {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  for (const [prefix, roles] of Object.entries(PATH_REQUIRED_ROLES)) {
    if (normalized === prefix || normalized.startsWith(prefix + '/')) {
      return roles.includes(role);
    }
  }
  return false;
}

/** Ruta por defecto a la que redirigir si el rol no tiene acceso. Driver -> reportes; resto -> dashboard. */
export function getDefaultRedirectForRole(role: string): string {
  return role === 'Driver' ? '/reportes' : '/dashboard';
}
