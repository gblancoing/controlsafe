import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationSettings } from './_components/notification-settings';
import { BulkMessageSender } from './_components/bulk-message-sender';
import { DeviationTypesSettings } from './_components/deviation-types-settings';
import { InformacionApp } from './_components/informacion-app';
import { getNotificationPolicies } from './actions';

export default async function ConfiguracionPage() {
  const policiesResult = await getNotificationPolicies();
  const policies = policiesResult.success ? policiesResult.data : [];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>
                Configura las políticas de notificación, causas de desviación en controles preventivos, mensajes masivos e información de la app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="notificaciones" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="notificaciones">Políticas de Notificación</TabsTrigger>
                  <TabsTrigger value="desviaciones">Tipos de desviación</TabsTrigger>
                  <TabsTrigger value="mensajes">Mensajes Masivos</TabsTrigger>
                  <TabsTrigger value="informacion">Información App</TabsTrigger>
                </TabsList>
                <TabsContent value="notificaciones" className="mt-6">
                  <NotificationSettings initialPolicies={policies} />
                </TabsContent>
                <TabsContent value="desviaciones" className="mt-6">
                  <DeviationTypesSettings />
                </TabsContent>
                <TabsContent value="mensajes" className="mt-6">
                  <BulkMessageSender />
                </TabsContent>
                <TabsContent value="informacion" className="mt-6">
                  <InformacionApp />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
