'use client';

import { AppHeader } from '@/components/app-header';
import { MainSidebar } from '@/components/main-sidebar';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddTaskSheet } from '@/components/add-task-sheet';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Use a cookie to remember the sidebar state
  // We can't use use-local-storage hook here because it's a client component
  // and we need to read the cookie on the server to avoid a flash of content.
  const [defaultOpen, setDefaultOpen] = React.useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
        <AppHeader onNewTaskClick={() => setIsSheetOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">
           {children}
          </div>
        </main>
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => setIsSheetOpen(true)}
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">New Task</span>
          </Button>
        </div>
        <AddTaskSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
      </SidebarInset>
    </SidebarProvider>
  );
}
