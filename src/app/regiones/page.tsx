import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CHILE_REGIONS } from '@/lib/chile-regions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function RegionesPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <Card>
            <CardHeader>
              <CardTitle>Regiones de Chile</CardTitle>
              <CardDescription>
                Las regiones son datos estáticos del sistema y no requieren gestión manual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>País</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CHILE_REGIONS.map((region) => (
                      <TableRow key={region.id}>
                        <TableCell>
                          <Badge variant="outline">{region.code}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{region.name}</TableCell>
                        <TableCell>{region.country}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Total: {CHILE_REGIONS.length} regiones oficiales de Chile
              </p>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
