import { Task, CalendarEvent, UserSchedulePreferences } from '@/lib/types';
import { format, parseISO, isToday, addMinutes, isAfter, isBefore, set, addDays, startOfDay, endOfDay, isBefore as isBeforeDate } from 'date-fns';

interface TimeBlock {
  start: Date;
  end: Date;
  type: 'work' | 'break' | 'free';
}

interface ScheduledTask {
  id: string;
  startTime: string;
}

interface ScheduleResult {
  scheduledTasks: ScheduledTask[];
  overdueTasks: Task[]; // 超过截止日期的任务
  unscheduledTasks: Task[]; // 无法安排的任务
}

// 默认用户作息设置
const DEFAULT_PREFERENCES: UserSchedulePreferences = {
  workStart: '08:30',
  lunchBreakStart: '11:30', 
  lunchBreakEnd: '13:00',
  dinnerBreakStart: '17:30',
  dinnerBreakEnd: '18:30',
  sleepTime: '22:30',
  taskInterval: 15,
  allowOverlap: false,
  defaultTaskDuration: 15
};

// 生成一天的时间块
export const generateDayTimeBlocks = (date: Date, preferences: UserSchedulePreferences): TimeBlock[] => {
  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return set(date, { hours, minutes, seconds: 0, milliseconds: 0 });
  };

  const blocks: TimeBlock[] = [];
  
  // 上午工作时间
  blocks.push({
    start: parseTime(preferences.workStart),
    end: parseTime(preferences.lunchBreakStart),
    type: 'work'
  });
  
  // 下午工作时间  
  blocks.push({
    start: parseTime(preferences.lunchBreakEnd),
    end: parseTime(preferences.dinnerBreakStart), 
    type: 'work'
  });
  
  // 晚上自由时间
  blocks.push({
    start: parseTime(preferences.dinnerBreakEnd),
    end: parseTime(preferences.sleepTime),
    type: 'free'
  });
  
  return blocks;
};

// 从时间块中排除已占用的时间
export const excludeOccupiedTime = (
  blocks: TimeBlock[], 
  events: CalendarEvent[], 
  fixedTasks: Task[],
  preferences: UserSchedulePreferences
): TimeBlock[] => {
  let availableBlocks = [...blocks];
  
  // 排除固定事件的时间
  events.filter(event => isToday(parseISO(event.startTime))).forEach(event => {
    const eventStart = parseISO(event.startTime);
    const eventEnd = parseISO(event.endTime);
    
    availableBlocks = availableBlocks.flatMap(block => {
      if (isBefore(eventEnd, block.start) || isAfter(eventStart, block.end)) {
        return [block];
      }
      
      const newBlocks: TimeBlock[] = [];
      
      if (isAfter(eventStart, block.start)) {
        newBlocks.push({
          ...block,
          end: eventStart
        });
      }
      
      if (isBefore(eventEnd, block.end)) {
        const breakEnd = addMinutes(eventEnd, preferences.taskInterval);
        if (isBefore(breakEnd, block.end)) {
          newBlocks.push({
            ...block,
            start: breakEnd
          });
        }
      }
      
      return newBlocks;
    });
  });
  
  // 排除固定时间任务
  fixedTasks.filter(task => task.startTime && task.duration).forEach(task => {
    const taskStart = parseISO(task.startTime!);
    const taskEnd = addMinutes(taskStart, task.duration!);
    
    availableBlocks = availableBlocks.flatMap(block => {
      if (isBefore(taskEnd, block.start) || isAfter(taskStart, block.end)) {
        return [block];
      }
      
      const newBlocks: TimeBlock[] = [];
      
      if (isAfter(taskStart, block.start)) {
        newBlocks.push({
          ...block,
          end: taskStart
        });
      }
      
      if (isBefore(taskEnd, block.end)) {
        const breakEnd = addMinutes(taskEnd, preferences.taskInterval);
        if (isBefore(breakEnd, block.end)) {
          newBlocks.push({
            ...block,
            start: breakEnd
          });
        }
      }
      
      return newBlocks;
    });
  });
  
  return availableBlocks.filter(block => {
    const duration = (block.end.getTime() - block.start.getTime()) / (1000 * 60);
    return duration >= 5; // 至少5分钟的块才有用
  });
};

// 按优先级排序任务
export const sortTasksByPriority = (tasks: Task[]): Task[] => {
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

// 尝试将任务安排到时间块中
export const scheduleTasksInBlocks = (
  tasks: Task[], 
  blocks: TimeBlock[],
  preferences: UserSchedulePreferences
): { scheduled: ScheduledTask[], unscheduled: Task[] } => {
  const scheduled: ScheduledTask[] = [];
  const unscheduled: Task[] = [];
  let availableBlocks = [...blocks];
  const currentTime = new Date();
  
  for (const task of tasks) {
    const duration = task.duration || preferences.defaultTaskDuration;
    let taskScheduled = false;
    
    for (let i = 0; i < availableBlocks.length; i++) {
      const block = availableBlocks[i];
      const blockDuration = (block.end.getTime() - block.start.getTime()) / (1000 * 60);
      
      // 确保任务开始时间不早于当前时间
      const earliestStart = isAfter(block.start, currentTime) ? block.start : currentTime;
      const adjustedBlockDuration = (block.end.getTime() - earliestStart.getTime()) / (1000 * 60);
      
      if (adjustedBlockDuration >= duration && isBefore(earliestStart, block.end)) {
        // 安排任务
        scheduled.push({
          id: task.id,
          startTime: earliestStart.toISOString()
        });
        
        // 更新可用时间块
        const taskEnd = addMinutes(earliestStart, duration);
        const nextStart = addMinutes(taskEnd, preferences.taskInterval);
        
        if (isBefore(nextStart, block.end)) {
          availableBlocks[i] = {
            ...block,
            start: nextStart
          };
        } else {
          availableBlocks.splice(i, 1);
        }
        
        taskScheduled = true;
        break;
      }
    }
    
    if (!taskScheduled) {
      unscheduled.push(task);
    }
  }
  
  return { scheduled, unscheduled };
};

// 主要的自动规划函数
export const autoPlanTasks = async (
  allTasks: Task[], 
  events: CalendarEvent[],
  onScheduleUpdate: (scheduledTasks: ScheduledTask[]) => void,
  userPreferences?: UserSchedulePreferences
): Promise<ScheduleResult> => {
  const preferences = userPreferences || DEFAULT_PREFERENCES;
  const today = new Date();
  
  // 筛选今天的任务
  const myDayTasks = allTasks.filter(task => 
    task.isMyDay && !task.completed
  );
  
  // 分类任务：固定时间 vs 可调度
  const fixedTasks = myDayTasks.filter(task => task.fixedTime && task.startTime);
  const flexibleTasks = myDayTasks.filter(task => !task.fixedTime);
  
  // 检查超期任务，但仍然允许调度
  const currentTime = new Date();
  const overdueTasks: Task[] = [];
  
  // 标记超期任务，但仍然参与调度
  flexibleTasks.forEach(task => {
    if (task.dueDate && isBefore(parseISO(task.dueDate), currentTime)) {
      overdueTasks.push(task);
    }
    // 为所有任务设置默认时长
    if (!task.duration) {
      task.duration = preferences.defaultTaskDuration;
    }
  });
  
  // 生成可用时间块
  const timeBlocks = generateDayTimeBlocks(today, preferences);
  
  // 排除已占用的时间
  const availableBlocks = excludeOccupiedTime(timeBlocks, events, fixedTasks, preferences);
  
  // 按优先级排序任务（调度所有灵活任务，包括超期任务）
  const sortedTasks = sortTasksByPriority(flexibleTasks);
  
  // 尝试调度任务
  const { scheduled, unscheduled } = scheduleTasksInBlocks(sortedTasks, availableBlocks, preferences);
  
  // 更新任务调度
  onScheduleUpdate(scheduled);
  
  return {
    scheduledTasks: scheduled,
    overdueTasks, // 返回标记的超期任务（可能已被调度）
    unscheduledTasks: unscheduled // 无法安排的任务
  };
};