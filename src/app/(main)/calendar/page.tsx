'use client';

import { TaskItem } from '@/components/task-item';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTasks } from '@/hooks/use-tasks';
import { areIntervalsOverlapping, format, isSameDay, parseISO } from 'date-fns';
import { useState } from 'react';

export default function CalendarPage() {
  const { tasks } = useTasks();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const tasksWithDueDate = tasks.filter((task) => !!task.dueDate);

  const tasksForSelectedDay = date
    ? tasksWithDueDate.filter((task) => isSameDay(parseISO(task.dueDate!), date))
    : [];

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
            <CardContent className="p-2">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="w-full"
                    modifiers={{
                        hasTask: tasksWithDueDate.map((task) => parseISO(task.dueDate!)),
                    }}
                    modifiersStyles={{
                        hasTask: {
                            position: 'relative',
                        },
                    }}
                    components={{
                        DayContent: (props) => {
                            const hasTask = tasksWithDueDate.some((task) => isSameDay(parseISO(task.dueDate!), props.date));
                            return (
                                <div className="relative">
                                    {props.date.getDate()}
                                    {hasTask && (
                                    <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 transform rounded-full bg-primary" />
                                    )}
                                </div>
                            );
                        },
                    }}
                />
            </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <h2 className="mb-4 text-xl font-bold">
          {date ? format(date, 'MMMM d, yyyy') : 'Select a day'}
        </h2>
        <div className="space-y-4">
          {tasksForSelectedDay.length > 0 ? (
            tasksForSelectedDay.map((task) => <TaskItem key={task.id} task={task} />)
          ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No tasks scheduled for this day.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
