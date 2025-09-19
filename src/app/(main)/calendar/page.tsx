
'use client';

import React, { useState, useMemo } from 'react';
import { TaskList } from '@/components/task-list';
import { useTasks } from '@/hooks/use-tasks';
import {
  isSameDay,
  parseISO,
  format,
  isSameMonth,
} from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

export default function CalendarPage() {
  const { tasks } = useTasks();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const tasksWithDueDate = useMemo(() => tasks.filter((task) => !!task.dueDate), [tasks]);

  const tasksOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return tasksWithDueDate
      .filter((task) => isSameDay(parseISO(task.dueDate!), selectedDate))
      .map(task => ({...task, type: 'task' as const}));
  }, [selectedDate, tasksWithDueDate]);
  
  const daysWithTasks = useMemo(() => {
    return tasksWithDueDate.map(task => parseISO(task.dueDate!));
  }, [tasksWithDueDate]);

  const DayWithDot = ({ day, date }: { day: React.ReactElement, date: Date }) => {
    const hasTasks = daysWithTasks.some(taskDate => isSameDay(taskDate, date));
    return (
      <div className="relative">
        {day}
        {hasTasks && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary" />}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="grid md:grid-cols-[280px_1fr] gap-8">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              components={{
                Day: ({ date, displayMonth }) => {
                  const day = <Button variant="ghost" size="icon" className="w-9 h-9">{date.getDate()}</Button>;
                  if (!isSameMonth(date, displayMonth)) {
                     return <div />;
                  }
                  return <DayWithDot day={day} date={date} />;
                }
              }}
               modifiers={{
                hasTasks: daysWithTasks,
              }}
              modifiersStyles={{
                // This is a workaround to pass data to Day component.
                // We use a non-existent style to avoid affecting the look.
                hasTasks: { dummy: 'dummy' }
              }}
            />
          </div>
          <div className="space-y-4">
            {selectedDate ? (
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        Tasks for {format(selectedDate, 'MMMM d, yyyy')}
                    </h2>
                    {tasksOnSelectedDate.length > 0 ? (
                        <TaskList items={tasksOnSelectedDate} droppableId="calendar-tasks" />
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">No tasks for this day.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Select a day from the calendar to see tasks.</p>
                </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
