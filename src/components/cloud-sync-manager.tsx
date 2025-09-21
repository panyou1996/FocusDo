'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSupabaseSync } from '@/hooks/use-supabase-sync';
import { useTasksClient, useTasksDispatch } from '@/hooks/use-tasks';
import { useToast } from '@/hooks/use-toast';
import { Cloud, CloudOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CloudSyncManager() {
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

  // 当用户登录状态变化时，从云端获取最新数据
  useEffect(() => {
    const checkAndSyncFromCloud = async () => {
      if (user) {
        // 强制从云端同步，确保获取最新数据
        await handleSyncFromCloud();
        setHasInitialSync(true);
      }
    };
    
    // 立即执行一次同步检查
    checkAndSyncFromCloud();
  }, [user]);

  // 自动同步：每5分钟同步一次
  useEffect(() => {
    if (!user || !autoSyncEnabled) return;

    const interval = setInterval(() => {
      handleSyncToCloud(true); // true 表示静默同步
    }, 5 * 60 * 1000); // 5分钟

    return () => clearInterval(interval);
  }, [user, autoSyncEnabled]);

  // 当用户数据发生变化时，延迟同步到云端
  useEffect(() => {
    // 只有在用户已登录、初始同步完成、且没有正在进行的同步操作时才触发同步
    if (!user || !hasInitialSync || syncing) return;

    // 检查数据是否实际发生变化（避免不必要的同步）
    const hasDataChanged = tasks.length > 0 || lists.length > 0 || events.length > 0;
    if (!hasDataChanged) return;

    const debounceTimer = setTimeout(() => {
      handleSyncToCloud(true); // 静默同步
    }, 3000); // 3秒后同步

    return () => clearTimeout(debounceTimer);
  }, [user, hasInitialSync, syncing, tasks, lists, events]);

  const handleSyncToCloud = async (silent = false) => {
    if (!user) return;
    
    // 如果已经有同步操作在进行中，不重复触发
    if (syncing) {
      console.log('Sync already in progress, skipping');
      return;
    }

    try {
      console.log(`Starting sync to cloud: ${tasks.length} tasks, ${lists.length} lists, ${events.length} events`);
      
      // 使用从useSupabaseSync解构出的syncToCloud函数
      const result = await syncToCloud(tasks, lists, events);
      
      if (result.success) {
        console.log('Data synced successfully to cloud');
        
        if (!silent) {
          toast({
            title: "同步成功",
            description: `已将 ${tasks.length} 个任务、${lists.length} 个列表和 ${events.length} 个事件同步到云端`
          });
        }
      } else {
        console.error('Sync to cloud failed:', result.error);
        if (!silent) {
          toast({
            title: "同步失败",
            description: `无法将数据同步到云端: ${typeof result.error === 'string' ? result.error : result.error?.message || '未知错误'}`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Sync to cloud failed:', error);
      if (!silent) {
        toast({
          title: "同步失败",
          description: "无法将数据同步到云端，请检查网络连接",
          variant: "destructive"
        });
      }
    }
  };

  const handleSyncFromCloud = async () => {
    if (!user) return;

    try {
      const result = await syncFromCloud();
      
      if (result.success && result.data) {
        // 确保数据不为空
        const tasksData = result.data.tasks || [];
        const listsData = result.data.lists || [];
        const eventsData = result.data.events || [];
        
        // 更新本地状态
        dispatch({
          type: 'SET_STATE',
          payload: {
            tasks: tasksData,
            lists: listsData,
            events: eventsData,
            tags: [], // 保持原有的tags
          }
        });

        toast({
          title: "同步成功",
          description: `已从云端获取 ${tasksData.length} 个任务, ${listsData.length} 个列表和 ${eventsData.length} 个事件`
        });
      } else if (result.error) {
        console.error('Sync from cloud error:', result.error);
        toast({
            title: "同步失败",
            description: `无法从云端获取数据: ${typeof result.error === 'string' ? result.error : result.error?.message || '未知错误'}`,
            variant: "destructive"
          });
      }
    } catch (error) {
      console.error('Sync from cloud failed:', error);
      toast({
        title: "同步失败",
        description: "无法从云端获取数据，请检查网络连接",
        variant: "destructive"
      });
    }
  };

  const toggleAutoSync = () => {
    setAutoSyncEnabled(!autoSyncEnabled);
    toast({
      title: autoSyncEnabled ? "自动同步已关闭" : "自动同步已开启",
      description: autoSyncEnabled ? "数据将不会自动同步到云端" : "数据将定期自动同步到云端"
    });
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {/* 同步状态指示器 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200">
        {syncing ? (
          <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
        ) : (
          <Cloud className={`h-4 w-4 ${autoSyncEnabled ? 'text-green-500' : 'text-gray-400'}`} />
        )}
      </div>

      {/* 手动同步按钮 */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleSyncToCloud()}
        disabled={syncing}
        className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white shadow-lg"
      >
        {syncing ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Cloud className="h-4 w-4 mr-2" />
        )}
        同步
      </Button>

      {/* 自动同步切换 */}
      <Button
        size="sm"
        variant={autoSyncEnabled ? "default" : "outline"}
        onClick={toggleAutoSync}
        className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white shadow-lg"
      >
        {autoSyncEnabled ? (
          <Cloud className="h-4 w-4 mr-2 text-white" />
        ) : (
          <CloudOff className="h-4 w-4 mr-2" />
        )}
        {autoSyncEnabled ? "自动" : "手动"}
      </Button>

      {/* 最后同步时间 */}
      {lastSyncTime && (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-lg border border-gray-200">
          <span className="text-xs text-gray-500">
            上次同步: {lastSyncTime.toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
}