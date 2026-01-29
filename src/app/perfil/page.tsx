import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { getCurrentUserProfile } from './actions';
import { ProfileCard } from './_components/profile-card';

export default async function PerfilPage() {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
              <p className="text-muted-foreground mt-1">
                Tu ficha de usuario y foto de perfil
              </p>
            </div>
            <ProfileCard profile={profile} />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
