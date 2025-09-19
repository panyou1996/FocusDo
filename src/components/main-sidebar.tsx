'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { useTasks } from '@/hooks/use-tasks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Lucide from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';

export function MainSidebar() {
  const { lists, tags } = useTasks();
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Icons.logo className="size-7 text-primary" />
          <span className="text-lg font-semibold">AquaDo</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/my-day'}
              tooltip="My Day"
            >
              <Link href="/my-day">
                <Lucide.Sun className="text-yellow-500" />
                <span>My Day</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/calendar')} tooltip="Calendar">
              <Link href="/calendar">
                <Lucide.CalendarDays />
                <span>Calendar</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <Separator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel>Lists</SidebarGroupLabel>
          <SidebarMenu>
            {lists.filter(l => !['my-day'].includes(l.id)).map((list) => {
              const Icon = Lucide[list.icon as keyof typeof Lucide] || Lucide.List;
              return (
                <SidebarMenuItem key={list.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/lists/${list.id}`}
                    tooltip={list.title}
                  >
                    <Link href={`/lists/${list.id}`}>
                      <Icon />
                      <span>{list.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Tags</SidebarGroupLabel>
           <div className="flex flex-wrap gap-2 px-2 pt-1 group-data-[collapsible=icon]:hidden">
             {tags.map(tag => (
                <Link key={tag.id} href={`/tags/${tag.id}`} className="text-xs bg-muted hover:bg-accent px-2 py-1 rounded-full">
                    #{tag.label}
                </Link>
             ))}
           </div>
        </SidebarGroup>

      </SidebarContent>
      <SidebarFooter>
         <div className="flex items-center gap-3 p-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://picsum.photos/seed/user/100/100" alt="User Avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <span className="text-sm font-medium">User</span>
                <span className="text-xs text-muted-foreground">user@aquado.app</span>
            </div>
         </div>
      </SidebarFooter>
    </Sidebar>
  );
}
