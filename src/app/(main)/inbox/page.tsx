'use client';

import { TaskList } from '@/components/task-list';
import { useTasksClient } from '@/hooks/use-tasks';
import { useMemo } from 'react';
import { DndProvider } from '@/components/dnd-provider';
import { Inbox } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function InboxPage() {
  const { tasks } = useTasksClient();

  const inboxTasks = useMemo(() => {
    return tasks
      .filter((task) => task.listId === 'inbox')
      .map(task => ({ ...task, type: 'task' as const }));
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 py-2">
        <SidebarTrigger className="md:hidden" />
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
          <Inbox className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">收件箱</h1>
          <p className="text-sm text-gray-500 mt-0.5">所有的新任务都会出现在这里</p>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <DndProvider>
          {inboxTasks.length > 0 ? (
            <div className="p-4">
              <TaskList items={inboxTasks} droppableId="inbox-tasks" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Inbox className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">收件箱为空</h3>
              <p className="text-gray-500 max-w-sm">当您创建新任务时，它们将会显示在这里。开始添加一些任务吧！</p>
            </div>
          )}
        </DndProvider>
      </div>
    </div>
  );
}