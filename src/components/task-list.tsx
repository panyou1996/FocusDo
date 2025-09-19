'use client';

import type { Task } from '@/lib/types';
import { TaskItem } from './task-item';

interface TaskListProps {
  tasks: Task[];
  variant?: 'default' | 'my-day';
}

export function TaskList({ tasks, variant = 'default' }: TaskListProps) {
  const incompleteTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  if (tasks.length === 0) {
      return (
         <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No tasks here. Looks like a clean slate!</p>
        </div>
      )
  }

  return (
    <div className="space-y-2">
      {incompleteTasks.map((task) => (
        <TaskItem key={task.id} task={task} variant={variant} />
      ))}
      
      {completedTasks.length > 0 && (
        <div className="pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 px-4">Completed</h3>
            <div className="space-y-2">
                {completedTasks.map((task) => (
                    <TaskItem key={task.id} task={task} variant={variant} />
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
