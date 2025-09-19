import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { List } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const listColorMap: Record<NonNullable<List['color']>, string> = {
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
  return listColorMap[color]
}
