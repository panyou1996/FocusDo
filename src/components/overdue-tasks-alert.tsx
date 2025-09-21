'use client';

import React from 'react';
import { Task } from '@/lib/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Calendar } from 'lucide-react';
import { format, parseISO, isAfter, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface OverdueTasksAlertProps {
  tasks: Task[];
  onReschedule: (taskIds: string[]) => void;
  onMarkImportant: (taskIds: string[]) => void;
}

export function OverdueTasksAlert({ tasks, onReschedule, onMarkImportant }: OverdueTasksAlertProps) {
  if (tasks.length === 0) return null;

  const now = new Date();
  const criticalTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = parseISO(task.dueDate);
    return isAfter(now, addDays(dueDate, 1));
  });

  return (
    <div className="mb-6">
      {criticalTasks.length > 0 && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <div className="flex-1">
            <div className="font-medium text-red-700 mb-2">
              严重超期！{criticalTasks.length} 个任务已超过截止日期
            </div>
            <AlertDescription className="text-red-600 mb-3">
              这些任务已超期超过1天，建议立即处理
            </AlertDescription>
            <div className="flex gap-2">
              <Button size="sm" variant="destructive" onClick={() => onReschedule(criticalTasks.map(t => t.id))}>
                <Calendar className="h-3 w-3 mr-1" />
                重新安排
              </Button>
              <Button size="sm" variant="outline" onClick={() => onMarkImportant(criticalTasks.map(t => t.id))}>
                标记重要
              </Button>
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
}