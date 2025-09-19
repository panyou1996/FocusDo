'use client';

import { recommendMyDayTasks } from '@/ai/flows/my-day-task-recommendation';
import { useTasks, useTasksDispatch } from '@/hooks/use-tasks';
import type { Task } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Lightbulb, Plus, Sparkles } from 'lucide-react';
import { TaskList } from './task-list';
import { Skeleton } from './ui/skeleton';
import { parseISO } from 'date-fns';

export function MyDayView() {
  const { tasks } = useTasks();
  const dispatch = useTasksDispatch();
  const [recommendedTasks, setRecommendedTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const availableTasks = tasks.filter((t) => !t.completed && t.listId !== 'my-day');
        const input = {
          userHabits: 'Prefers to work on deep work in the morning and smaller tasks in the afternoon.',
          taskPriorities: 'Urgent tasks and work related to "Project Aqua" are high priority.',
          availableTasks: JSON.stringify(availableTasks.map(t => ({id: t.id, title: t.title, dueDate: t.dueDate, description: t.description}))),
        };

        const result = await recommendMyDayTasks(input);
        const recommendedTitles = result.recommendedTasks.split(',').map(t => t.trim());
        
        const filteredTasks = availableTasks.filter(t => recommendedTitles.includes(t.title));
        setRecommendedTasks(filteredTasks);
      } catch (error) {
        console.error('Failed to fetch task recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [tasks]);

  const myDayTasks = useMemo(() => {
    return tasks
      .filter((task) => task.listId === 'my-day')
      .sort((a, b) => {
        // Sort completed tasks to the bottom
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;

        // 1. Sort by due date (time)
        if (a.dueDate && b.dueDate) {
          const aDate = parseISO(a.dueDate);
          const bDate = parseISO(b.dueDate);
          if (aDate.getTime() !== bDate.getTime()) {
            return aDate.getTime() - bDate.getTime();
          }
        }
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        
        // 2. Sort by importance (urgent tag)
        const aIsUrgent = a.tagIds.includes('urgent');
        const bIsUrgent = b.tagIds.includes('urgent');
        if (aIsUrgent && !bIsUrgent) return -1;
        if (!aIsUrgent && bIsUrgent) return 1;

        // 3. Sort by creation time
        return parseISO(a.createdAt).getTime() - parseISO(b.createdAt).getTime();
      });
  }, [tasks]);

  const handleAddTaskToMyDay = (task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: { ...task, listId: 'my-day' } });
    setRecommendedTasks(prev => prev.filter(t => t.id !== task.id));
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">My Day</h2>
        <TaskList tasks={myDayTasks} />
        {myDayTasks.filter(t => !t.completed).length === 0 && (
             <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Your day is clear.</p>
                <p className="text-muted-foreground text-sm">Add tasks from the suggestions below or create a new one.</p>
            </div>
        )}
      </div>

      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight mb-4">
          <Sparkles className="text-primary" />
          Suggestions
        </h2>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : recommendedTasks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendedTasks.map((task) => (
              <Card key={task.id} className="flex flex-col">
                <CardHeader className="flex-row items-start justify-between">
                  <CardTitle className="text-base font-medium leading-tight">{task.title}</CardTitle>
                   <Button size="sm" variant="ghost" onClick={() => handleAddTaskToMyDay(task)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground flex-grow">
                   {task.description}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No suggestions right now</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add more tasks to get personalized recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
