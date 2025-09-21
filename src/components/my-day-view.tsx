
'use client';

import React, { useState } from 'react';
import { format, isToday, isTomorrow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { TaskItem } from './task-item';
import { AddTaskDialog } from './add-task-dialog';
import { AddEventDialog } from './add-event-dialog';
import { SchedulePreferencesDialog } from './schedule-preferences-dialog';
import { OverdueTasksAlert } from './overdue-tasks-alert';
import { useTasksClient, useTasksDispatch } from '@/hooks/use-tasks';
import { Task, UserSchedulePreferences } from '@/lib/types';
import { Plus, Calendar, Clock, Sparkles, Settings, AlertTriangle, CheckCircle, ChevronDown, Zap, Cpu, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ViewModeToggle } from './view-mode-toggle';
import { autoPlanTasks } from '@/lib/local-scheduler';
import { Alert, AlertDescription } from './ui/alert';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from './ui/progress';
import { SidebarTrigger } from './ui/sidebar';

interface MyDayViewProps {
  viewMode: 'compact' | 'detailed';
  onSwitchViewMode: (mode: 'compact' | 'detailed') => void;
}

export function MyDayView({ viewMode, onSwitchViewMode }: MyDayViewProps) {
  const { tasks, events } = useTasksClient();
  const dispatch = useTasksDispatch();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [defaultListId, setDefaultListId] = useState<string | undefined>(undefined);
  const [taskType, setTaskType] = useState<'flexible' | 'scheduled'>('flexible'); // 任务类型切换
  const [isScheduling, setIsScheduling] = useState(false); // 智能调度状态
  const [showGifAnimation, setShowGifAnimation] = useState(false); // GIF动画显示状态
  
  // 用户偏好设置（可以从 localStorage 或数据库获取）
  const [preferences, setPreferences] = useState<UserSchedulePreferences>({
    workStart: '08:30',
    lunchBreakStart: '11:30',
    lunchBreakEnd: '13:00', 
    dinnerBreakStart: '17:30',
    dinnerBreakEnd: '18:30',
    sleepTime: '22:30',
    taskInterval: 15,
    allowOverlap: false,
    defaultTaskDuration: 15
  });

  // 获取今天的日期
  const today = new Date();
  
  // 筛选今天和明天的事件
  const todaysEvents = events.filter(event => isToday(new Date(event.startTime)));
  const tomorrowsEvents = events.filter(event => isTomorrow(new Date(event.startTime)));
  
  // 筛选"My Day"列表中的任务
  const myDayTasks = tasks.filter(task => 
    task.isMyDay && !task.completed
  );
  
  // 重新分类任务：
  // 1. 日程安排：固定时间的任务（fixedTime=true 且有 startTime）
  // 2. 灵活任务：可调度的任务（fixedTime=false 或未设置）
  const scheduledTasks = myDayTasks.filter(task => task.fixedTime && task.startTime);
  const flexibleTasks = myDayTasks.filter(task => !task.fixedTime);
  
  // 筛选已完成的任务
  const completedTasks = tasks.filter(task => 
    task.isMyDay && task.completed
  );
  
  // 检查超时任务（从所有任务中筛选，不只是myDay）
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    return new Date() > new Date(task.dueDate);
  });
  
  // 灵活任务排序：开始时刻 > 是否重要 > 创建时间
  const sortedFlexibleTasks = [...flexibleTasks].sort((a, b) => {
    // 1. 开始时刻优先（有开始时间的任务优先）
    if (a.startTime && !b.startTime) return -1;
    if (!a.startTime && b.startTime) return 1;
    if (a.startTime && b.startTime) {
      const aTime = new Date(a.startTime).getTime();
      const bTime = new Date(b.startTime).getTime();
      if (aTime !== bTime) return aTime - bTime;
    }
    
    // 2. 是否重要
    if (a.isImportant && !b.isImportant) return -1;
    if (!a.isImportant && b.isImportant) return 1;
    
    // 3. 创建时间
    const aCreated = new Date(a.createdAt).getTime();
    const bCreated = new Date(b.createdAt).getTime();
    return aCreated - bCreated;
  });
  
  // 日程安排任务排序：按开始时间排序
  const sortedScheduledTasks = [...scheduledTasks].sort((a, b) => {
    if (!a.startTime || !b.startTime) return 0;
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
  
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

  const handleAddTask = (taskType: 'flexible' | 'scheduled' = 'flexible') => {
    setTaskType(taskType);
    setDefaultListId(undefined);
    setIsAddDialogOpen(true);
  };
  
  const handleAddScheduledTask = () => {
    handleAddTask('scheduled');
  };
  
  const handleAddFlexibleTask = () => {
    handleAddTask('flexible');
  };
  
  const handleAutoSchedule = async () => {
    if (isScheduling) return; // 防止重复点击
    
    setIsScheduling(true);
    
    try {
      const result = await autoPlanTasks(tasks, events, handleScheduleUpdate, preferences);
      
      // 统计调度结果
      const totalScheduled = result.scheduledTasks.length;
      const totalOverdue = result.overdueTasks.length;
      const totalUnscheduled = result.unscheduledTasks.length;
      
      // 显示GIF动画
      setIsScheduling(false);
      setShowGifAnimation(true);
      
      // 3秒后关闭GIF动画
      setTimeout(() => {
        setShowGifAnimation(false);
        
        // 显示调度结果
        if (totalScheduled > 0) {
          let description = `已为 ${totalScheduled} 个任务安排了时间`;
          
          if (totalOverdue > 0) {
            // 检查超期任务中有多少被成功调度
            const scheduledOverdueCount = result.overdueTasks.filter(task => 
              result.scheduledTasks.some(scheduled => scheduled.id === task.id)
            ).length;
            
            if (scheduledOverdueCount > 0) {
              description += `，其中 ${scheduledOverdueCount} 个超期任务已重新安排`;
            }
          }
          
          toast({
            title: "智能调度完成",
            description: description
          });
        } else {
          toast({
            title: "调度结果",
            description: "没有需要调度的任务或没有可用时间"
          });
        }
        
        if (totalUnscheduled > 0) {
          toast({
            title: "⚠️ 提示", 
            description: `有 ${totalUnscheduled} 个任务无法安排，请调整时间设置`
          });
        }
      }, 3000);
      
    } catch (error) {
      console.error('智能调度失败:', error);
      toast({
        title: "❌ 错误",
        description: "智能调度过程中出现错误，请稍后重试",
        variant: "destructive"
      });
      setIsScheduling(false);
      setShowGifAnimation(false);
    }
  };
  

  
  const handleRescheduleOverdue = (taskIds: string[]) => {
    // 重新安排超期任务的逻辑
    taskIds.forEach(taskId => {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        // 清除固定时间属性，让任务可以重新调度
        dispatch({
          type: 'UPDATE_TASK',
          payload: { ...task, fixedTime: false, startTime: undefined }
        });
      }
    });
    
    toast({
      title: "任务已重置",
      description: "超期任务已清除时间安排，可重新调度"
    });
  };
  
  const handleMarkOverdueImportant = (taskIds: string[]) => {
    taskIds.forEach(taskId => {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        dispatch({
          type: 'UPDATE_TASK',
          payload: { ...task, isImportant: true }
        });
      }
    });
    
    toast({
      title: "已标记重要",
      description: `${taskIds.length} 个超期任务已标记为重要`
    });
  };
  
  const handleSavePreferences = (newPreferences: UserSchedulePreferences) => {
    setPreferences(newPreferences);
    // TODO: 保存到 localStorage 或数据库
    toast({
      title: "设置已保存",
      description: "您的作息设置已更新"
    });
  };

  return (
    <div className="flex-1 flex flex-col relative">
      {/* 智能调度动画覆盖层 */}
      <AnimatePresence>
        {showGifAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/20 backdrop-blur-md flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,01) 0%, rgba(255,255,255,01) 0%)'
              }}
            >
              <div className="text-center space-y-4">
                {/* GIF动画 */}
                <div className="flex justify-center">
                  <img 
                    src="/ai/done.gif" 
                    alt="智能调度完成" 
                    className="w-40 h-40 object-contain"
                  />
                </div>
                

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 顶部标题和控件 */}
      <div className="flex items-center justify-between py-6 px-1">
        <div className="flex items-center gap-3">
          {/* Sidebar trigger for mobile */}
          <SidebarTrigger className="md:hidden" />
          
          {/* Icon + Title + Description */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Sun className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">我的一天</h1>
              <p className="text-sm text-gray-500 mt-1">
                {format(today, 'MM月dd日 EEEE', { locale: zhCN })}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ViewModeToggle viewMode={viewMode} onSwitchViewMode={onSwitchViewMode} />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreferencesOpen(true)}
            className="h-9 px-3 border-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <motion.div 
            className="relative"
            animate={isScheduling ? { scale: [1, 1.02, 1] } : { scale: 1 }}
            transition={{ duration: 3, repeat: isScheduling ? Infinity : 0, ease: "easeInOut" }}
          >
            <Button
              onClick={handleAutoSchedule}
              disabled={isScheduling}
              className={`h-9 px-4 relative overflow-hidden transition-all duration-500 ease-out rounded-full shadow-sm border-0 ${                isScheduling 
                  ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 text-indigo-600 hover:from-blue-50 hover:to-indigo-50'
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-600 hover:from-blue-100 hover:to-indigo-100 hover:shadow-md'
              }`}
              style={{
                background: isScheduling 
                  ? 'linear-gradient(90deg, #eff6ff 0%, #eef2ff 50%, #eff6ff 100%)'
                  : 'linear-gradient(90deg, #eff6ff 0%, #eef2ff 100%)'
              }}
            >
              {/* 背景光效 */}
              {isScheduling && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              
              {/* 图标动画 */}
              <motion.div
                animate={isScheduling ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 3, repeat: isScheduling ? Infinity : 0, ease: 'easeInOut' }}
                className="mr-2"
              >
                {isScheduling ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </motion.div>
              
              {/* 文字动画 */}
              <AnimatePresence mode="wait">
                <motion.span
                  key={isScheduling ? 'scheduling' : 'idle'}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="font-medium"
                >
                  {isScheduling ? 'AI智能调度中...' : '智能调度'}
                </motion.span>
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* 超期任务警告 */}
      <OverdueTasksAlert
        tasks={overdueTasks}
        onReschedule={handleRescheduleOverdue}
        onMarkImportant={handleMarkOverdueImportant}
      />

      {/* 日程安排任务区域 */}
      {sortedScheduledTasks.length > 0 && (
        <div className="py-4 border-b">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-medium text-muted-foreground">日程安排</h2>
          </div>
          <div className="space-y-2">
            {sortedScheduledTasks.map((task, index) => (
              <TaskItem 
                key={task.id} 
                item={{...task, type: 'task'}} 
                viewMode={viewMode}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* 日程安排（事件和固定时间任务） */}
      {((todaysEvents.length > 0 || tomorrowsEvents.length > 0) || sortedScheduledTasks.length > 0) && (
        <div className="py-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-muted-foreground">固定日程</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEventDialogOpen(true)}
              className="border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              
            </Button>
          </div>
          <div className="space-y-2">
            {/* 固定时间任务 */}
            {sortedScheduledTasks.map((task, index) => (
              <TaskItem 
                key={task.id} 
                item={{...task, type: 'task'}} 
                viewMode={viewMode}
                index={index}
              />
            ))}
            
            {/* 事件（作为可编辑的任务显示） */}
            {todaysEvents.map((event, index) => (
              <TaskItem 
                key={event.id} 
                item={{...event, type: 'event'}} 
                viewMode={viewMode}
                index={index + sortedScheduledTasks.length}
              />
            ))}
            {tomorrowsEvents.map((event, index) => (
              <TaskItem 
                key={event.id} 
                item={{...event, type: 'event', title: `明天: ${event.title}`}} 
                viewMode={viewMode}
                index={index + sortedScheduledTasks.length + todaysEvents.length}
              />
            ))}
          </div>
        </div>
      )}

      {/* 灵活任务区域 */}
      <div className="flex-1 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-medium text-muted-foreground">灵活任务</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddFlexibleTask}
            className="border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            
          </Button>
        </div>
        
        {sortedFlexibleTasks.length > 0 ? (
          <div className="space-y-2">
            {sortedFlexibleTasks.map((task, index) => (
              <TaskItem 
                key={task.id} 
                item={{...task, type: 'task'}} 
                viewMode={viewMode}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center border-2 border-dashed border-gray-200 rounded-lg">
            <Sparkles className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">没有灵活任务</p>
          </div>
        )}
      </div>

      {/* 超时任务模块 */}
      {overdueTasks.length > 0 && (
        <div className="py-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-medium text-red-600">超时任务 ({overdueTasks.length})</h2>
          </div>
          <div className="space-y-2">
            {overdueTasks.map((task, index) => (
              <TaskItem 
                key={task.id} 
                item={{...task, type: 'task'}} 
                viewMode={viewMode}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* 已完成任务 */}
      {completedTasks.length > 0 && (
        <div className="py-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <h2 className="text-sm font-medium text-muted-foreground">已完成 ({completedTasks.length})</h2>
          </div>
          <div className="space-y-2">
            {completedTasks.map((task, index) => (
              <TaskItem 
                key={task.id} 
                item={{...task, type: 'task'}} 
                viewMode={viewMode}
                index={index}
                isDragDisabled={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* 对话框 */}
      <AddTaskDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        defaultListId={defaultListId}
      />
      
      <AddEventDialog 
        open={isEventDialogOpen} 
        onOpenChange={setIsEventDialogOpen}
      />
      
      <SchedulePreferencesDialog
        open={isPreferencesOpen}
        onOpenChange={setIsPreferencesOpen}
        preferences={preferences}
        onSave={handleSavePreferences}
      />
    </div>
  );
}
