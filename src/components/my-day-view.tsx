'use client';

import { scheduleMyDayTasks } from '@/ai/flows/schedule-my-day-flow';
import { useTasks, useTasksDispatch } from '@/hooks/use-tasks';
import type { Task } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Sparkles, Calendar, Settings } from 'lucide-react';
import { TaskList } from './task-list';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

const DEFAULT_SCHEDULE = 'Works from 8:30 to 11:30, breaks for lunch, works again from 13:00 to 17:30, breaks for dinner, and is free from 18:30 to 22:00.';

export function MyDayView() {
  const { tasks } = useTasks();
  const dispatch = useTasksDispatch();
  const { toast } = useToast();
  const [isScheduling, setIsScheduling] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userSchedule, setUserSchedule] = useState(DEFAULT_SCHEDULE);
  
  useEffect(() => {
    const savedSchedule = localStorage.getItem('userSchedule');
    if (savedSchedule) {
        setUserSchedule(savedSchedule);
    }
  }, []);

  const handleSaveSchedule = () => {
    localStorage.setItem('userSchedule', userSchedule);
    toast({ title: 'Schedule Saved', description: 'Your new schedule has been saved.' });
    setIsSettingsOpen(false);
  }

  const myDayTasks = useMemo(() => {
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

  const handleAiSchedule = async () => {
    setIsScheduling(true);
    toast({ title: '🤖 Scheduling your day...', description: 'The AI is working its magic to organize your tasks.' });
    
    const tasksToSchedule = myDayTasks.filter(t => !t.completed);
    const originalTasksState = tasksToSchedule.map(t => ({...t}));

    try {
      const input = {
        userSchedule: userSchedule,
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
      
      const updatedTasks: Task[] = [];
      result.scheduledTasks.forEach(scheduledTask => {
        const originalTask = tasks.find(t => t.id === scheduledTask.id);
        if (originalTask) {
          const updatedTask: Task = {
            ...originalTask,
            dueDate: scheduledTask.scheduledTime,
          };
          updatedTasks.push(updatedTask);
          dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
        }
      });

      toast({ 
        title: '✅ Day Scheduled!', 
        description: 'Your tasks have been assigned a time.',
        action: (
            <Button variant="outline" size="sm" onClick={() => {
                originalTasksState.forEach(originalTask => {
                    dispatch({ type: 'UPDATE_TASK', payload: originalTask });
                });
                toast({ title: '↩️ Action Undone', description: 'Your schedule has been reverted.' });
            }}>
                Undo
            </Button>
        )
      });
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
    <>
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Day</h1>
        <div className="flex items-center gap-2">
            <Button onClick={handleAiSchedule} disabled={isScheduling}>
                <Sparkles className="mr-2 h-4 w-4" />
                {isScheduling ? 'Scheduling...' : 'Smart Schedule'}
            </Button>
            <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)} aria-label="Schedule Settings">
                <Settings className="h-4 w-4" />
            </Button>
        </div>
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
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Configure Your Schedule</DialogTitle>
                <DialogDescription>
                    Let the AI know your working hours and breaks for better scheduling. Use natural language.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
                <Label htmlFor="schedule-input">Your typical day:</Label>
                <Textarea
                    id="schedule-input"
                    value={userSchedule}
                    onChange={(e) => setUserSchedule(e.target.value)}
                    rows={5}
                    placeholder="e.g. Work from 9am to 5pm with a lunch break from 12pm to 1pm."
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveSchedule}>Save Schedule</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
