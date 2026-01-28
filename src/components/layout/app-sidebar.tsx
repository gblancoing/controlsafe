import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { UserNav } from './user-nav';
import { getUsers } from '@/lib/db-queries';
import { Truck } from 'lucide-react';

export async function AppSidebar() {
  try {
    const users = await getUsers();
    // Buscar un usuario Administrator, si no existe usar el primero disponible
    const currentUser = users.find(u => u.role === 'Administrator') || users[0] || {
      id: 'admin',
      name: 'Administrador',
      email: 'admin@controlsafe.com',
      role: 'Administrator' as const,
    };
    const footerUser = users[0] || currentUser;

    return (
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-10 rounded-lg bg-primary text-primary-foreground">
                  <Truck className="size-6" />
              </div>
              <h1 className="text-xl font-semibold font-headline text-primary group-data-[collapsible=icon]:hidden">
                ControlSafe
              </h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav currentUser={currentUser} />
        </SidebarContent>
        <SidebarFooter className="p-4">
          <UserNav user={footerUser} />
        </SidebarFooter>
      </Sidebar>
    );
  } catch (error) {
    // Si hay un error al cargar usuarios, usar un usuario por defecto
    const defaultUser = {
      id: 'admin',
      name: 'Administrador',
      email: 'admin@controlsafe.com',
      role: 'Administrator' as const,
    };

    return (
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-10 rounded-lg bg-primary text-primary-foreground">
                  <Truck className="size-6" />
              </div>
              <h1 className="text-xl font-semibold font-headline text-primary group-data-[collapsible=icon]:hidden">
                ControlSafe
              </h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav currentUser={defaultUser} />
        </SidebarContent>
        <SidebarFooter className="p-4">
          <UserNav user={defaultUser} />
        </SidebarFooter>
      </Sidebar>
    );
  }
}
