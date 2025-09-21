
'use client';

import { TaskList } from '@/components/task-list';
import { useTasksClient } from '@/hooks/use-tasks';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { DndProvider } from '@/components/dnd-provider';
import * as Lucide from 'lucide-react';

export default function ListPage() {
  const params = useParams();
  const { tasks, lists } = useTasksClient();
  const listId = params.listId as string;

  const listTasks = useMemo(() => {
    return tasks
      .filter((task) => task.listId === listId)
      .map(task => ({ ...task, type: 'task' as const }));
  }, [tasks, listId]);

  const currentList = useMemo(() => {
    return lists.find(list => list.id === listId);
  }, [lists, listId]);

  if (!currentList) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Lucide.AlertCircle className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">列表不存在</h3>
        <p className="text-gray-500">找不到请求的列表。</p>
      </div>
    );
  }

  const IconComponent = (Lucide[currentList.icon as keyof typeof Lucide] as any) || Lucide.List;
  const colorClasses = {
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    gray: 'bg-gray-100 text-gray-600',
    pink: 'bg-pink-100 text-pink-600',
    brown: 'bg-amber-100 text-amber-600'
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 py-2">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          colorClasses[currentList.color || 'blue']
        }`}>
          <IconComponent className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{currentList.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">共 {listTasks.length} 个任务</p>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <DndProvider>
          {listTasks.length > 0 ? (
            <div className="p-4">
              <TaskList items={listTasks} droppableId={`list-${listId}`} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                colorClasses[currentList.color || 'blue']
              }`}>
                <IconComponent className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">这个列表为空</h3>
              <p className="text-gray-500 max-w-sm">开始向这个列表添加一些任务吧！</p>
            </div>
          )}
        </DndProvider>
      </div>
    </div>
  );
}
