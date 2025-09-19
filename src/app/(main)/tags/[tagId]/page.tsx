'use client';

import { TaskList } from '@/components/task-list';
import { useTasks } from '@/hooks/use-tasks';
import { useParams } from 'next/navigation';

export default function TagPage() {
  const params = useParams();
  const { tasks } = useTasks();
  const tagId = params.tagId as string;

  const tagTasks = tasks.filter((task) => task.tagIds.includes(tagId));

  return <TaskList tasks={tagTasks} />;
}
