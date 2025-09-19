
'use client';

import { MainSidebar } from '@/components/main-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddTaskDialog } from '@/components/add-task-dialog';
import { usePathname } from 'next/navigation';
import { AppHeader } from '@/components/app-header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Use a cookie to remember the sidebar state
  // We can't use use-local-storage hook here because it's a client component
  // and we need to read the cookie on the server to avoid a flash of content.
  const [defaultOpen, setDefaultOpen] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith('sidebar_state='))
      ?.split('=')[1];
    
    if (cookieValue !== undefined) {
      setDefaultOpen(cookieValue === 'true');
    }
  }, []);

  // MyDayView now renders its own header to handle view mode switching
  const showDefaultHeader = pathname !== '/my-day';

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <MainSidebar />
      <SidebarInset className="bg-background min-h-screen">
        {showDefaultHeader && <AppHeader />}
        <main className="flex-1 p-4 md:p-6">
          <div className="w-full">
           {children}
          </div>
        </main>
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">New Task</span>
          </Button>
        </div>
        <AddTaskDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      </SidebarInset>
    </SidebarProvider>
  );
}
