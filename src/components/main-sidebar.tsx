
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
  SidebarGroupAction,
  SidebarMenuAction,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { useTasks, useTasksDispatch } from '@/hooks/use-tasks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Lucide from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { MoreHorizontal, Plus, Trash2, Edit, Clock } from 'lucide-react';
import React, { useState } from 'react';
import { AddListDialog } from './add-list-dialog';
import { getSidebarListColorClasses } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { EditListDialog } from './edit-list-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import type { List } from '@/lib/types';


export function MainSidebar() {
  const { lists, tags } = useTasks();
  const dispatch = useTasksDispatch();
  const pathname = usePathname();
  const [isAddListDialogOpen, setIsAddListDialogOpen] = useState(false);
  const [isEditListDialogOpen, setIsEditListDialogOpen] = useState(false);
  const [listToEdit, setListToEdit] = useState<List | null>(null);

  const handleEditClick = (list: List) => {
    setListToEdit(list);
    setIsEditListDialogOpen(true);
  };

  const handleDeleteClick = (listId: string) => {
    dispatch({ type: 'DELETE_LIST', payload: listId });
  };

  return (
    <>
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
              <SidebarMenuButton asChild isActive={pathname.startsWith('/lists/important')} tooltip="Important">
                <Link href="/lists/important">
                  <Lucide.Star />
                  <span>Important</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/lists/tasks')} tooltip="Tasks">
                <Link href="/lists/tasks">
                  <Lucide.Home />
                  <span>Tasks</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/upcoming')} tooltip="Upcoming">
                <Link href="/upcoming">
                  <Clock />
                  <span>Upcoming</span>
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
            <SidebarGroupLabel>
              Lists
              <SidebarGroupAction asChild>
                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsAddListDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                 </Button>
              </SidebarGroupAction>
            </SidebarGroupLabel>
            <SidebarMenu>
              {lists.filter(l => !['my-day', 'important', 'tasks'].includes(l.id)).map((list) => {
                const Icon = Lucide[list.icon as keyof typeof Lucide] || Lucide.List;
                const isActive = pathname === `/lists/${list.id}`;
                return (
                  <SidebarMenuItem key={list.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={list.title}
                      className={isActive ? getSidebarListColorClasses(list.color) : ''}
                    >
                      <Link href={`/lists/${list.id}`}>
                        <Icon />
                        <span>{list.title}</span>
                      </Link>
                    </SidebarMenuButton>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <SidebarMenuAction showOnHover>
                            <MoreHorizontal />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEditClick(list)}>
                          <Edit className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="mr-2 text-destructive" />
                              <span className="text-destructive">Delete</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the &quot;{list.title}&quot; list and all its tasks. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteClick(list.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
      <AddListDialog open={isAddListDialogOpen} onOpenChange={setIsAddListDialogOpen} />
      {listToEdit && <EditListDialog open={isEditListDialogOpen} onOpenChange={setIsEditListDialogOpen} list={listToEdit} />}
    </>
  );
}
