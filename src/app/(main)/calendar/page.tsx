
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { TaskList } from '@/components/task-list';
import { useTasksClient } from '@/hooks/use-tasks';
import {
  isSameDay,
  parseISO,
  format,
  isSameMonth,
} from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { DndProvider } from '@/components/dnd-provider';
import { CalendarDays } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function CalendarPage() {
  const { tasks } = useTasksClient();
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

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 py-2">
        <SidebarTrigger className="md:hidden" />
        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
          <CalendarDays className="h-4 w-4 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">日历</h1>
          <p className="text-sm text-gray-500 mt-0.5">查看任务的安排和到期日期</p>
        </div>
      </div>

      <DndProvider>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid md:grid-cols-[320px_1fr] divide-x divide-gray-100">
            {/* 日历面板 */}
            <div className="p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-lg border-0"
                components={{
                  Day: ({ date, displayMonth, ...dayProps }) => {
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const hasTasksOnDate = daysWithTasks.some(taskDate => isSameDay(taskDate, date));
                    
                    if (!isSameMonth(date, displayMonth)) {
                      return (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-9 h-9 rounded-lg text-muted-foreground/50 opacity-50"
                          onClick={() => setSelectedDate(date)}
                        >
                          {date.getDate()}
                        </Button>
                      );
                    }
                    
                    return (
                      <div className="relative">
                        <Button 
                          variant={isSelected ? "default" : "ghost"}
                          size="icon" 
                          className={`w-9 h-9 rounded-lg transition-colors ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                              : 'hover:bg-blue-50 hover:text-blue-600'
                          }`}
                          onClick={() => setSelectedDate(date)}
                        >
                          {date.getDate()}
                        </Button>
                        {hasTasksOnDate && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                    );
                  }
                }}
              />
            </div>
            
            {/* 任务面板 */}
            <div className="p-6 min-h-[400px]">
              {selectedDate ? (
                <div>
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                      {format(selectedDate, 'MMMM d, yyyy')}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {tasksOnSelectedDate.length} 个任务
                    </p>
                  </div>
                  
                  {tasksOnSelectedDate.length > 0 ? (
                    <TaskList items={tasksOnSelectedDate} droppableId="calendar-tasks" />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <CalendarDays className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">这天没有任务</h3>
                      <p className="text-gray-500 max-w-sm">选择其他日期来查看相关任务。</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <CalendarDays className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">选择日期</h3>
                  <p className="text-gray-500 max-w-sm">从左侧日历中选择一天来查看任务。</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DndProvider>
    </div>
  );
}
