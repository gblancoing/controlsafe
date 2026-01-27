import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Overview } from '@/components/dashboard/overview';
import { MaintenanceSchedule } from '@/components/dashboard/maintenance-schedule';
import { TorqueLog } from '@/components/dashboard/torque-log';
import { PredictiveAdvisor } from '@/components/dashboard/predictive-advisor';
import { FleetOverviewChart } from '@/components/dashboard/fleet-overview-chart';

export default async function Home() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-8">
            <Overview />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <MaintenanceSchedule />
              </div>
              <div className="lg:col-span-1">
                <FleetOverviewChart />
              </div>
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              <TorqueLog />
              <PredictiveAdvisor />
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
