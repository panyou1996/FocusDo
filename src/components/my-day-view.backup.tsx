
'use client';

import { useState } from 'react';
import { format, isToday, isTomorrow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { TaskItem } from './task-item';
import { AddTaskDialog } from './add-task-dialog';
import { useTasks, useTasksDispatch } from '@/hooks/use-tasks';
import { Task } from '@/lib/types';
import { Plus, Calendar, Clock, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { ViewModeToggle } from './view-mode-toggle';
import { autoPlanTasks } from '@/lib/local-scheduler';

interface MyDayViewProps {
  viewMode: 'compact' | 'detailed';
  onSwitchViewMode: (mode: 'compact' | 'detailed') => void;
}

export function MyDayView({ viewMode, onSwitchViewMode }: MyDayViewProps) {
  const { tasks, events } = useTasks();
  const dispatch = useTasksDispatch();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [defaultListId, setDefaultListId] = useState<string | undefined>(undefined);

  // 获取今天的日期
  const today = new Date();
  
  // 筛选今天和明天的事件
  const todaysEvents = events.filter(event => isToday(new Date(event.startTime)));
  const tomorrowsEvents = events.filter(event => isTomorrow(new Date(event.startTime)));
  
  // 筛选"My Day"列表中的任务（排除已完成的）
  const myDayTasks = tasks.filter(task => 
    task.isMyDay && !task.completed
  );
  
  // 合并事件和任务，并按时间排序
  const scheduledItems = [
    ...todaysEvents.map(event => ({
      ...event,
      type: 'event' as const,
      time: new Date(event.startTime)
    })),
    ...myDayTasks
      .filter(task => task.startTime)
      .map(task => ({
        ...task,
        type: 'task' as const,
        time: new Date(task.startTime!)
      }))
  ].sort((a, b) => a.time.getTime() - b.time.getTime());

  const handleScheduleUpdate = (scheduledTasks: { id: string; startTime: string }[]) => {
    scheduledTasks.forEach(({ id, startTime }) => {
      const task = tasks.find(t => t.id === id);
      if (task) {
        dispatch({ 
          type: 'UPDATE_TASK', 
          payload: { ...task, startTime } 
        });
      }
    });
  };

  const handleAddTask = (listId?: string) => {
    setDefaultListId(listId);
    setIsAddDialogOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* 顶部标题和控件 */}
      <div className="flex items-center justify-between py-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">我的一天</h1>
          <p className="text-sm text-muted-foreground">
            {format(today, 'MM月dd日 EEEE', { locale: zhCN })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewModeToggle viewMode={viewMode} onSwitchViewMode={onSwitchViewMode} />
          <button 
            onClick={async () => {
              try {
                const result = await autoPlanTasks(tasks, events, handleScheduleUpdate);
                if (result && result.length > 0) {
                  alert(`任务已根据您的日程自动安排，共调度 ${result.length} 个任务`);
                } else {
                  alert("没有需要调度的任务");
                }
              } catch (error) {
                console.error('本地调度失败:', error);
                alert("本地调度过程中出现错误，请稍后重试");
              }
            }}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>智能调度</span>
          </button>
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 今天和明天的事件 */}
      {(todaysEvents.length > 0 || tomorrowsEvents.length > 0) && (
        <div className="py-4 border-b">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">今天和明天</h2>
          <div className="space-y-2">
            {todaysEvents.map(event => (
              <div key={event.id} className="flex items-center gap-2 p-2 rounded hover:bg-accent">
                <Calendar className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.startTime), 'HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
                  </p>
                </div>
              </div>
            ))}
            {tomorrowsEvents.map(event => (
              <div key={event.id} className="flex items-center gap-2 p-2 rounded hover:bg-accent">
                <Calendar className="h-4 w-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">明天: {event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.startTime), 'MM/dd HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 任务列表 */}
      <div className="flex-1 py-4">
        {myDayTasks.length > 0 ? (
          <div className="space-y-2">
            {myDayTasks.map((task, index) => (
              <TaskItem 
                key={task.id} 
                item={{...task, type: 'task'}} 
                viewMode={viewMode}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">没有任务</h3>
            <p className="text-muted-foreground mb-4">添加一些任务到"我的一天"列表</p>
            <Button onClick={() => handleAddTask()}>
              <Plus className="h-4 w-4 mr-2" />
              添加任务
            </Button>
          </div>
        )}
      </div>

      {/* 已完成任务 */}
      <div className="py-4 border-t">
        <h2 className="text-sm font-medium text-muted-foreground mb-2">已完成</h2>
        <div className="text-sm text-muted-foreground">
          没有已完成的任务
        </div>
      </div>

      <AddTaskDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        defaultListId={defaultListId}
      />
    </div>
  );
}
