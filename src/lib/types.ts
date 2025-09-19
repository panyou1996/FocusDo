import type { LucideIcon } from "lucide-react";

export type Tag = {
  id: string;
  label: string;
  color:
    | "red"
    | "orange"
    | "yellow"
    | "green"
    | "blue"
    | "purple"
    | "gray";
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string; // ISO string
  duration?: number; // in minutes
  listId: string;
  tagIds: string[];
  createdAt: string; // ISO string
};

export type List = {
  id: string;
  title: string;
  icon: React.ComponentProps<typeof LucideIcon>["name"];
};
