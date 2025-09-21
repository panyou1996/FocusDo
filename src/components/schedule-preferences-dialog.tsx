'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { UserSchedulePreferences } from '@/lib/types';
import { Clock, Settings, Zap } from 'lucide-react';

interface SchedulePreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: UserSchedulePreferences;
  onSave: (preferences: UserSchedulePreferences) => void;
}

export function SchedulePreferencesDialog({ 
  open, 
  onOpenChange, 
  preferences, 
  onSave 
}: SchedulePreferencesDialogProps) {
  const [localPreferences, setLocalPreferences] = useState<UserSchedulePreferences>(preferences);

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const handleSave = () => {
    onSave(localPreferences);
    onOpenChange(false);
  };

  const handleReset = () => {
    const defaultPreferences: UserSchedulePreferences = {
      workStart: '08:30',
      lunchBreakStart: '11:30',
      lunchBreakEnd: '13:00',
      dinnerBreakStart: '17:30',
      dinnerBreakEnd: '18:30',
      sleepTime: '22:30',
      taskInterval: 15,
      allowOverlap: false,
      defaultTaskDuration: 15
    };
    setLocalPreferences(defaultPreferences);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            作息与任务规则设置
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* 工作时间设置 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium">工作时间安排</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workStart" className="text-xs text-muted-foreground">上班时间</Label>
                <Input
                  id="workStart"
                  type="time"
                  value={localPreferences.workStart}
                  onChange={(e) => setLocalPreferences(prev => ({ 
                    ...prev, 
                    workStart: e.target.value 
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sleepTime" className="text-xs text-muted-foreground">晚安时间</Label>
                <Input
                  id="sleepTime"
                  type="time"
                  value={localPreferences.sleepTime}
                  onChange={(e) => setLocalPreferences(prev => ({ 
                    ...prev, 
                    sleepTime: e.target.value 
                  }))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* 休息时间设置 */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">休息时间</Label>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lunchStart" className="text-xs text-muted-foreground">午休开始</Label>
                  <Input
                    id="lunchStart"
                    type="time"
                    value={localPreferences.lunchBreakStart}
                    onChange={(e) => setLocalPreferences(prev => ({ 
                      ...prev, 
                      lunchBreakStart: e.target.value 
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lunchEnd" className="text-xs text-muted-foreground">午休结束</Label>
                  <Input
                    id="lunchEnd"
                    type="time"
                    value={localPreferences.lunchBreakEnd}
                    onChange={(e) => setLocalPreferences(prev => ({ 
                      ...prev, 
                      lunchBreakEnd: e.target.value 
                    }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dinnerStart" className="text-xs text-muted-foreground">晚餐开始</Label>
                  <Input
                    id="dinnerStart"
                    type="time"
                    value={localPreferences.dinnerBreakStart}
                    onChange={(e) => setLocalPreferences(prev => ({ 
                      ...prev, 
                      dinnerBreakStart: e.target.value 
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dinnerEnd" className="text-xs text-muted-foreground">晚餐结束</Label>
                  <Input
                    id="dinnerEnd"
                    type="time"
                    value={localPreferences.dinnerBreakEnd}
                    onChange={(e) => setLocalPreferences(prev => ({ 
                      ...prev, 
                      dinnerBreakEnd: e.target.value 
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 任务规则设置 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium">任务规则</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taskInterval" className="text-xs text-muted-foreground">
                  任务间隔 (分钟)
                </Label>
                <Input
                  id="taskInterval"
                  type="number"
                  min="0"
                  max="60"
                  value={localPreferences.taskInterval}
                  onChange={(e) => setLocalPreferences(prev => ({ 
                    ...prev, 
                    taskInterval: parseInt(e.target.value) || 0 
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultDuration" className="text-xs text-muted-foreground">
                  默认时长 (分钟)
                </Label>
                <Input
                  id="defaultDuration"
                  type="number"
                  min="5"
                  max="480"
                  value={localPreferences.defaultTaskDuration}
                  onChange={(e) => setLocalPreferences(prev => ({ 
                    ...prev, 
                    defaultTaskDuration: parseInt(e.target.value) || 15 
                  }))}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="allowOverlap" className="text-sm">支持任务交叠</Label>
                <p className="text-xs text-muted-foreground">
                  允许多个任务在时间上重叠执行
                </p>
              </div>
              <Switch
                id="allowOverlap"
                checked={localPreferences.allowOverlap}
                onCheckedChange={(checked) => setLocalPreferences(prev => ({ 
                  ...prev, 
                  allowOverlap: checked 
                }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            重置默认
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存设置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}