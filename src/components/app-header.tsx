
'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from './ui/sidebar';
import { useTasks, useTasksDispatch } from '@/hooks/use-tasks';
import { Button } from './ui/button';
import { Sparkles, Settings, PlusCircle, View, Rows } from 'lucide-react';
import { useState, useEffect } from 'react';
import { scheduleMyDayTasks } from '@/ai/flows/schedule-my-day-flow';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import type { Task } from '@/lib/types';
import { isToday, parseISO } from 'date-fns';

const DEFAULT_SCHEDULE = 'Works from 8:30 to 11:30, breaks for lunch, works again from 13:00 to 17:30, breaks for dinner, and is free from 18:30 to 22:00.';

interface AppHeaderProps {
    viewMode?: 'compact' | 'detailed';
    onSwitchViewMode?: (mode: 'compact' | 'detailed') => void;
}

export function AppHeader({ viewMode, onSwitchViewMode }: AppHeaderProps) {
  const pathname = usePathname();
  const { lists, tasks, events } = useTasks();
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

  const myDayTasks = tasks.filter((task) => task.isMyDay);
  const todayEvents = events.filter(event => isToday(parseISO(event.startTime)));


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
        events: todayEvents.map(e => ({
            title: e.title,
            startTime: e.startTime,
            endTime: e.endTime
        })),
        currentDate: new Date().toISOString(),
      };

      const result = await scheduleMyDayTasks(input);
      
      result.scheduledTasks.forEach(scheduledTask => {
        const originalTask = tasks.find(t => t.id === scheduledTask.id);
        if (originalTask) {
          const updatedTask: Task = {
            ...originalTask,
            startTime: scheduledTask.startTime,
          };
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

  const handleAddDueTodayToMyDay = () => {
    const dueTodayTasks = tasks.filter(task => 
        task.dueDate && isToday(parseISO(task.dueDate)) && !task.isMyDay
    );

    if (dueTodayTasks.length === 0) {
        toast({ title: 'All set!', description: "All of today's tasks are already in My Day." });
        return;
    }

    dueTodayTasks.forEach(task => {
        dispatch({ type: 'UPDATE_TASK', payload: { ...task, isMyDay: true } });
    });

    toast({
        title: 'Tasks Added',
        description: `${dueTodayTasks.length} task(s) due today have been added to My Day.`
    });
  }


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
    if (pathname.startsWith('/upcoming')) {
      return 'Upcoming';
    }
    return 'AquaDo';
  };

  const handleViewModeToggle = () => {
    if (onSwitchViewMode && viewMode) {
      onSwitchViewMode(viewMode === 'compact' ? 'detailed' : 'compact');
    }
  }

  return (
    <>
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-bold">{getTitle()}</h1>
         {pathname === '/my-day' && onSwitchViewMode && viewMode && (
            <Button variant="outline" size="icon" onClick={handleViewModeToggle} aria-label="Switch view mode">
                {viewMode === 'compact' ? <Rows className="h-4 w-4" /> : <View className="h-4 w-4" />}
            </Button>
        )}
      </div>
       {pathname === '/my-day' && (
        <div className="flex items-center gap-2">
            <Button onClick={handleAiSchedule} disabled={isScheduling}>
                <Sparkles className="mr-2 h-4 w-4" />
                {isScheduling ? 'Scheduling...' : 'Smart Schedule'}
            </Button>
            <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)} aria-label="Schedule Settings">
                <Settings className="h-4 w-4" />
            </Button>
        </div>
      )}
       {pathname === '/upcoming' && (
        <div className="flex items-center gap-2">
            <Button onClick={handleAddDueTodayToMyDay}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Today to My Day
            </Button>
        </div>
       )}
    </header>
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
