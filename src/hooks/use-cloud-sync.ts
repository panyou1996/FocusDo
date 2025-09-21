'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSupabaseSync } from '@/hooks/use-supabase-sync';
import { useTasksClient, useTasksDispatch } from '@/hooks/use-tasks';
import { useToast } from '@/hooks/use-toast';

export function useCloudSync() {
  const { user } = useAuth();
  const { tasks, lists, events } = useTasksClient();
  const dispatch = useTasksDispatch();
  const { 
    syncing, 
    lastSyncTime, 
    syncToCloud, 
    syncFromCloud 
  } = useSupabaseSync();
  const { toast } = useToast();
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [hasInitialSync, setHasInitialSync] = useState(false);

  const handleSyncToCloud = useCallback(async (silent = false) => {
    if (!user) return;
    if (syncing) {
      console.log('Sync already in progress, skipping');
      return;
    }

    try {
      const result = await syncToCloud(tasks, lists, events);
      if (result.success) {
        if (!silent) {
          toast({
            title: "同步成功",
            description: `已将 ${tasks.length} 个任务、${lists.length} 个列表和 ${events.length} 个事件同步到云端`
          });
        }
      } else {
        if (!silent) {
          toast({
            title: "同步失败",
            description: `无法将数据同步到云端: ${typeof result.error === 'string' ? result.error : result.error?.message || '未知错误'}`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      if (!silent) {
        toast({
          title: "同步失败",
          description: "无法将数据同步到云端，请检查网络连接",
          variant: "destructive"
        });
      }
    }
  }, [user, syncing, tasks, lists, events, syncToCloud, toast]);

  const handleSyncFromCloud = useCallback(async () => {
    if (!user) return;

    try {
      const result = await syncFromCloud();
      if (result.success && result.data) {
        dispatch({
          type: 'SET_STATE',
          payload: {
            tasks: result.data.tasks || [],
            lists: result.data.lists || [],
            events: result.data.events || [],
            tags: [], // Keep existing tags
          }
        });
        toast({
          title: "同步成功",
          description: `已从云端获取 ${result.data.tasks.length} 个任务, ${result.data.lists.length} 个列表和 ${result.data.events.length} 个事件`
        });
      } else if (result.error) {
        toast({
            title: "同步失败",
            description: `无法从云端获取数据: ${typeof result.error === 'string' ? result.error : result.error?.message || '未知错误'}`,
            variant: "destructive"
          });
      }
    } catch (error) {
      toast({
        title: "同步失败",
        description: "无法从云端获取数据，请检查网络连接",
        variant: "destructive"
      });
    }
  }, [user, syncFromCloud, dispatch, toast]);

  useEffect(() => {
    const checkAndSyncFromCloud = async () => {
      if (user && !hasInitialSync) {
        await handleSyncFromCloud();
        setHasInitialSync(true);
      }
    };
    checkAndSyncFromCloud();
  }, [user, hasInitialSync, handleSyncFromCloud]);

  useEffect(() => {
    if (!user || !autoSyncEnabled) return;

    const interval = setInterval(() => {
      handleSyncToCloud(true); // silent sync
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user, autoSyncEnabled, handleSyncToCloud]);

  useEffect(() => {
    if (!user || !hasInitialSync || syncing) return;

    const debounceTimer = setTimeout(() => {
      handleSyncToCloud(true); // silent sync
    }, 3000); // 3 seconds

    return () => clearTimeout(debounceTimer);
  }, [user, hasInitialSync, syncing, tasks, lists, events, handleSyncToCloud]);

  const toggleAutoSync = () => {
    setAutoSyncEnabled(!autoSyncEnabled);
    toast({
      title: autoSyncEnabled ? "自动同步已关闭" : "自动同步已开启",
      description: autoSyncEnabled ? "数据将不会自动同步到云端" : "数据将定期自动同步到云端"
    });
  };

  return { syncing, lastSyncTime, autoSyncEnabled, toggleAutoSync, handleSyncToCloud };
}
