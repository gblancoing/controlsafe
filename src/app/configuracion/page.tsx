import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationSettings } from './_components/notification-settings';
import { BulkMessageSender } from './_components/bulk-message-sender';
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
                Configura las políticas de notificación y envía mensajes masivos a usuarios y empresas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="notificaciones" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="notificaciones">Políticas de Notificación</TabsTrigger>
                  <TabsTrigger value="mensajes">Mensajes Masivos</TabsTrigger>
                </TabsList>
                <TabsContent value="notificaciones" className="mt-6">
                  <NotificationSettings initialPolicies={policies} />
                </TabsContent>
                <TabsContent value="mensajes" className="mt-6">
                  <BulkMessageSender />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
