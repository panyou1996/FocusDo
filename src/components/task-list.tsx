'use client';

import type { Task } from '@/lib/types';
import { TaskItem } from './task-item';

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const incompleteTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <div className="space-y-2">
      {incompleteTasks.length === 0 && completedTasks.length === 0 && (
         <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No tasks here. Looks like a clean slate!</p>
        </div>
      )}

      {incompleteTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
      
      {completedTasks.length > 0 && (
        <div className="pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Completed</h3>
            <div className="space-y-2">
                {completedTasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
