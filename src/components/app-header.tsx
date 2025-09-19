'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from './ui/sidebar';
import { useTasks } from '@/hooks/use-tasks';

export function AppHeader() {
  const pathname = usePathname();
  const { lists } = useTasks();

  const getTitle = () => {
    if (pathname === '/my-day') return 'My Day';
    if (pathname.startsWith('/lists/')) {
      const listId = pathname.split('/')[2];
      return lists.find((l) => l.id === listId)?.title || 'List';
    }
    if (pathname.startsWith('/tags/')) {
      const tagId = pathname.split('/')[2];
      return `#${tagId}` || 'Tag';
    }
     if (pathname.startsWith('/calendar')) {
      return 'Calendar';
    }
    return 'AquaDo';
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-bold">{getTitle()}</h1>
      </div>
    </header>
  );
}
