import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { TorqueLog } from '@/components/dashboard/torque-log';

export default async function TorquePage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <TorqueLog />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
