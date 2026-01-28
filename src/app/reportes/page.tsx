import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComplianceReportCard } from './_components/compliance-report-card';
import { FleetStatusReportCard } from './_components/fleet-status-report-card';
import { ProgramUtilizationReportCard } from './_components/program-utilization-report-card';
import { ReviewsReportCard } from './_components/reviews-report-card';
import {
  getComplianceReport,
  getFleetStatusReport,
  getProgramUtilizationReport,
  getReviewsReport,
} from './actions';

export default async function ReportesPage() {
  const [complianceReport, fleetStatusReport, programUtilizationReport, reviewsReport] =
    await Promise.all([
      getComplianceReport(),
      getFleetStatusReport(),
      getProgramUtilizationReport(),
      getReviewsReport(),
    ]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
              <p className="text-muted-foreground mt-2">
                Generación y visualización de reportes automáticos del sistema.
              </p>
            </div>

            <Tabs defaultValue="cumplimiento" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="cumplimiento">Cumplimiento</TabsTrigger>
                <TabsTrigger value="flota">Estado de Flota</TabsTrigger>
                <TabsTrigger value="programas">Programas</TabsTrigger>
                <TabsTrigger value="revisiones">Revisiones</TabsTrigger>
              </TabsList>

              <TabsContent value="cumplimiento" className="mt-4">
                <ComplianceReportCard report={complianceReport} />
              </TabsContent>

              <TabsContent value="flota" className="mt-4">
                <FleetStatusReportCard report={fleetStatusReport} />
              </TabsContent>

              <TabsContent value="programas" className="mt-4">
                <ProgramUtilizationReportCard report={programUtilizationReport} />
              </TabsContent>

              <TabsContent value="revisiones" className="mt-4">
                <ReviewsReportCard report={reviewsReport} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
