
'use client';

import { MainSidebar } from '@/components/main-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Sparkles } from 'lucide-react';
import { AddTaskDialog } from '@/components/add-task-dialog';
import { AddEventDialog } from '@/components/add-event-dialog';
import { usePathname } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { motion, AnimatePresence } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Use a cookie to remember the sidebar state
  // We can't use use-local-storage hook here because it's a client component
  // and we need to read the cookie on the server to avoid a flash of content.
  const [defaultOpen, setDefaultOpen] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);

  // 点击外部关闭浮动菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-floating-menu]') && isFloatingMenuOpen) {
        setIsFloatingMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFloatingMenuOpen]);
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
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                className="w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        <div className="fixed bottom-8 right-8 z-[60]" data-floating-menu>
          <div className="flex flex-col items-end gap-3">
            {/* 扩展选项 */}
            <AnimatePresence>
              {isFloatingMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="flex flex-col items-end gap-2"
                >
                  {/* 日程安排按钮 */}
                  <motion.div
                    whileHover={{ x: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200"
                    >
                      <span className="text-sm font-medium text-gray-700">固定日程</span>
                    </motion.div>
                    <Button
                      size="icon"
                      onClick={() => {
                        setIsEventDialogOpen(true);
                        setIsFloatingMenuOpen(false);
                      }}
                      className="h-12 w-12 rounded-full bg-green-500 hover:bg-green-600 shadow-lg border-0"
                    >
                      <Calendar className="h-5 w-5 text-white" />
                    </Button>
                  </motion.div>
                  
                  {/* 灵活任务按钮 */}
                  <motion.div
                    whileHover={{ x: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200"
                    >
                      <span className="text-sm font-medium text-gray-700">灵活任务</span>
                    </motion.div>
                    <Button
                      size="icon"
                      onClick={() => {
                        setIsDialogOpen(true);
                        setIsFloatingMenuOpen(false);
                      }}
                      className="h-12 w-12 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg border-0"
                    >
                      <Sparkles className="h-5 w-5 text-white" />
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* 主按钮 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Button
                size="icon"
                onClick={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
                className="h-14 w-14 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg border-0"
              >
                <motion.div
                  animate={{ rotate: isFloatingMenuOpen ? 45 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Plus className="h-6 w-6 text-white" />
                </motion.div>
                <VisuallyHidden>快速添加任务</VisuallyHidden>
              </Button>
            </motion.div>
          </div>
        </div>
        <AddTaskDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        <AddEventDialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen} />
      </SidebarInset>
    </SidebarProvider>
  );
}
