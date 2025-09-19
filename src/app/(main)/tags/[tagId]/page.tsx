
'use client';

import { TaskList } from '@/components/task-list';
import { useTasks } from '@/hooks/use-tasks';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

export default function TagPage() {
  const params = useParams();
  const { tasks } = useTasks();
  const tagId = params.tagId as string;

  const tagTasks = useMemo(() => {
    return tasks
      .filter((task) => task.tagIds.includes(tagId))
      .map(task => ({...task, type: 'task' as const}));
  }, [tasks, tagId]);

  return <TaskList items={tagTasks} droppableId={`tag-${tagId}`} />;
}
