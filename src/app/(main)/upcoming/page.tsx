
'use client';

import { TaskList } from '@/components/task-list';
import { useTasks } from '@/hooks/use-tasks';
import { isToday, isTomorrow, parseISO } from 'date-fns';
import { useMemo } from 'react';

export default function UpcomingPage() {
  const { tasks } = useTasks();

  const todayTasks = useMemo(() => {
    return tasks
      .filter((task) => task.dueDate && isToday(parseISO(task.dueDate)))
      .map(task => ({ ...task, type: 'task' as const }));
  }, [tasks]);

  const tomorrowTasks = useMemo(() => {
    return tasks
      .filter((task) => task.dueDate && isTomorrow(parseISO(task.dueDate)))
      .map(task => ({ ...task, type: 'task' as const }));
  }, [tasks]);


  return (
    <div className="space-y-8">
       <div>
        <h2 className="text-lg font-semibold mb-4">Due Today</h2>
        <TaskList items={todayTasks} droppableId="today-tasks" />
      </div>
       <div>
        <h2 className="text-lg font-semibold mb-4">Due Tomorrow</h2>
        <TaskList items={tomorrowTasks} droppableId="tomorrow-tasks" />
      </div>
    </div>
  );
}
