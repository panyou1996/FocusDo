'use client';

import { TaskList } from '@/components/task-list';
import { useTasks } from '@/hooks/use-tasks';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  eachWeekOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isSameWeek,
  isToday,
  isTomorrow,
  parseISO,
  startOfWeek,
} from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CalendarPage() {
  const { tasks } = useTasks();

  const tasksWithDueDate = tasks
    .filter((task) => !!task.dueDate)
    .sort((a, b) => parseISO(a.dueDate!).getTime() - parseISO(b.dueDate!).getTime());

  if (tasksWithDueDate.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">No tasks with due dates yet.</p>
        <p className="text-sm text-muted-foreground">
          Add due dates to your tasks to see them here.
        </p>
      </div>
    );
  }

  const firstTaskDate = parseISO(tasksWithDueDate[0].dueDate!);
  const lastTaskDate = parseISO(
    tasksWithDueDate[tasksWithDueDate.length - 1].dueDate!
  );

  const weeks = eachWeekOfInterval(
    {
      start: firstTaskDate,
      end: lastTaskDate,
    },
    { weekStartsOn: 1 }
  );

  const tasksByWeek = weeks.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekTasks = tasksWithDueDate.filter((task) =>
      isSameWeek(parseISO(task.dueDate!), weekStart, { weekStartsOn: 1 })
    );

    const tasksByDay = weekTasks.reduce<Record<string, { label: string; tasks: typeof weekTasks }>>(
      (acc, task) => {
        const dueDate = parseISO(task.dueDate!);
        const dayKey = format(dueDate, 'yyyy-MM-dd');

        if (!acc[dayKey]) {
          let label = format(dueDate, 'MMMM d, yyyy');
          if (isToday(dueDate)) label = 'Today';
          if (isTomorrow(dueDate)) label = 'Tomorrow';
          acc[dayKey] = { label, tasks: [] };
        }
        acc[dayKey].tasks.push(task);
        return acc;
      },
      {}
    );

    return {
      weekStart,
      weekEnd,
      weekTasks,
      tasksByDay,
    };
  });
  
  const today = new Date();
  const currentWeekValue = `week-${format(today, 'yyyy-ww')}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue={currentWeekValue} className="w-full">
          {tasksByWeek.map(({ weekStart, weekEnd, tasksByDay }, index) => (
            <AccordionItem value={`week-${format(weekStart, 'yyyy-ww')}`} key={index}>
              <AccordionTrigger>
                <div className="flex w-full justify-between items-center pr-4">
                    <span className="font-semibold">
                    {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {Object.values(tasksByDay).reduce((sum, day) => sum + day.tasks.length, 0)} tasks
                    </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pl-2">
                {Object.entries(tasksByDay).map(([day, {label, tasks}]) => (
                    <div key={day}>
                        <h3 className="text-md font-semibold mb-2">{label}</h3>
                        <TaskList tasks={tasks} />
                    </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
