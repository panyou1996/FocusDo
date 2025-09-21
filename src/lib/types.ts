import type { LucideIcon } from "lucide-react";

export type Tag = {
  id: string;
  label: string;
};

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  isMyDay?: boolean;
  isImportant?: boolean;
  dueDate?: string; // ISO string, deadline for the task
  startTime?: string; // ISO string, scheduled start time for 'My Day'
  duration?: number; // in minutes
  fixedTime?: boolean; // true if this task has a fixed time and cannot be rescheduled
  listId: string;
  tagIds: string[];
  subtasks: Subtask[];
  createdAt: string; // ISO string
};

export type List = {
  id: string;
  title: string;
  icon: string; // Icon name as string
  color?:
    | "red"
    | "orange"
    | "yellow"
    | "green"
    | "blue"
    | "purple"
    | "gray"
    | "pink"
    | "brown";
};

export type CalendarEvent = {
  id: string;
  title: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  listId: string; // 改为与任务统一的listId
  completed?: boolean; // 添加完成状态
};

// 用户作息和任务规则偏好
export type UserSchedulePreferences = {
  workStart: string; // "08:30"
  lunchBreakStart: string; // "11:30"
  lunchBreakEnd: string; // "13:00"
  dinnerBreakStart: string; // "17:30"
  dinnerBreakEnd: string; // "18:30"
  sleepTime: string; // "22:30"
  taskInterval: number; // 任务间隔时间（分钟）
  allowOverlap: boolean; // 是否支持多任务交叠
  defaultTaskDuration: number; // 默认任务时长（分钟）
};
