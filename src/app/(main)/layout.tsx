'use client';

import { AppHeader } from '@/components/app-header';
import { MainSidebar } from '@/components/main-sidebar';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import React from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Use a cookie to remember the sidebar state
  // We can't use use-local-storage hook here because it's a client component
  // and we need to read the cookie on the server to avoid a flash of content.
  const [defaultOpen, setDefaultOpen] = React.useState(true);

  React.useEffect(() => {
    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith('sidebar_state='))
      ?.split('=')[1];
    
    if (cookieValue !== undefined) {
      setDefaultOpen(cookieValue === 'true');
    }
  }, []);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <MainSidebar />
      <SidebarInset className="bg-background min-h-screen">
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">
           {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
