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

export const useSupabaseSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const syncToCloud = useCallback(async (tasks: Task[], lists: List[], events: CalendarEvent[]) => {
    setSyncing(true);
    try {
      const { error: tasksError } = await supabase.from('tasks').upsert(tasks.map(mapTaskToDb));
      if (tasksError) throw tasksError;

      const { error: listsError } = await supabase.from('lists').upsert(lists.map(mapListToDb));
      if (listsError) throw listsError;

      const { error: eventsError } = await supabase.from('events').upsert(events.map(mapEventToDb));
      if (eventsError) throw eventsError;

      setLastSyncTime(new Date());
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setSyncing(false);
    }
  }, []);

  const syncFromCloud = useCallback(async () => {
    setSyncing(true);
    try {
      const { data: tasks, error: tasksError } = await supabase.from('tasks').select('*');
      if (tasksError) throw tasksError;

      const { data: lists, error: listsError } = await supabase.from('lists').select('*');
      if (listsError) throw listsError;

      const { data: events, error: eventsError } = await supabase.from('events').select('*');
      if (eventsError) throw eventsError;

      setLastSyncTime(new Date());
      return { success: true, data: { tasks: tasks.map(mapTaskFromDb), lists: lists.map(mapListFromDb), events: events.map(mapEventFromDb) } };
    } catch (error) {
      return { success: false, error };
    } finally {
      setSyncing(false);
    }
  }, []);

  return { syncing, lastSyncTime, syncToCloud, syncFromCloud };
};