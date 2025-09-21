'use client';

import { MainSidebar } from '@/components/main-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddTaskDialog } from '@/components/add-task-dialog';
import { usePathname } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppLayoutWithAnimation({ 
  children 
}: { 
  children: React.ReactNode 
}) {
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

  // MyDayView renders its own header, others don't need the AppHeader
  const showDefaultHeader = false;

  // 定义页面切换动画 variants
  const pageVariants = {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.98
    },
    in: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number]
      }
    },
    out: { 
      opacity: 0, 
      y: -20,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: [0.4, 0.0, 0.2, 1] as [number, number, number, number]
      }
    }
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <MainSidebar />
      <SidebarInset className="bg-background min-h-screen">
        {showDefaultHeader && <AppHeader />}
        <main className="flex-1 p-4 md:p-6">
          <div className="w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-6 w-6" />
            <VisuallyHidden>New Task</VisuallyHidden>
          </Button>
        </div>
        <AddTaskDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      </SidebarInset>
    </SidebarProvider>
  );
}