
'use client';

import { useTasks, useTasksDispatch } from '@/hooks/use-tasks';
import { useMemo } from 'react';
import { TaskList } from './task-list';
import { parseISO, isToday, format } from 'date-fns';
import { Calendar, Briefcase, Video } from 'lucide-react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import type { Task, CalendarEvent } from '@/lib/types';
import { cn } from '@/lib/utils';


const EventItem = ({ event }: { event: CalendarEvent }) => (
    <div className="flex items-center gap-4">
        <div className="flex items-center justify-center rounded-md w-20 h-8 text-sm font-semibold bg-muted/50 text-muted-foreground">
            <span>{format(parseISO(event.startTime), 'HH:mm')}</span>
        </div>
        <div className="flex-1">
            <div
            className={cn(
                'group relative flex items-center gap-3 rounded-lg border-l-4 bg-card p-3',
                event.calendarId === 'work' ? 'border-blue-500' : 'border-green-500'
            )}
            >
                <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-muted">
                    {event.calendarId === 'work' ? <Briefcase className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                        {format(parseISO(event.startTime), 'HH:mm')} - {format(parseISO(event.endTime), 'HH:mm')}
                    </p>
                </div>
            </div>
        </div>
    </div>
);


export function MyDayView() {
  const { tasks, events } = useTasks();
  const dispatch = useTasksDispatch();

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
        if (a.type === 'task' && a.completed && (b.type !== 'task' || !b.completed)) return 1;
        if (b.type === 'task' && b.completed && (a.type !== 'task' || !a.completed)) return -1;
        
        const aTime = a.startTime ? parseISO(a.startTime) : new Date(8640000000000000); // Far future for items without time
        const bTime = b.startTime ? parseISO(b.startTime) : new Date(8640000000000000);
        
        if (aTime.getTime() !== bTime.getTime()) {
            return aTime.getTime() - bTime.getTime();
        }

        // If times are same, events come before tasks
        if (a.type === 'event' && b.type === 'task') return -1;
        if (a.type === 'task' && b.type === 'event') return 1;

        if (a.type === 'task' && b.type === 'task') {
            if (a.isImportant && !b.isImportant) return -1;
            if (!a.isImportant && b.isImportant) return 1;
            return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime();
        }

        return 0;
      });
  }, [tasks, events]);


  const tasksWithTime = myDayItems.filter((item): item is Task & {type: 'task'} => item.type === 'task' && !!item.startTime && !item.completed);
  const allDayTasks = myDayItems.filter((item): item is Task & {type: 'task'} => item.type === 'task' && !item.startTime && !item.completed);
  const completedTasks = myDayItems.filter((item): item is Task & {type: 'task'} => item.type === 'task' && item.completed);
  const scheduledItems = myDayItems.filter(item => !allDayTasks.some(t => t.id === item.id) && !completedTasks.some(t => t.id === item.id));

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

  
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-8">
        <div>
          {scheduledItems.length > 0 && (
             <div className="space-y-2">
                {scheduledItems.map((item, index) => {
                    if (item.type === 'event') {
                        return <EventItem key={item.id} event={item} />;
                    }
                    // This is a task
                    return (
                        <TaskList
                            key={item.id}
                            tasks={[item]}
                            variant="my-day"
                            droppableId={`timed-task-${item.id}`} // Unique droppable for each item might not be right
                            isDropDisabled
                         />
                    )
                })}
                 <TaskList tasks={tasksWithTime} variant="my-day" droppableId="timed-tasks" />
             </div>
          )}

          {(allDayTasks.length > 0 || (myDayItems.length > 0 && scheduledItems.length === 0)) && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  All-day / Unscheduled
              </h3>
              <div className="space-y-2">
                  <TaskList tasks={allDayTasks} variant="my-day" droppableId="allday-tasks" isDropDisabled />
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
                    <TaskList tasks={completedTasks} variant="my-day" droppableId="completed-tasks" isDropDisabled/>
                </div>
            </div>
        )}
        </div>
      </div>
    </DragDropContext>
  );
}
