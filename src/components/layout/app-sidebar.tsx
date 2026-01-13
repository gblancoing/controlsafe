import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { UserNav } from './user-nav';
import { mockUsers } from '@/lib/data';
import { Truck } from 'lucide-react';

export function AppSidebar() {
  const currentUser = mockUsers[2]; // Simulating a 'Technician' user

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-10 rounded-lg bg-primary text-primary-foreground">
                <Truck className="size-6" />
            </div>
            <h1 className="text-xl font-semibold font-headline text-primary">
              ControlSafe
            </h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarNav currentUser={currentUser} />
      </SidebarContent>
      <SidebarFooter className="p-4">
        <UserNav user={mockUsers[0]} />
      </SidebarFooter>
    </Sidebar>
  );
}
