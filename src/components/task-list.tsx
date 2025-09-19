
'use client';

import type { Task } from '@/lib/types';
import { TaskItem } from './task-item';
import { Droppable } from 'react-beautiful-dnd';

interface TaskListProps {
  tasks: Task[];
  variant?: 'default' | 'my-day';
  droppableId: string;
  isDropDisabled?: boolean;
}

export function TaskList({ tasks, variant = 'default', droppableId, isDropDisabled = false }: TaskListProps) {

  if (tasks.length === 0 && droppableId !== 'completed-tasks') {
      return (
         <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No tasks here. Looks like a clean slate!</p>
        </div>
      )
  }

  return (
    <Droppable droppableId={droppableId} isDropDisabled={isDropDisabled}>
      {(provided) => (
        <div 
          ref={provided.innerRef} 
          {...provided.droppableProps} 
          className="space-y-2"
        >
          {tasks.map((task, index) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              variant={variant} 
              index={index} 
              isDragDisabled={isDropDisabled || task.completed}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
