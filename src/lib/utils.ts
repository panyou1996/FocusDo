import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { List } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const listColorMap: Record<NonNullable<List['color']>, string> = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  gray: "bg-gray-500",
  pink: "bg-pink-500",
  brown: "bg-stone-500",
};

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

const borderColorMap: Record<string, string> = {
  red: "border-red-500",
  orange: "border-orange-500",
  yellow: "border-yellow-500",
  green: "border-green-500",
  blue: "border-blue-500",
  purple: "border-purple-500",
  gray: "border-gray-500",
  pink: "border-pink-500",
  brown: "border-stone-500",
};

export const getBorderColorClasses = (color?: string): string => {
  if (!color || !borderColorMap[color]) {
    // 默认使用灰色边框而不是空字符串
    return "border-gray-500";
  }
  return borderColorMap[color];
};


const sidebarListColorMap: Record<NonNullable<List['color']>, string> = {
  red: "data-[active=true]:bg-red-200/50 data-[active=true]:dark:bg-red-800/30 data-[active=true]:text-red-800 data-[active=true]:dark:text-red-200",
  orange: "data-[active=true]:bg-orange-200/50 data-[active=true]:dark:bg-orange-800/30 data-[active=true]:text-orange-800 data-[active=true]:dark:text-orange-200",
  yellow: "data-[active=true]:bg-yellow-200/50 data-[active=true]:dark:bg-yellow-800/30 data-[active=true]:text-yellow-800 data-[active=true]:dark:text-yellow-200",
  green: "data-[active=true]:bg-green-200/50 data-[active=true]:dark:bg-green-800/30 data-[active=true]:text-green-800 data-[active=true]:dark:text-green-200",
  blue: "data-[active=true]:bg-blue-200/50 data-[active=true]:dark:bg-blue-800/30 data-[active=true]:text-blue-800 data-[active=true]:dark:text-blue-200",
  purple: "data-[active=true]:bg-purple-200/50 data-[active=true]:dark:bg-purple-800/30 data-[active=true]:text-purple-800 data-[active=true]:dark:text-purple-200",
  gray: "data-[active=true]:bg-gray-200/50 data-[active=true]:dark:bg-gray-800/30 data-[active=true]:text-gray-800 data-[active=true]:dark:text-gray-200",
  pink: "data-[active=true]:bg-pink-200/50 data-[active=true]:dark:bg-pink-800/30 data-[active=true]:text-pink-800 data-[active=true]:dark:text-pink-200",
  brown: "data-[active=true]:bg-stone-200/50 data-[active=true]:dark:bg-stone-800/30 data-[active=true]:text-stone-800 data-[active=true]:dark:text-stone-200",
};


export const getSidebarListColorClasses = (
  color?: List["color"],
  isActive?: boolean
): string => {
  if (!color) {
    return "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground";
  }
  
  if (!isActive) {
    // 即使非活动状态，也要应用颜色相关的悬停效果
    return cn(sidebarListColorMap[color], 'hover:bg-opacity-70');
  }
  
  return cn(sidebarListColorMap[color], 'hover:bg-opacity-70');
}
