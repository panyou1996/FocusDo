
'use client';

import { useTasks, useTasksDispatch } from '@/hooks/use-tasks';
import { useMemo, useState } from 'react';
import { TaskList } from './task-list';
import { parseISO, isToday } from 'date-fns';
import { Calendar } from 'lucide-react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import type { Task } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import { DndProvider } from './dnd-provider';


export function MyDayView() {
  const { tasks, events } = useTasks();
  const dispatch = useTasksDispatch();
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');

  const myDayItems = useMemo(() => {
    const todayEvents = events
      .filter((event) => isToday(parseISO(event.startTime)))
      .map(event => ({ ...event, type: 'event' as const }));

    const myDayTasks = tasks
      .filter((task) => task.isMyDay)
      .map(task => ({...task, type: 'task' as const }));

    const allItems = [...todayEvents, ...myDayTasks];

    return allItems
      .sort((a, b) => {
        const aIsCompleted = a.type === 'task' && a.completed;
        const bIsCompleted = b.type === 'task' && b.completed;

        // 1. Completed tasks go to the bottom
        if (aIsCompleted && !bIsCompleted) return 1;
        if (!aIsCompleted && bIsCompleted) return -1;

        const aHasTime = !!a.startTime;
        const bHasTime = !!b.startTime;

        // 2. Sort by time
        if (aHasTime && bHasTime) {
            const aTime = parseISO(a.startTime!).getTime();
            const bTime = parseISO(b.startTime!).getTime();
            if (aTime !== bTime) {
                return aTime - bTime;
            }
        }
        
        // 3. Items with time come before items without time
        if (aHasTime && !bHasTime) return -1;
        if (!aHasTime && bHasTime) return 1;

        // 4. For items without time, sort by importance, then creation date
        if (a.type === 'task' && b.type === 'task') {
            if (a.isImportant && !b.isImportant) return -1;
            if (!a.isImportant && b.isImportant) return 1;
            return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime();
        }

        return 0;
      });
  }, [tasks, events]);


  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    
    // For this prototype, we will only allow reordering tasks, not changing their times by dragging.
    // A more advanced implementation would update start times based on drop position relative to other timed items.
  };

  const scheduledItems = myDayItems.filter(item => !!item.startTime && (item.type === 'event' || (item.type === 'task' && !item.completed)));
  const allDayTasks = myDayItems.filter((item): item is Task & {type: 'task'} => item.type === 'task' && !item.startTime && !item.completed);
  const completedTasks = myDayItems.filter((item): item is Task & {type: 'task'} => item.type === 'task' && item.completed);
  
  return (
    <DndProvider>
        <DragDropContext onDragEnd={onDragEnd}>
        <AppHeader viewMode={viewMode} onSwitchViewMode={setViewMode} />
        <div className="space-y-8 mt-6">
            <div>
            {scheduledItems.length > 0 && (
                <div className="space-y-2">
                    <TaskList
                    items={scheduledItems}
                    viewMode={viewMode}
                    droppableId="timed-items"
                    />
                </div>
            )}

            {(allDayTasks.length > 0 || (myDayItems.length > 0 && scheduledItems.length === 0)) && (
                <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    All-day / Unscheduled
                </h3>
                <div className="space-y-2">
                    <TaskList items={allDayTasks} droppableId="allday-tasks" viewMode={viewMode} />
                </div>
                </div>
            )}

            {myDayItems.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Your day is clear.</p>
                    <p className="text-muted-foreground text-sm">Add tasks from your lists to get started.</p>
                </div>
            )}

            {completedTasks.length > 0 && (
                <div className="pt-4 mt-8">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 px-4">Completed</h3>
                    <div className="space-y-2">
                        <TaskList items={completedTasks} droppableId="completed-tasks" isDropDisabled={true} viewMode={viewMode}/>
                    </div>
                </div>
            )}
            </div>
        </div>
        </DragDropContext>
    </DndProvider>
  );
}
