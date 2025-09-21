'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';
import { UserSchedulePreferences } from '@/lib/types';

interface SchedulerPreferencesProps {
  preferences: UserPreferences;
  onPreferencesChange: (preferences: UserPreferences) => void;
}

export function SchedulerPreferences({ preferences, onPreferencesChange }: SchedulerPreferencesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(preferences);

  const handleSave = () => {
    onPreferencesChange(localPreferences);
    setIsOpen(false);
  };

  const handleTimeChange = (field: keyof UserPreferences['workHours'], value: string) => {
    setLocalPreferences(prev => ({
      ...prev,
      workHours: {
        ...prev.workHours,
        [field]: value
      }
    }));
  };

  const handleTaskTypeChange = (timeOfDay: keyof UserPreferences['preferredTaskTypes'], taskTypes: string[]) => {
    setLocalPreferences(prev => ({
      ...prev,
      preferredTaskTypes: {
        ...prev.preferredTaskTypes,
        [timeOfDay]: taskTypes
      }
    }));
  };

  const taskTypeOptions = [
    { value: 'creative', label: '创意工作' },
    { value: 'focused', label: '专注工作' },
    { value: 'analytical', label: '分析工作' },
    { value: 'meeting', label: '会议' },
    { value: 'learning', label: '学习' },
    { value: 'general', label: '一般任务' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          调度设置
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>智能调度偏好设置</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* 工作时间设置 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">工作时间</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>上午开始时间</Label>
                <Input
                  type="time"
                  value={localPreferences.workHours.morningStart}
                  onChange={(e) => handleTimeChange('morningStart', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>上午结束时间</Label>
                <Input
                  type="time"
                  value={localPreferences.workHours.morningEnd}
                  onChange={(e) => handleTimeChange('morningEnd', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>下午开始时间</Label>
                <Input
                  type="time"
                  value={localPreferences.workHours.afternoonStart}
                  onChange={(e) => handleTimeChange('afternoonStart', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>下午结束时间</Label>
                <Input
                  type="time"
                  value={localPreferences.workHours.afternoonEnd}
                  onChange={(e) => handleTimeChange('afternoonEnd', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>晚上开始时间</Label>
                <Input
                  type="time"
                  value={localPreferences.workHours.eveningStart}
                  onChange={(e) => handleTimeChange('eveningStart', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>晚上结束时间</Label>
                <Input
                  type="time"
                  value={localPreferences.workHours.eveningEnd}
                  onChange={(e) => handleTimeChange('eveningEnd', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 任务类型偏好 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">任务类型偏好</h3>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">上午偏好任务类型</Label>
                <Select
                  value={localPreferences.preferredTaskTypes.morning.join(',')}
                  onValueChange={(value) => handleTaskTypeChange('morning', value.split(','))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择任务类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="mb-2 block">下午偏好任务类型</Label>
                <Select
                  value={localPreferences.preferredTaskTypes.afternoon.join(',')}
                  onValueChange={(value) => handleTaskTypeChange('afternoon', value.split(','))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择任务类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="mb-2 block">晚上偏好任务类型</Label>
                <Select
                  value={localPreferences.preferredTaskTypes.evening.join(',')}
                  onValueChange={(value) => handleTaskTypeChange('evening', value.split(','))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择任务类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 其他设置 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">其他设置</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="break-duration">休息间隔（分钟）</Label>
                <Input
                  id="break-duration"
                  type="number"
                  min={5}
                  max={30}
                  value={localPreferences.breakDuration}
                  onChange={(e) => setLocalPreferences(prev => ({
                    ...prev,
                    breakDuration: parseInt(e.target.value)
                  }))}
                  className="w-20"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="max-tasks">每日最大任务数</Label>
                <Input
                  id="max-tasks"
                  type="number"
                  min={1}
                  max={20}
                  value={localPreferences.maxTasksPerDay}
                  onChange={(e) => setLocalPreferences(prev => ({
                    ...prev,
                    maxTasksPerDay: parseInt(e.target.value)
                  }))}
                  className="w-20"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存设置
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}