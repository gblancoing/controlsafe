import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUsers } from './actions';
import { UsersTable } from './_components/users-table';
import { AddUserButton } from './_components/add-user-button';
import { CompanyFilter } from './_components/company-filter';

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  const params = await searchParams;
  const companyId = params.company || undefined;
  const users = await getUsers(companyId);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Usuarios</CardTitle>
                <CardDescription>Gestión de usuarios del sistema</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <CompanyFilter initialCompanyId={companyId} />
                <AddUserButton />
              </div>
            </CardHeader>
            <CardContent>
              <UsersTable users={users} />
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
