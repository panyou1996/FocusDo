
'use client';

import { TaskList } from '@/components/task-list';
import { useTasks } from '@/hooks/use-tasks';
import { isToday, isTomorrow, parseISO } from 'date-fns';

export default function UpcomingPage() {
  const { tasks } = useTasks();

  const upcomingTasks = tasks.filter((task) => {
    if (!task.dueDate) return false;
    const dueDate = parseISO(task.dueDate);
    return isToday(dueDate) || isTomorrow(dueDate);
  }).sort((a, b) => {
    if (!a.dueDate || !b.dueDate) return 0;
    return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
  });

  return (
    <div className="space-y-8">
       <div>
        <h2 className="text-lg font-semibold mb-4">Due Today</h2>
        <TaskList tasks={upcomingTasks.filter(t => t.dueDate && isToday(parseISO(t.dueDate)))} />
      </div>
       <div>
        <h2 className="text-lg font-semibold mb-4">Due Tomorrow</h2>
        <TaskList tasks={upcomingTasks.filter(t => t.dueDate && isTomorrow(parseISO(t.dueDate)))} />
      </div>
    </div>
  );
}
