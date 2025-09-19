'use client';

import { scheduleMyDayTasks } from '@/ai/flows/schedule-my-day-flow';
import { useTasks, useTasksDispatch } from '@/hooks/use-tasks';
import type { Task } from '@/lib/types';
import { useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Sparkles, Calendar } from 'lucide-react';
import { TaskList } from './task-list';
import { format, parseISO, isToday, set } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

export function MyDayView() {
  const { tasks } = useTasks();
  const dispatch = useTasksDispatch();
  const { toast } = useToast();
  const [isScheduling, setIsScheduling] = useState(false);

  const myDayTasks = useMemo(() => {
    return tasks
      .filter((task) => task.isMyDay)
      .sort((a, b) => {
        // Incomplete tasks come first
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;

        // Then, sort by time (if available)
        const aHasTime = a.dueDate && format(parseISO(a.dueDate), 'HH:mm') !== '00:00';
        const bHasTime = b.dueDate && format(parseISO(b.dueDate), 'HH:mm') !== '00:00';

        if (aHasTime && bHasTime) return parseISO(a.dueDate!).getTime() - parseISO(b.dueDate!).getTime();
        if (aHasTime) return -1; // Tasks with time come before all-day tasks
        if (bHasTime) return 1;

        // Then, sort by importance
        if (a.isImportant && !b.isImportant) return -1;
        if (!a.isImportant && b.isImportant) return 1;
        
        // Finally, sort by creation date
        return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime();
      });
  }, [tasks]);

  const handleAiSchedule = async () => {
    setIsScheduling(true);
    toast({ title: '🤖 Scheduling your day...', description: 'The AI is working its magic to organize your tasks.' });
    try {
      const tasksToSchedule = myDayTasks.filter(t => !t.completed);
      const input = {
        userSchedule: 'Works from 8:30 to 11:30, breaks for lunch, works again from 13:00 to 17:30, breaks for dinner, and is free from 18:30 to 22:00.',
        tasks: tasksToSchedule.map(t => ({
          id: t.id,
          title: t.title,
          duration: t.duration,
          isImportant: t.isImportant,
          dueDate: t.dueDate,
        })),
        currentDate: new Date().toISOString(),
      };

      const result = await scheduleMyDayTasks(input);
      
      result.scheduledTasks.forEach(scheduledTask => {
        const originalTask = tasks.find(t => t.id === scheduledTask.id);
        if (originalTask) {
          const updatedTask: Task = {
            ...originalTask,
            dueDate: scheduledTask.scheduledTime,
          };
          dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
        }
      });
      toast({ title: '✅ Day Scheduled!', description: 'Your tasks have been assigned a time.' });
    } catch (error) {
      console.error('Failed to schedule tasks:', error);
      toast({ variant: 'destructive', title: ' scheduling failed', description: 'The AI could not schedule your tasks. Please try again.' });
    } finally {
      setIsScheduling(false);
    }
  };

  const tasksWithTime = myDayTasks.filter(t => t.dueDate && format(parseISO(t.dueDate), 'HH:mm') !== '00:00');
  const allDayTasks = myDayTasks.filter(t => !t.dueDate || format(parseISO(t.dueDate), 'HH:mm') === '00:00');
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Day</h1>
        <Button onClick={handleAiSchedule} disabled={isScheduling}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isScheduling ? 'Scheduling...' : 'Smart Schedule'}
        </Button>
      </div>

      <div>
        {isScheduling && (
          <div className="space-y-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {!isScheduling && tasksWithTime.length > 0 && (
          <div className="divide-y divide-border rounded-lg border">
            <TaskList tasks={tasksWithTime} variant="my-day" />
          </div>
        )}

        {!isScheduling && allDayTasks.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                All-day / Unscheduled
            </h3>
            <div className="divide-y divide-border rounded-lg border">
                <TaskList tasks={allDayTasks} variant="default" />
            </div>
          </div>
        )}

        {!isScheduling && myDayTasks.length === 0 && (
             <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Your day is clear.</p>
                <p className="text-muted-foreground text-sm">Add tasks from your lists to get started.</p>
            </div>
        )}
      </div>
    </div>
  );
}
