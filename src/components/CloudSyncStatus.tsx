'use client';

import { useCloudSync } from '@/hooks/use-cloud-sync';
import { Button } from '@/components/ui/button';
import { Cloud, CloudOff, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

export function CloudSyncStatus() {
  const { syncing, lastSyncTime, autoSyncEnabled, toggleAutoSync, handleSyncToCloud } = useCloudSync();

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Cloud className={`h-4 w-4 ${autoSyncEnabled ? 'text-green-500' : 'text-gray-400'}`} />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleSyncToCloud()}>
            立即同步
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleAutoSync}>
            {autoSyncEnabled ? '关闭自动同步' : '开启自动同步'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="text-xs text-muted-foreground">
        {syncing ? '同步中...' : lastSyncTime ? `上次同步: ${lastSyncTime.toLocaleTimeString()}` : '未同步'}
      </div>
    </div>
  );
}
