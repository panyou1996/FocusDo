
'use client';

import type { Task, CalendarEvent } from '@/lib/types';
import { TaskItem } from './task-item';
import { Droppable } from 'react-beautiful-dnd';

type Item = (Task & { type: 'task' }) | (CalendarEvent & { type: 'event' });

interface TaskListProps {
  items?: Item[];
  variant?: 'default' | 'my-day';
  droppableId: string;
  isDropDisabled?: boolean;
}

export function TaskList({ items, variant = 'default', droppableId, isDropDisabled = false }: TaskListProps) {
  if (!items) {
    return null;
  }

  if (items.length === 0 && droppableId !== 'completed-tasks') {
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
          {items.map((item, index) => (
            <TaskItem 
              key={item.id} 
              item={item} 
              variant={variant} 
              index={index} 
              isDragDisabled={isDropDisabled || (item.type === 'task' && item.completed) || item.type === 'event' }
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
