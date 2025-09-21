
'use client';

import { TaskList } from '@/components/task-list';
import { useTasksClient } from '@/hooks/use-tasks';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { DndProvider } from '@/components/dnd-provider';
import { Tag, Hash } from 'lucide-react';

export default function TagPage() {
  const params = useParams();
  const { tasks, tags } = useTasksClient();
  const tagId = params.tagId as string;

  const tagTasks = useMemo(() => {
    return tasks
      .filter((task) => task.tagIds.includes(tagId))
      .map(task => ({...task, type: 'task' as const}));
  }, [tasks, tagId]);

  const currentTag = useMemo(() => {
    return tags.find(tag => tag.id === tagId);
  }, [tags, tagId]);

  if (!currentTag) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Tag className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">标签不存在</h3>
        <p className="text-gray-500">找不到请求的标签。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 py-2">
        <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full">
          <Hash className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">#{currentTag.label}</h1>
          <p className="text-sm text-gray-500 mt-0.5">共 {tagTasks.length} 个任务</p>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <DndProvider>
          {tagTasks.length > 0 ? (
            <div className="p-4">
              <TaskList items={tagTasks} droppableId={`tag-${tagId}`} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Hash className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">没有这个标签的任务</h3>
              <p className="text-gray-500 max-w-sm">向任务添加 "#{currentTag.label}" 标签，它们就会显示在这里。</p>
            </div>
          )}
        </DndProvider>
      </div>
    </div>
  );
}
