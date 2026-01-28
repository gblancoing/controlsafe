import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HistoryContent } from './_components/history-content';
import { PendingControlsContent } from './_components/pending-controls-content';
import { getHistoryReviews, getPendingControls, getAllCompanies, getAllProjects } from './actions';

export default async function HistorialPage({
  searchParams,
}: {
  searchParams: { company?: string; project?: string };
}) {
  const companyId = searchParams.company;
  const projectId = searchParams.project;

  const [reviews, pendingControls, companies, projects] = await Promise.all([
    getHistoryReviews(companyId, projectId),
    getPendingControls(companyId, projectId),
    getAllCompanies(),
    getAllProjects(),
  ]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Controles Preventivos</CardTitle>
              <CardDescription>
                Visualiza el historial de revisiones y la programación pendiente por empresa y proyecto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="historial" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="historial">Historial de Revisiones</TabsTrigger>
                  <TabsTrigger value="pendientes">Programación Pendiente</TabsTrigger>
                </TabsList>
                <TabsContent value="historial" className="mt-4">
                  <HistoryContent
                    reviews={reviews}
                    companies={companies}
                    projects={projects}
                    initialCompanyId={companyId}
                    initialProjectId={projectId}
                  />
                </TabsContent>
                <TabsContent value="pendientes" className="mt-4">
                  <PendingControlsContent
                    pendingControls={pendingControls}
                    companies={companies}
                    projects={projects}
                    initialCompanyId={companyId}
                    initialProjectId={projectId}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
