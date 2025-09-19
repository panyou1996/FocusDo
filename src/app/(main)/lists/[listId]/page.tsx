'use client';

import { TaskList } from '@/components/task-list';
import { useTasks } from '@/hooks/use-tasks';
import { useParams } from 'next/navigation';

export default function ListPage() {
  const params = useParams();
  const { tasks } = useTasks();
  const listId = params.listId as string;

  const listTasks = tasks.filter((task) => task.listId === listId);

  return <TaskList tasks={listTasks} />;
}
