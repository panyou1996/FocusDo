
'use client';

import { useTasks } from '@/hooks/use-tasks';
import { useMemo } from 'react';
import { TaskList } from './task-list';
import { format, parseISO } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { Calendar } from 'lucide-react';


export function MyDayView() {
  const { tasks } = useTasks();

  const myDayTasks = useMemo(() => {
    // This sorting logic is important and should be preserved.
    return tasks
      .filter((task) => task.isMyDay)
      .sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;

        const aHasTime = a.dueDate && format(parseISO(a.dueDate), 'HH:mm') !== '00:00';
        const bHasTime = b.dueDate && format(parseISO(b.dueDate), 'HH:mm') !== '00:00';

        if (aHasTime && bHasTime) return parseISO(a.dueDate!).getTime() - parseISO(b.dueDate!).getTime();
        if (aHasTime) return -1;
        if (bHasTime) return 1;

        if (a.isImportant && !b.isImportant) return -1;
        if (!a.isImportant && b.isImportant) return 1;
        
        return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime();
      });
  }, [tasks]);


  const tasksWithTime = myDayTasks.filter(t => t.dueDate && format(parseISO(t.dueDate), 'HH:mm') !== '00:00');
  const allDayTasks = myDayTasks.filter(t => !t.dueDate || format(parseISO(t.dueDate), 'HH:mm') === '00:00');
  
  return (
    <div className="space-y-8">
      <div>
        {tasksWithTime.length > 0 && (
          <div className="space-y-2">
            <TaskList tasks={tasksWithTime} variant="my-day" />
          </div>
        )}

        {allDayTasks.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                All-day / Unscheduled
            </h3>
            <div className="space-y-2">
                <TaskList tasks={allDayTasks} variant="my-day" />
            </div>
          </div>
        )}

        {myDayTasks.length === 0 && (
             <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Your day is clear.</p>
                <p className="text-muted-foreground text-sm">Add tasks from your lists to get started.</p>
            </div>
        )}
      </div>
    </div>
  );
}
