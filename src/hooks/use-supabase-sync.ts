'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';
import type { Task, List, CalendarEvent } from '@/lib/types';

export function useSupabaseSync() {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // 同步任务到云端
  const syncTasksToCloud = async (tasks: Task[]) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      setSyncing(true);
      
      // 准备任务数据
      const tasksToSync = tasks.map(task => ({
        id: task.id,
        user_id: user.id,
        title: task.title,
        description: task.description || null,
        completed: task.completed,
        is_important: task.isImportant || false,
        is_my_day: task.isMyDay || false,
        fixed_time: task.fixedTime || false,
        start_time: task.startTime || null,
        duration: task.duration || null,
        due_date: task.dueDate || null,
        list_id: task.listId || 'inbox',
        tags: task.tagIds || [],
      }));

      // 使用 upsert 来插入或更新
      const { error } = await supabase
        .from('tasks')
        .upsert(tasksToSync);

      if (error) throw error;

      setLastSyncTime(new Date());
      return { success: true };
    } catch (error) {
      console.error('Error syncing tasks to cloud:', error);
      return { success: false, error: error as Error };
    } finally {
      setSyncing(false);
    }
  };

  // 从云端获取任务
  const getTasksFromCloud = async (): Promise<{ success: boolean; tasks?: Task[]; error?: Error }> => {
    if (!user) return { success: false, error: new Error('Not authenticated') };

    try {
      setSyncing(true);

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 转换数据格式
      const tasks: Task[] = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || undefined,
        completed: task.completed,
        isImportant: task.is_important,
        isMyDay: task.is_my_day,
        fixedTime: task.fixed_time,
        startTime: task.start_time || undefined,
        duration: task.duration || undefined,
        dueDate: task.due_date || undefined,
        listId: task.list_id,
        tagIds: task.tags || [],
        subtasks: [],
        createdAt: task.created_at,
      }));

      setLastSyncTime(new Date());
      return { success: true, tasks };
    } catch (error) {
      console.error('Error getting tasks from cloud:', error);
      return { success: false, error: error as Error };
    } finally {
      setSyncing(false);
    }
  };

  // 同步列表到云端
  const syncListsToCloud = async (lists: List[]) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      setSyncing(true);

      const listsToSync = lists.map(list => ({
        id: list.id,
        user_id: user.id,
        name: list.title,
        color: list.color || 'blue',
        icon: list.icon || 'list',
      }));

      const { error } = await supabase
        .from('lists')
        .upsert(listsToSync);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error syncing lists to cloud:', error);
      return { success: false, error: error as Error };
    } finally {
      setSyncing(false);
    }
  };

  // 从云端获取列表
  const getListsFromCloud = async (): Promise<{ success: boolean; lists?: List[]; error?: Error }> => {
    if (!user) return { success: false, error: new Error('Not authenticated') };

    try {
      setSyncing(true);

      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const lists: List[] = (data || []).map(list => ({
        id: list.id,
        title: list.name,
        color: list.color as List['color'],
        icon: list.icon,
      }));

      return { success: true, lists };
    } catch (error) {
      console.error('Error getting lists from cloud:', error);
      return { success: false, error: error as Error };
    } finally {
      setSyncing(false);
    }
  };

  // 同步事件到云端
  const syncEventsToCloud = async (events: CalendarEvent[]) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      setSyncing(true);

      const eventsToSync = events.map(event => ({
        id: event.id,
        user_id: user.id,
        title: event.title,
        description: null,
        start_time: event.startTime,
        end_time: event.endTime,
        location: null,
      }));

      const { error } = await supabase
        .from('events')
        .upsert(eventsToSync);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error syncing events to cloud:', error);
      return { success: false, error: error as Error };
    } finally {
      setSyncing(false);
    }
  };

  // 从云端获取事件
  const getEventsFromCloud = async (): Promise<{ success: boolean; events?: CalendarEvent[]; error?: Error }> => {
    if (!user) return { success: false, error: new Error('Not authenticated') };

    try {
      setSyncing(true);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;

      const events: CalendarEvent[] = (data || []).map(event => ({
        id: event.id,
        title: event.title,
        startTime: event.start_time,
        endTime: event.end_time,
        listId: 'calendar',
        completed: false,
      }));

      return { success: true, events };
    } catch (error) {
      console.error('Error getting events from cloud:', error);
      return { success: false, error: error as Error };
    } finally {
      setSyncing(false);
    }
  };

  // 完整同步（上传本地数据到云端）
  const syncToCloud = async (tasks: Task[], lists: List[], events: CalendarEvent[]) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      await Promise.all([
        syncTasksToCloud(tasks),
        syncListsToCloud(lists),
        syncEventsToCloud(events),
      ]);

      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };

  // 完整同步（从云端下载数据）
  const syncFromCloud = async () => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const [tasksResult, listsResult, eventsResult] = await Promise.all([
        getTasksFromCloud(),
        getListsFromCloud(),
        getEventsFromCloud(),
      ]);

      if (!tasksResult.success || !listsResult.success || !eventsResult.success) {
        throw new Error('Failed to sync some data from cloud');
      }

      return {
        success: true,
        data: {
          tasks: tasksResult.tasks || [],
          lists: listsResult.lists || [],
          events: eventsResult.events || [],
        },
      };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };

  return {
    syncing,
    lastSyncTime,
    syncTasksToCloud,
    getTasksFromCloud,
    syncListsToCloud,
    getListsFromCloud,
    syncEventsToCloud,
    getEventsFromCloud,
    syncToCloud,
    syncFromCloud,
  };
}