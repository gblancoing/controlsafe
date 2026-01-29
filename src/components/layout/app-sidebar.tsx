import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { UserNav } from './user-nav';
import { getSessionUserId } from '@/lib/auth';
import { getUserById } from '@/lib/db-queries';
import { Truck } from 'lucide-react';

export async function AppSidebar() {
  try {
    const userId = await getSessionUserId();
    const currentUser = userId
      ? await getUserById(userId)
      : null;
    const displayUser = currentUser ?? {
      id: 'guest',
      name: 'Usuario',
      email: '',
      role: 'Driver' as const,
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
          <SidebarNav currentUser={displayUser} />
        </SidebarContent>
        <SidebarFooter className="p-4">
          <UserNav user={displayUser} />
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
