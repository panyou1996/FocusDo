'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Task, List, CalendarEvent } from '@/lib/types';

// --- Data Mapping Functions ---

const mapTaskToDb = (task: Task) => ({
  id: task.id,
  user_id: task.user_id,
  title: task.title,
  description: task.description,
  completed: task.completed,
  is_important: task.isImportant,
  is_my_day: task.isMyDay,
  fixed_time: task.fixedTime,
  start_time: task.startTime,
  duration: task.duration,
  due_date: task.dueDate,
  list_id: task.listId,
  tags: task.tagIds,
  subtasks: task.subtasks,
  created_at: task.createdAt,
});

const mapTaskFromDb = (task: any): Task => ({
  id: task.id,
  user_id: task.user_id,
  title: task.title,
  description: task.description,
  completed: task.completed,
  isImportant: task.is_important,
  isMyDay: task.is_my_day,
  fixedTime: task.fixed_time,
  startTime: task.start_time,
  duration: task.duration,
  dueDate: task.due_date,
  listId: task.list_id,
  tagIds: task.tags,
  subtasks: task.subtasks,
  createdAt: task.created_at,
});

const mapEventToDb = (event: CalendarEvent) => ({
  id: event.id,
  user_id: event.user_id,
  title: event.title,
  description: event.description,
  start_time: event.startTime,
  end_time: event.endTime,
  location: event.location,
  list_id: event.listId,
  completed: event.completed,
});

const mapEventFromDb = (event: any): CalendarEvent => ({
  id: event.id,
  user_id: event.user_id,
  title: event.title,
  description: event.description,
  startTime: event.start_time,
  endTime: event.end_time,
  location: event.location,
  listId: event.list_id,
  completed: event.completed,
});

const mapListToDb = (list: List) => ({
  id: list.id,
  user_id: list.user_id,
  title: list.title,
  color: list.color,
  icon: list.icon,
});

const mapListFromDb = (list: any): List => ({
  id: list.id,
  user_id: list.user_id,
  title: list.title,
  color: list.color,
  icon: list.icon,
});

  const syncToCloud = useCallback(async (tasks: Task[], lists: List[], events: CalendarEvent[]) => {
    setSyncing(true);
    try {
      // 设置15秒超时限制
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('连接服务器超时')), 15000)
      );

      // 并行执行所有操作
      const [tasksRes, listsRes, eventsRes] = await Promise.race([
        Promise.all([
          supabase.from('tasks').upsert(tasks.map(mapTaskToDb)),
          supabase.from('lists').upsert(lists.map(mapListToDb)),
          supabase.from('events').upsert(events.map(mapEventToDb))
        ]),
        timeoutPromise
      ]) as any[];

      // 检查每个操作的错误
      if (tasksRes.error) throw tasksRes.error;
      if (listsRes.error) throw listsRes.error;
      if (eventsRes.error) throw eventsRes.error;

      setLastSyncTime(new Date());
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || error 
      };
    } finally {
      setSyncing(false);
    }
  }, []);

  const syncFromCloud = useCallback(async () => {
    setSyncing(true);
    try {
      // 设置15秒超时限制
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('连接服务器超时')), 15000)
      );

      // 并行执行所有查询
      const [tasksRes, listsRes, eventsRes] = await Promise.race([
        Promise.all([
          supabase.from('tasks').select('*'),
          supabase.from('lists').select('*'),
          supabase.from('events').select('*')
        ]),
        timeoutPromise
      ]) as any[];

      // 检查每个操作的错误
      if (tasksRes.error) throw tasksRes.error;
      if (listsRes.error) throw listsRes.error;
      if (eventsRes.error) throw eventsRes.error;

      setLastSyncTime(new Date());
      return { 
        success: true, 
        data: { 
          tasks: tasksRes.data.map(mapTaskFromDb),
          lists: listsRes.data.map(mapListFromDb),
          events: eventsRes.data.map(mapEventFromDb)
        } 
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || error 
      };
    } finally {
      setSyncing(false);
    }
  }, []);

  return { syncing, lastSyncTime, syncToCloud, syncFromCloud };
};
