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
  listId: string;
  tagIds: string[];
  subtasks: Subtask[];
  createdAt: string; // ISO string
};

export type List = {
  id: string;
  title: string;
  icon: React.ComponentProps<typeof LucideIcon>["name"];
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
  calendarId: 'personal' | 'work';
};
