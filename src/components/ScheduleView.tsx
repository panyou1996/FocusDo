'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, parseISO, isToday, addMinutes, isAfter, isBefore, set, addDays } from 'date-fns';
import { Task, CalendarEvent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Settings } from 'lucide-react';
import { SchedulerPreferences } from '@/components/scheduler-preferences';
import { UserPreferences, autoPlanTasks as smartAutoPlanTasks } from '@/lib/local-scheduler';

interface ScheduleViewProps {
  tasks: Task[];
  events: CalendarEvent[];
  onScheduleUpdate: (scheduledTasks: { id: string; startTime: string }[]) => void;
}

interface FreeBlock {
  start: Date;
  end: Date;
}

interface ScheduledTask {
  id: string;
  startTime: string;
}

const DEFAULT_USER_SCHEDULE = 'Works from 8:30 to 11:30, breaks for lunch, works again from 13:00 to 17:30, breaks for dinner, and is free from 18:30 to 22:00.';

export function ScheduleView({ tasks, events, onScheduleUpdate }: ScheduleViewProps) {
  const { toast } = useToast();
  const [isScheduling, setIsScheduling] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    workHours: {
      morningStart: "08:30",
      morningEnd: "11:30",
      afternoonStart: "13:00", 
      afternoonEnd: "17:30",
      eveningStart: "18:30",
      eveningEnd: "22:00"
    },
    breakDuration: 15,
    preferredTaskTypes: {
      morning: ["creative", "focused"],
      afternoon: ["analytical", "meeting"],
      evening: ["learning", "general"]
    },
    maxTasksPerDay: 10
  });

  // 生成时间槽 (6:00 - 23:00)
  const timeSlots = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => {
      const hour = i + 6;
      return set(new Date(), { hours: hour, minutes: 0, seconds: 0, milliseconds: 0 });
    });
  }, []);

  // 获取指定时间段内的任务
  const getTasksInTimeSlot = (hour: number, tasks: Task[]) => {
    return tasks.filter(task => {
      if (!task.startTime) return false;
      const taskStart = parseISO(task.startTime);
      return taskStart.getHours() === hour && isToday(taskStart);
    });
  };

  // 获取重叠的任务
  const getOverlappingTasks = (tasks: Task[]) => {
    return tasks.filter(task => {
      if (!task.startTime || !task.duration) return false;
      const taskStart = parseISO(task.startTime);
      const taskEnd = addMinutes(taskStart, task.duration);
      
      return tasks.some(otherTask => {
        if (otherTask.id === task.id || !otherTask.startTime || !otherTask.duration) return false;
        const otherStart = parseISO(otherTask.startTime);
        const otherEnd = addMinutes(otherStart, otherTask.duration);
        
        return (
          (isAfter(taskStart, otherStart) && isBefore(taskStart, otherEnd)) ||
          (isAfter(taskEnd, otherStart) && isBefore(taskEnd, otherEnd)) ||
          (isBefore(taskStart, otherStart) && isAfter(taskEnd, otherEnd))
        );
      });
    });
  };

  // 获取任务布局信息
  const getTaskLayout = (task: Task, overlappingTasks: Task[], index: number) => {
    if (!task.startTime || !task.duration) return { width: '100%', left: '0%' };
    
    const overlapGroup = overlappingTasks.filter(t => t.id !== task.id && t.startTime);
    const totalOverlaps = overlapGroup.length + 1;
    const width = `${100 / totalOverlaps}%`;
    const left = `${(index / totalOverlaps) * 100}%`;
    
    return { width, left };
  };

  // 生成空闲时间段
  const generateFreeBlocks = (): FreeBlock[] => {
    const today = new Date();
    const blocks: FreeBlock[] = [];
    
    // 上午工作时间: 8:30 - 11:30
    blocks.push({
      start: set(today, { hours: 8, minutes: 30, seconds: 0, milliseconds: 0 }),
      end: set(today, { hours: 11, minutes: 30, seconds: 0, milliseconds: 0 })
    });
    
    // 下午工作时间: 13:00 - 17:30
    blocks.push({
      start: set(today, { hours: 13, minutes: 0, seconds: 0, milliseconds: 0 }),
      end: set(today, { hours: 17, minutes: 30, seconds: 0, milliseconds: 0 })
    });
    
    // 晚上自由时间: 18:30 - 22:00
    blocks.push({
      start: set(today, { hours: 18, minutes: 30, seconds: 0, milliseconds: 0 }),
      end: set(today, { hours: 22, minutes: 0, seconds: 0, milliseconds: 0 })
    });
    
    return blocks;
  };

  // 切割空闲时间段，考虑固定事件和15分钟间隔
  const cutFreeBlocks = (freeBlocks: FreeBlock[], events: CalendarEvent[], scheduledTasks: Task[]): FreeBlock[] => {
    const today = new Date();
    let result: FreeBlock[] = [...freeBlocks];
    
    // 处理固定事件
    events
      .filter(event => isToday(parseISO(event.startTime)))
      .forEach(event => {
        const eventStart = parseISO(event.startTime);
        const eventEnd = parseISO(event.endTime);
        
        result = result.flatMap(block => {
          // 事件完全在块之前或之后
          if (isBefore(eventEnd, block.start) || isAfter(eventStart, block.end)) {
            return [block];
          }
          
          const newBlocks: FreeBlock[] = [];
          
          // 如果事件开始时间在块内，添加事件前的空闲时间
          if (isAfter(eventStart, block.start)) {
            newBlocks.push({
              start: block.start,
              end: eventStart
            });
          }
          
          // 如果事件结束时间在块内，添加事件后的空闲时间
          if (isBefore(eventEnd, block.end)) {
            // 添加15分钟间隔
            const breakEnd = addMinutes(eventEnd, 15);
            if (isBefore(breakEnd, block.end)) {
              newBlocks.push({
                start: breakEnd,
                end: block.end
              });
            }
          }
          
          return newBlocks;
        });
      });
    
    // 处理已调度的任务
    scheduledTasks
      .filter(task => task.startTime && task.duration)
      .forEach(task => {
        const taskStart = parseISO(task.startTime!);
        const taskEnd = addMinutes(taskStart, task.duration!);
        
        result = result.flatMap(block => {
          // 任务完全在块之前或之后
          if (isBefore(taskEnd, block.start) || isAfter(taskStart, block.end)) {
            return [block];
          }
          
          const newBlocks: FreeBlock[] = [];
          
          // 如果任务开始时间在块内，添加任务前的空闲时间
          if (isAfter(taskStart, block.start)) {
            newBlocks.push({
              start: block.start,
              end: taskStart
            });
          }
          
          // 如果任务结束时间在块内，添加任务后的空闲时间
          if (isBefore(taskEnd, block.end)) {
            // 添加15分钟间隔
            const breakEnd = addMinutes(taskEnd, 15);
            if (isBefore(breakEnd, block.end)) {
              newBlocks.push({
                start: breakEnd,
                end: block.end
              });
            }
          }
          
          return newBlocks;
        });
      });
    
    return result;
  };

  // 按优先级排序任务
  const sortDynamicTasks = (tasks: Task[]): Task[] => {
    return [...tasks].sort((a, b) => {
      // 1. 重要任务优先
      if (a.isImportant && !b.isImportant) return -1;
      if (!a.isImportant && b.isImportant) return 1;
      
      // 2. 有截止日期的任务优先
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      // 3. 截止日期早的任务优先
      if (a.dueDate && b.dueDate) {
        const aDue = parseISO(a.dueDate);
        const bDue = parseISO(b.dueDate);
        if (isBefore(aDue, bDue)) return -1;
        if (isAfter(aDue, bDue)) return 1;
      }
      
      // 4. 持续时间长的任务优先
      const aDuration = a.duration || 0;
      const bDuration = b.duration || 0;
      if (aDuration > bDuration) return -1;
      if (aDuration < bDuration) return 1;
      
      return 0;
    });
  };

  // 检查任务是否能适应空闲块
  const canTaskFitInBlock = (task: Task, block: FreeBlock): boolean => {
    if (!task.duration) return false;
    
    const taskDuration = task.duration;
    const blockDuration = (block.end.getTime() - block.start.getTime()) / (1000 * 60); // 转换为分钟
    
    return taskDuration <= blockDuration;
  };

  // 在空闲块中安排任务
  const scheduleTaskInBlock = (task: Task, block: FreeBlock): { scheduledTask: ScheduledTask; remainingBlock: FreeBlock | null } => {
    if (!task.duration) {
      throw new Error('Task duration is required');
    }
    
    // 任务开始时间就是块的开始时间
    const startTime = block.start.toISOString();
    
    // 计算任务结束时间
    const endTime = addMinutes(block.start, task.duration).toISOString();
    
    // 创建调度任务对象
    const scheduledTask: ScheduledTask = {
      id: task.id,
      startTime
    };
    
    // 计算剩余的空闲块（任务结束后加上15分钟间隔）
    const breakEnd = addMinutes(parseISO(endTime), 15);
    const remainingBlock = isBefore(breakEnd, block.end) ? {
      start: breakEnd,
      end: block.end
    } : null;
    
    return { scheduledTask, remainingBlock };
  };

  // 本地调度处理函数
  const handleAutoPlan = async () => {
    setIsScheduling(true);
    toast({ title: '🤖 正在优化您的日程...', description: 'AI调度器正在分析您的任务和偏好设置。' });
    
    try {
        // 使用增强版智能调度算法
        const scheduledTasksResult = await smartAutoPlanTasks(
          tasks,
          events,
          (scheduledTasks) => {
            // 直接调用更新回调函数
            onScheduleUpdate(scheduledTasks);
          },
          userPreferences
        );
      
      // 获取未完成的"My Day"任务用于统计
      const myDayTasks = tasks.filter(task => task.isMyDay && !task.completed);
      const unscheduledCount = myDayTasks.length - scheduledTasksResult.length;
      
      // 显示智能调度结果
      if (scheduledTasksResult.length > 0) {
        let description = `成功安排了 ${scheduledTasksResult.length} 个任务`;
        
        if (unscheduledCount > 0) {
          description += `，${unscheduledCount} 个任务因时间不足未安排`;
        }
        
        toast({ 
          title: '✅ 智能调度完成！', 
          description: description
        });
      } else {
        toast({ 
          title: '⚠️ 调度挑战', 
          description: '没有足够的空闲时间来安排任务。请考虑调整任务时长或您的可用时间。'
        });
      }
    } catch (error) {
      console.error('Failed to schedule tasks:', error);
      toast({ 
        variant: 'destructive', 
        title: '调度失败', 
        description: 'AI调度器遇到错误，请重试。'
      });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-4 space-y-3">
      <div className="flex items-center gap-3">
        <Button 
          onClick={handleAutoPlan} 
          disabled={isScheduling}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {isScheduling ? '智能调度中...' : '智能调度'}
        </Button>
        
        <SchedulerPreferences 
          preferences={userPreferences}
          onPreferencesChange={setUserPreferences}
        />
      </div>
      
      <div className="text-sm text-muted-foreground text-center max-w-md">
        <p>基于您的工作时间和任务偏好，智能安排今日任务</p>
        <p className="text-xs mt-1">
          当前设置: {userPreferences.workHours.morningStart}-{userPreferences.workHours.morningEnd} | 
          {userPreferences.workHours.afternoonStart}-{userPreferences.workHours.afternoonEnd} | 
          {userPreferences.workHours.eveningStart}-{userPreferences.workHours.eveningEnd}
        </p>
      </div>
    </div>
  );
}