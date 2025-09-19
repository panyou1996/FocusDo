import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { List } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const taskListColorMap: Record<NonNullable<List['color']>, string> = {
  red: "bg-red-100 dark:bg-red-900/30",
  orange: "bg-orange-100 dark:bg-orange-900/30",
  yellow: "bg-yellow-100 dark:bg-yellow-900/30",
  green: "bg-green-100 dark:bg-green-900/30",
  blue: "bg-blue-100 dark:bg-blue-900/30",
  purple: "bg-purple-100 dark:bg-purple-900/30",
  gray: "bg-gray-100 dark:bg-gray-900/30",
  pink: "bg-pink-100 dark:bg-pink-900/30",
  brown: "bg-stone-100 dark:bg-stone-900/30",
}

export const getListColorClasses = (
  color?: List["color"]
): string => {
  if (!color) {
    return "bg-card";
  }
  return taskListColorMap[color]
}

const sidebarListColorMap: Record<NonNullable<List['color']>, string> = {
  red: "bg-red-200/50 dark:bg-red-800/30 text-red-800 dark:text-red-200",
  orange: "bg-orange-200/50 dark:bg-orange-800/30 text-orange-800 dark:text-orange-200",
  yellow: "bg-yellow-200/50 dark:bg-yellow-800/30 text-yellow-800 dark:text-yellow-200",
  green: "bg-green-200/50 dark:bg-green-800/30 text-green-800 dark:text-green-200",
  blue: "bg-blue-200/50 dark:bg-blue-800/30 text-blue-800 dark:text-blue-200",
  purple: "bg-purple-200/50 dark:bg-purple-800/30 text-purple-800 dark:text-purple-200",
  gray: "bg-gray-200/50 dark:bg-gray-800/30 text-gray-800 dark:text-gray-200",
  pink: "bg-pink-200/50 dark:bg-pink-800/30 text-pink-800 dark:text-pink-200",
  brown: "bg-stone-200/50 dark:bg-stone-800/30 text-stone-800 dark:text-stone-200",
};


export const getSidebarListColorClasses = (
  color?: List["color"]
): string => {
  if (!color) {
    return "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground";
  }
  return cn(sidebarListColorMap[color], 'hover:bg-opacity-70');
}
