import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCompanies } from './actions';
import { CompaniesTable } from './_components/companies-table';
import { AddCompanyButton } from './_components/add-company-button';

export default async function EmpresasPage() {
  const companies = await getCompanies();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestión de Empresas</CardTitle>
                <CardDescription>Administra las empresas del sistema</CardDescription>
              </div>
              <AddCompanyButton />
            </CardHeader>
            <CardContent>
              <CompaniesTable initialCompanies={companies} />
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
