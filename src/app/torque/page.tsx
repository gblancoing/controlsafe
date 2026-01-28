import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PreventiveControlsList } from './_components/preventive-controls-list';
import { PreventiveControlsCalendar } from './_components/preventive-controls-calendar';
import { PreventiveControlsKanban } from './_components/preventive-controls-kanban';
import { getPreventiveControls } from './actions';

export default async function ControlPreventivoPage() {
  const controls = await getPreventiveControls();
  
  // Debug: Log en el servidor
  console.log(`[Control Preventivo Page] Total controles recibidos: ${controls.length}`);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <Card>
            <CardHeader>
              <CardTitle>Control Preventivo</CardTitle>
              <CardDescription>
                Visualiza y controla los controles preventivos de los vehículos según su programa de revisiones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="lista" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="lista">Lista</TabsTrigger>
                  <TabsTrigger value="calendario">Calendario</TabsTrigger>
                  <TabsTrigger value="kanban">Kanban</TabsTrigger>
                </TabsList>
                <TabsContent value="lista" className="mt-4">
                  <PreventiveControlsList controls={controls} />
                </TabsContent>
                <TabsContent value="calendario" className="mt-4">
                  <PreventiveControlsCalendar controls={controls} />
                </TabsContent>
                <TabsContent value="kanban" className="mt-4">
                  <PreventiveControlsKanban controls={controls} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
