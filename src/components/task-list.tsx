
'use client';

import type { Task, CalendarEvent } from '@/lib/types';
import { TaskItem } from './task-item';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

type Item = (Task & { type: 'task' }) | (CalendarEvent & { type: 'event' });

interface TaskListProps {
  items?: Item[];
  viewMode?: 'compact' | 'detailed';
  droppableId: string;
  isDropDisabled?: boolean;
}

export function TaskList({ items, viewMode = 'detailed', droppableId, isDropDisabled = false }: TaskListProps) {
  if (!items || items.length === 0) {
    if (droppableId === 'completed-tasks' || droppableId === 'timed-items' || droppableId === 'allday-tasks') {
        // Don't show a message for these specific droppableIds when empty, MyDayView handles it.
        return null;
    }
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <div className="w-6 h-6 bg-gray-300 rounded" />
        </div>
        <p className="text-gray-500 text-sm">这里还没有任务，看起来很干净！</p>
      </div>
    );
  }

  return (
    <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
      <div className="space-y-2">
        {items.map((item, index) => (
          <TaskItem 
            key={item.id} 
            item={item} 
            viewMode={viewMode}
            index={index} 
            isDragDisabled={isDropDisabled || (item.type === 'task' && item.completed) || item.type === 'event' }
          />
        ))}
      </div>
    </SortableContext>
  );
}
