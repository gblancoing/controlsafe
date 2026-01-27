import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getProjects, getMandanteCompanies } from './actions';
import { ProjectsTable } from './_components/projects-table';
import { AddProjectButton } from './_components/add-project-button';

export default async function FaenasPage() {
  const projects = await getProjects();
  const mandanteCompanies = await getMandanteCompanies();
  
  // Crear mapa de empresas para búsqueda rápida
  const companiesMap: Record<string, string> = {};
  mandanteCompanies.forEach((company) => {
    companiesMap[company.id] = company.name;
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Proyectos</CardTitle>
                <CardDescription>Gestión de proyectos del sistema</CardDescription>
              </div>
              <AddProjectButton />
            </CardHeader>
            <CardContent>
              <ProjectsTable initialProjects={projects} companiesMap={companiesMap} />
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
