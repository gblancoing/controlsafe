import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { DashboardMetrics } from '@/components/dashboard/dashboard-metrics';
import { CriticalAlerts } from '@/components/dashboard/critical-alerts';
import { DashboardTrends } from '@/components/dashboard/dashboard-trends';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { DeviationsSummaryCard } from '@/components/dashboard/deviations-summary-card';
import {
  getDashboardMetrics,
  getCriticalAlerts,
  getTrendsData,
  getDeviationsSummary,
} from './actions';

export default async function DashboardPage() {
  const [metrics, alerts, trends, deviationsSummary] = await Promise.all([
    getDashboardMetrics(),
    getCriticalAlerts(),
    getTrendsData(),
    getDeviationsSummary(),
  ]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
              <p className="text-muted-foreground mt-2">
                Visión general del estado de la flota y operaciones
              </p>
            </div>

            {/* Métricas Principales */}
            <DashboardMetrics metrics={metrics} />

            {/* Alertas Críticas */}
            {alerts.length > 0 && <CriticalAlerts alerts={alerts} />}

            {/* Grid Principal */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Columna Principal */}
              <div className="lg:col-span-2 space-y-6">
                <DashboardTrends trends={trends} />
                <RecentActivity />
              </div>

              {/* Columna Lateral */}
              <div className="lg:col-span-1 space-y-6">
                <QuickActions />
                <DeviationsSummaryCard summary={deviationsSummary} />
                <DashboardOverview metrics={metrics} />
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
