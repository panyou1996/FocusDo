'use client';

import { TaskList } from '@/components/task-list';
import { useTasksClient } from '@/hooks/use-tasks';
import { useMemo } from 'react';
import { DndProvider } from '@/components/dnd-provider';
import { Star } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function ImportantPage() {
  const { tasks } = useTasksClient();

  const importantTasks = useMemo(() => {
    return tasks
      .filter((task) => task.isImportant)
      .map(task => ({ ...task, type: 'task' as const }));
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 py-2">
        <SidebarTrigger className="md:hidden" />
        <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
          <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">重要</h1>
          <p className="text-sm text-gray-500 mt-0.5">标记为重要的任务</p>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <DndProvider>
          {importantTasks.length > 0 ? (
            <div className="p-4">
              <TaskList items={importantTasks} droppableId="important-tasks" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">没有重要任务</h3>
              <p className="text-gray-500 max-w-sm">点击任务旁边的星号来标记为重要任务。</p>
            </div>
          )}
        </DndProvider>
      </div>
    </div>
  );
}