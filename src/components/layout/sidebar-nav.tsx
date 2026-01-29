'use client';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import type { User } from '@/lib/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/acl-routes';

export function SidebarNav({ currentUser }: { currentUser: User }) {
  const pathname = usePathname();
  const hasRole = (roles: string[]) => roles.includes(currentUser.role);

  return (
    <SidebarMenu>
      {NAV_ITEMS.map((item) =>
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
