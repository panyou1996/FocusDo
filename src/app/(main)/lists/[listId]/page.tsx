
'use client';

import { TaskList } from '@/components/task-list';
import { useTasks } from '@/hooks/use-tasks';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

export default function ListPage() {
  const params = useParams();
  const { tasks } = useTasks();
  const listId = params.listId as string;

  const listTasks = useMemo(() => {
    return tasks
      .filter((task) => task.listId === listId)
      .map(task => ({ ...task, type: 'task' as const }));
  }, [tasks, listId]);

  return <TaskList items={listTasks} droppableId={`list-${listId}`} />;
}
