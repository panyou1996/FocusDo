
'use client';

import { TaskList } from '@/components/task-list';
import { useTasksClient } from '@/hooks/use-tasks';
import { isToday, isTomorrow, parseISO, isThisWeek, startOfWeek, endOfWeek } from 'date-fns';
import { useMemo } from 'react';
import { DndProvider } from '@/components/dnd-provider';
import { Clock, Calendar } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function UpcomingPage() {
  const { tasks } = useTasksClient();

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

  const thisWeekTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (!task.dueDate) return false;
        const taskDate = parseISO(task.dueDate);
        return isThisWeek(taskDate, { weekStartsOn: 1 }) && 
               !isToday(taskDate) && 
               !isTomorrow(taskDate);
      })
      .map(task => ({ ...task, type: 'task' as const }));
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 py-2">
        <SidebarTrigger className="md:hidden" />
        <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
          <Clock className="h-4 w-4 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">即将到来</h1>
          <p className="text-sm text-gray-500 mt-0.5">今天、明天和本周到期的任务</p>
        </div>
      </div>

      <DndProvider>
        <div className="space-y-6">
          {/* 今天到期 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-red-50 border-b border-red-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-red-600" />
                <h2 className="text-sm font-semibold text-red-900">今天到期</h2>
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-red-700 bg-red-200 rounded-full">
                  {todayTasks.length}
                </span>
              </div>
            </div>
            {todayTasks.length > 0 ? (
              <div className="p-4">
                <TaskList items={todayTasks} droppableId="today-tasks" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                  <Calendar className="h-6 w-6 text-red-500" />
                </div>
                <p className="text-gray-500 text-sm">今天没有到期的任务</p>
              </div>
            )}
          </div>

          {/* 明天到期 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-yellow-50 border-b border-yellow-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-yellow-600" />
                <h2 className="text-sm font-semibold text-yellow-900">明天到期</h2>
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-yellow-700 bg-yellow-200 rounded-full">
                  {tomorrowTasks.length}
                </span>
              </div>
            </div>
            {tomorrowTasks.length > 0 ? (
              <div className="p-4">
                <TaskList items={tomorrowTasks} droppableId="tomorrow-tasks" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                  <Calendar className="h-6 w-6 text-yellow-500" />
                </div>
                <p className="text-gray-500 text-sm">明天没有到期的任务</p>
              </div>
            )}
          </div>

          {/* 本周到期 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-blue-50 border-b border-blue-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-blue-900">本周到期</h2>
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-blue-700 bg-blue-200 rounded-full">
                  {thisWeekTasks.length}
                </span>
              </div>
            </div>
            {thisWeekTasks.length > 0 ? (
              <div className="p-4">
                <TaskList items={thisWeekTasks} droppableId="thisweek-tasks" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
                <p className="text-gray-500 text-sm">本周没有其他到期的任务</p>
              </div>
            )}
          </div>
        </div>
      </DndProvider>
    </div>
  );
}
