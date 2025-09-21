'use client';
import React from 'react';
import type { Task, CalendarEvent } from '@/lib/types';
import { useTasksClient, useTasksDispatch } from '@/hooks/use-tasks';
import { Checkbox } from './ui/checkbox';
import { cn, getBorderColorClasses, listColorMap } from '@/lib/utils';
import { format, isToday, isTomorrow, parseISO, addMinutes } from 'date-fns';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Clock, Sun, X, CalendarDays, Star, Tag, Plus, Check as CheckIcon, Sparkles, Briefcase, Video } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useMemo, useState } from 'react';
import { Input } from './ui/input';
import { EditTaskDialog } from './edit-task-dialog';
import { EditEventDialog } from '@/components/edit-event-dialog';
import { Calendar as CalendarPicker } from './ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { autoPlanTasks } from '@/lib/local-scheduler';
import * as Lucide from 'lucide-react';
import { VisuallyHidden } from '@/components/ui/visually-hidden';

type Item = (Task & { type: 'task' }) | (CalendarEvent & { type: 'event' });

interface TaskItemProps {
  item: Item;
  viewMode?: 'compact' | 'detailed';
  index: number;
  isDragDisabled?: boolean;
}

export function TaskItem({ item, viewMode = 'detailed', index, isDragDisabled = false }: TaskItemProps) {
  const { lists, tags, tasks, events } = useTasksClient();
  const dispatch = useTasksDispatch();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEventEditDialogOpen, setIsEventEditDialogOpen] = useState(false);
  const [isQuickEditMode, setIsQuickEditMode] = useState<'title' | 'time' | 'duration' | 'due' | 'list' | null>(null);
  const [quickEditValue, setQuickEditValue] = useState('');
  const [isListSelectOpen, setIsListSelectOpen] = useState(false);
  const { toast } = useToast();

  const isTask = item.type === 'task';
  const task = isTask ? item : null;
  const event = !isTask ? item : null;

  const handleAiSchedule = async () => {
    try {
      const handleScheduleUpdate = (scheduledTasks: { id: string; startTime: string }[]) => {
        scheduledTasks.forEach(({ id, startTime }) => {
          const task = tasks.find(t => t.id === id);
          if (task) {
            dispatch({ 
              type: 'UPDATE_TASK', 
              payload: { ...task, startTime } 
            });
          }
        });
      };
      
      const result = await autoPlanTasks(tasks, events, handleScheduleUpdate);
      
      if (result && result.scheduledTasks.length > 0) {
        toast({
          title: "本地调度完成",
          description: `任务已根据您的日程自动安排，共调度 ${result.scheduledTasks.length} 个任务`
        });
      } else {
        toast({
          title: "调度完成",
          description: "没有需要调度的任务"
        });
      }
    } catch (error) {
      console.error('本地调度失败:', error);
      toast({
        title: "调度失败",
        description: "本地调度过程中出现错误，请稍后重试",
        variant: "destructive"
      });
    }
  };

  const handleCheckedChange = (checked: boolean) => {
    if (task) {
      const updatedTask = { ...task, completed: checked };
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      
      if (checked && task.isMyDay && task.startTime && task.duration) {
        const remainingTasks = tasks.filter(t => t.isMyDay && !t.completed && t.id !== task.id && t.startTime);
        if (remainingTasks.length > 0) {
          toast({
            title: 'Task Completed!',
            description: 'Want to optimize the rest of your day?',
            action: (
              <Button variant="outline" size="sm" onClick={handleAiSchedule}>
                <Sparkles className="mr-2 h-4 w-4" />
                Optimize Schedule
              </Button>
            )
          });
        }
      }
    } else if (event) {
      const updatedEvent = { ...event, completed: checked };
      dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent });
    }
  };

  const toggleMyDay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task) return;
    const updatedTask = { ...task, isMyDay: !task.isMyDay };
    if (!updatedTask.isMyDay) {
        updatedTask.startTime = undefined;
    }
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (!task) return;
    dispatch({ type: 'UPDATE_TASK', payload: { ...task, dueDate: date?.toISOString() } });
  }

  const handleRemoveTag = (e: React.MouseEvent, tagId: string) => {
    e.stopPropagation();
    if (!task) return;
    const newTagIds = task.tagIds.filter(id => id !== tagId);
    dispatch({ type: 'UPDATE_TASK', payload: { ...task, tagIds: newTagIds } });
  }

  const handleToggleTag = (e: React.MouseEvent, tagId: string) => {
    e.stopPropagation();
    if (!task) return;
    const newTagIds = task.tagIds.includes(tagId)
      ? task.tagIds.filter(id => id !== tagId)
      : [...task.tagIds, tagId];
    dispatch({ type: 'UPDATE_TASK', payload: { ...task, tagIds: newTagIds } });
  };

  const toggleImportant = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task) return;
    dispatch({ type: 'UPDATE_TASK', payload: { ...task, isImportant: !task.isImportant } });
  };

  const openEditDialog = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-interactive="true"]') || isQuickEditMode) {
      return;
    }

    if (task) {
      setIsEditDialogOpen(true);
    } else if (event) {
      setIsEventEditDialogOpen(true);
    }
  };

  const handleQuickEdit = (type: 'title' | 'time' | 'duration' | 'due' | 'list', currentValue: string) => {
    setIsQuickEditMode(type);
    setQuickEditValue(currentValue);
    if (type === 'list') {
      setIsListSelectOpen(true);
    }
  };

  const saveQuickEdit = (newValue?: string) => {
    if (!isQuickEditMode) return;

    const valueToUse = newValue || quickEditValue;

    if (task) {
      const updates: Partial<Task> = {};
      
      switch (isQuickEditMode) {
        case 'title':
          updates.title = valueToUse;
          break;
        case 'duration':
          const duration = parseInt(valueToUse);
          if (!isNaN(duration) && duration > 0) {
            updates.duration = duration;
          }
          break;
        case 'time':
          if (valueToUse) {
            const today = new Date();
            const [hours, minutes] = valueToUse.split(':');
            const startTime = new Date(today);
            startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            updates.startTime = startTime.toISOString();
          }
          break;
        case 'due':
          if (valueToUse) {
            const dueDate = new Date(valueToUse);
            updates.dueDate = dueDate.toISOString();
          }
          break;
        case 'list':
          if (valueToUse) {
            updates.listId = valueToUse;
          }
          break;
      }

      dispatch({ type: 'UPDATE_TASK', payload: { ...task, ...updates } });
    } else if (event) {
      const updates: Partial<CalendarEvent> = {};
      
      switch (isQuickEditMode) {
        case 'title':
          updates.title = valueToUse;
          break;
        case 'time':
          if (valueToUse) {
            const originalStartDate = parseISO(event.startTime);
            const originalEndDate = parseISO(event.endTime);
            const originalDuration = originalEndDate.getTime() - originalStartDate.getTime();
            
            const [hours, minutes] = valueToUse.split(':');
            const newStartTime = new Date(originalStartDate);
            newStartTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            const newEndTime = new Date(newStartTime.getTime() + originalDuration);
            
            updates.startTime = newStartTime.toISOString();
            updates.endTime = newEndTime.toISOString();
          }
          break;
        case 'list':
          if (valueToUse) {
            updates.listId = valueToUse;
          }
          break;
      }

      dispatch({ type: 'UPDATE_EVENT', payload: { ...event, ...updates } });
    }
    
    setIsQuickEditMode(null);
    setQuickEditValue('');
    setIsListSelectOpen(false);
  };

  const handleInputBlur = () => {
    saveQuickEdit();
  };

  const cancelQuickEdit = () => {
    setIsQuickEditMode(null);
    setQuickEditValue('');
    setIsListSelectOpen(false);
  };

  const getTaskTags = () => {
    if (!task) return [];
    return tags.filter(tag => task.tagIds.includes(tag.id));
  };
  
  const getTaskList = useMemo(() => {
    if (!task) return undefined;
    return lists.find(list => list.id === task.listId);
  }, [task, lists]);

  const getEventList = useMemo(() => {
    if (!event) return undefined;
    return lists.find(list => list.id === event.listId);
  }, [event, lists]);

  const getDueDateLabel = () => {
    if (!task || !task.dueDate) return null;
    const date = parseISO(task.dueDate);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, 'MMM d, yyyy');
  };

  const renderDetailedView = () => {
    const dueDateLabel = task ? getDueDateLabel() : null;
    const completedSubtasks = task?.subtasks?.filter(st => st.completed).length || 0;
    const totalSubtasks = task?.subtasks?.length || 0;
    const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
    const taskTags = task ? getTaskTags() : [];
    const taskList = getTaskList;
    const eventList = getEventList;
    
    // 根据项目类型确定颜色和图标
    let borderColorClass, ItemIcon;
    if (task) {
      borderColorClass = getBorderColorClasses(taskList?.color);
      ItemIcon = taskList && Lucide[taskList.icon as keyof typeof Lucide] as any;
    } else if (event) {
      borderColorClass = getBorderColorClasses(eventList?.color);
      ItemIcon = eventList && Lucide[eventList.icon as keyof typeof Lucide] as any;
    }

    return (
      <div
        className={cn(
          'group relative flex flex-col gap-3 rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow-md p-4 border border-gray-100',
          item.completed && 'bg-gray-50 opacity-75'
        )}
        onClick={openEditDialog}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            id={`item-${item.id}`}
            checked={item.completed || false}
            onCheckedChange={handleCheckedChange}
            className="h-5 w-5 rounded-full mt-0.5 border-2 border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
            aria-label={`Mark ${item.type} "${item.title}" as ${item.completed ? 'incomplete' : 'complete'}`}
            data-interactive="true"
            onClick={(e) => e.stopPropagation()}
          />
          
          {task && taskList && (
            <div className="flex-shrink-0 self-start mt-0.5">
              {isQuickEditMode === 'list' ? (
                <div className="relative">
                  <Select 
                    open={isListSelectOpen}
                    onOpenChange={setIsListSelectOpen}
                    value={quickEditValue} 
                    onValueChange={(value) => {
                      saveQuickEdit(value);
                    }}
                  >
                    <SelectTrigger className="h-6 w-6 p-0 border-none shadow-none focus:ring-0 bg-transparent">
                      <div className={cn("h-2.5 w-2.5 rounded-full", listColorMap[lists.find(l => l.id === quickEditValue)?.color || 'gray'])} />
                    </SelectTrigger>
                    <SelectContent>
                      {lists.filter(l => !['my-day', 'important'].includes(l.id)).map((list) => (
                        <SelectItem key={list.id} value={list.id}>
                          <div className="flex items-center gap-2">
                            <div className={cn("h-2.5 w-2.5 rounded-full", listColorMap[list.color || 'gray'])} />
                            <span>{list.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div 
                  className="cursor-pointer hover:bg-blue-50 p-1 rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickEdit('list', task.listId);
                  }}
                  data-interactive="true"
                >
                  {(() => {
                    const IconComponent = Lucide[taskList.icon as keyof typeof Lucide] as any;
                    return IconComponent ? <IconComponent className="h-5 w-5 text-muted-foreground" /> : null;
                  })()}
                </div>
              )}
            </div>
          )}
          
          {event && (
            <div className="flex-shrink-0 self-start mt-0.5">
              {isQuickEditMode === 'list' ? (
                <div className="relative">
                  <Select 
                    open={isListSelectOpen}
                    onOpenChange={setIsListSelectOpen}
                    value={quickEditValue} 
                    onValueChange={(value) => {
                      saveQuickEdit(value);
                    }}
                  >
                    <SelectTrigger className="h-6 w-6 p-0 border-none shadow-none focus:ring-0 bg-transparent">
                      <div className={cn("h-2.5 w-2.5 rounded-full", listColorMap[lists.find(l => l.id === quickEditValue)?.color || 'gray'])} />
                    </SelectTrigger>
                    <SelectContent>
                      {lists.filter(l => !['my-day', 'important'].includes(l.id)).map((list) => (
                        <SelectItem key={list.id} value={list.id}>
                          <div className="flex items-center gap-2">
                            <div className={cn("h-2.5 w-2.5 rounded-full", listColorMap[list.color || 'gray'])} />
                            <span>{list.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div 
                  className="cursor-pointer hover:bg-blue-50 p-1 rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickEdit('list', event.listId);
                  }}
                  data-interactive="true"
                >
                  {(() => {
                    const EventIcon = eventList && Lucide[eventList.icon as keyof typeof Lucide] as any;
                    return EventIcon ? <EventIcon className="h-5 w-5 text-muted-foreground" /> : null;
                  })()} 
                </div>
              )}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            {isQuickEditMode === 'title' ? (
              <div className="flex items-center gap-2">
                <Input
                  value={quickEditValue}
                  onChange={(e) => setQuickEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInputBlur();
                    if (e.key === 'Escape') cancelQuickEdit();
                  }}
                  onBlur={handleInputBlur}
                  className="text-sm font-medium h-auto py-0 px-0 border-none shadow-none focus-visible:ring-0 bg-transparent"
                  style={{ width: `${Math.max(quickEditValue.length * 8, 100)}px` }}
                  autoFocus
                />
              </div>
            ) : (
              <label
                htmlFor={`item-${item.id}`}
                className={cn(
                  'text-sm font-medium cursor-pointer hover:text-primary transition-colors inline-block truncate',
                  item.completed && 'line-through text-muted-foreground'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickEdit('title', item.title);
                }}
                title={item.title}
              >
                {item.title}
              </label>
            )}
            
            {task?.description && (
              <p className="text-xs text-muted-foreground">{task.description}</p>
            )}
            
            {event && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {isQuickEditMode === 'time' ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="time"
                      value={quickEditValue}
                      onChange={(e) => setQuickEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleInputBlur();
                        if (e.key === 'Escape') cancelQuickEdit();
                      }}
                      onBlur={handleInputBlur}
                      className="w-auto h-auto py-0 px-1 text-xs border-none shadow-none focus-visible:ring-0 bg-blue-50 rounded"
                      style={{ width: '70px' }}
                      autoFocus
                    />
                    <span>- {format(parseISO(event.endTime), 'HH:mm')}</span>
                  </div>
                ) : (
                  <span
                    className="cursor-pointer hover:text-primary hover:bg-blue-50 px-1 rounded transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      const startTime = format(parseISO(event.startTime), 'HH:mm');
                      handleQuickEdit('time', startTime);
                    }}
                    data-interactive="true"
                  >
                    {format(parseISO(event.startTime), 'HH:mm')} - {format(parseISO(event.endTime), 'HH:mm')}
                  </span>
                )}
              </div>
            )}
            
            {task && (
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {task.isMyDay && task.startTime && (
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Clock className="h-3 w-3" />
                    {isQuickEditMode === 'time' ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="time"
                          value={quickEditValue}
                          onChange={(e) => setQuickEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleInputBlur();
                            if (e.key === 'Escape') cancelQuickEdit();
                          }}
                          onBlur={handleInputBlur}
                          className="w-auto h-auto py-0 px-1 text-xs border-none shadow-none focus-visible:ring-0 bg-blue-50 rounded"
                          style={{ width: '70px' }}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <span
                        className="cursor-pointer hover:text-primary hover:bg-blue-50 px-1 rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickEdit('time', format(parseISO(task.startTime!), 'HH:mm'));
                        }}
                      >
                        开始: {format(parseISO(task.startTime), 'HH:mm')}
                      </span>
                    )}
                  </div>
                )}
                
                {dueDateLabel && (
                  <div className={cn("flex items-center gap-1.5 font-semibold",
                    task.dueDate && isToday(parseISO(task.dueDate)) ? "text-primary" : ""
                  )}>
                    <CalendarDays className="h-3 w-3" />
                    {isQuickEditMode === 'due' ? (
                      <Input
                        type="date"
                        value={quickEditValue}
                        onChange={(e) => setQuickEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleInputBlur();
                          if (e.key === 'Escape') cancelQuickEdit();
                        }}
                        onBlur={handleInputBlur}
                        className="w-auto h-auto py-0 px-1 text-xs border-none shadow-none focus-visible:ring-0 bg-blue-50 rounded"
                        style={{ width: '120px' }}
                        autoFocus
                      />
                    ) : (
                      <span
                        className="cursor-pointer hover:text-primary hover:bg-blue-50 px-1 rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentDate = task.dueDate ? format(parseISO(task.dueDate), 'yyyy-MM-dd') : '';
                          handleQuickEdit('due', currentDate);
                        }}
                      >
                        Due: {dueDateLabel}
                      </span>
                    )}
                  </div>
                )}

                {task.duration && (
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Clock className="h-3 w-3" />
                    {isQuickEditMode === 'duration' ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={quickEditValue}
                          onChange={(e) => setQuickEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleInputBlur();
                            if (e.key === 'Escape') cancelQuickEdit();
                          }}
                          onBlur={handleInputBlur}
                          className="w-auto h-auto py-0 px-1 text-xs border-none shadow-none focus-visible:ring-0 bg-blue-50 rounded"
                          style={{ width: '50px' }}
                          min="1"
                          autoFocus
                        />
                        <span>min</span>
                      </div>
                    ) : (
                      <span
                        className="cursor-pointer hover:text-primary hover:bg-blue-50 px-1 rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickEdit('duration', task.duration!.toString());
                        }}
                      >
                        {task.duration} min
                      </span>
                    )}
                  </div>
                )}

                {taskTags.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3 w-3" />
                    {taskTags.map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs font-normal">
                        #{tag.label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {task && (
            <div className="flex items-center">
              <Button data-interactive="true" variant="ghost" size="icon" onClick={toggleImportant} className="h-8 w-8 shrink-0">
                <Star className={cn("h-4 w-4", task.isImportant ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
                <VisuallyHidden>{task.isImportant ? 'Remove importance' : 'Mark as important'}</VisuallyHidden>
              </Button>
              <Button data-interactive="true" variant="ghost" size="icon" onClick={toggleMyDay} className="h-8 w-8 shrink-0 rounded-full hover:bg-accent transition-all duration-200">
                {task.isMyDay ? (
                  <X className="h-4 w-4 text-red-500" />
                ) : (
                  <Sun className="h-4 w-4 text-yellow-500" />
                )}
                <VisuallyHidden>{task.isMyDay ? 'Remove from My Day' : 'Add to My Day'}</VisuallyHidden>
              </Button>
            </div>
          )}
        </div>
        
        {task?.subtasks && task.subtasks.length > 0 && (
          <div className="pl-12 space-y-2 mt-1">
            <Progress value={subtaskProgress} className="h-1" />
            <div className="space-y-1 text-sm text-muted-foreground">
              {completedSubtasks} of {totalSubtasks} completed
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCompactView = () => {
    const taskList = getTaskList;
    const eventList = getEventList;
    let borderColorClass, ItemIcon;
    
    if (isTask) {
      borderColorClass = getBorderColorClasses(taskList?.color);
      ItemIcon = (taskList && Lucide[taskList.icon as keyof typeof Lucide] as React.ComponentType) || Lucide.List;
    } else {
      borderColorClass = getBorderColorClasses(eventList?.color);
      ItemIcon = eventList && Lucide[eventList.icon as keyof typeof Lucide] as any;
    }

    const getTimeDisplay = () => {
        if (item.startTime) {
            const start = parseISO(item.startTime);
            let end;

            if (item.type === 'event' && item.endTime) {
                end = parseISO(item.endTime);
            } else if (item.type === 'task' && item.duration) {
                end = addMinutes(start, item.duration);
            }

            if (end) {
                return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
            }
            return format(start, 'HH:mm');
        }
        return isTask && task?.description ? task.description : null;
    };

    const timeDisplay = getTimeDisplay();

    return (
      <div
        className={cn(
          'group relative flex items-center gap-3 rounded-lg bg-card p-3 shadow-sm transition-all duration-300 hover:shadow-md animate-fade-in-slow border-l-4',
          borderColorClass,
          item.completed && 'bg-card/60 dark:bg-card/40 opacity-60'
        )}
        onClick={openEditDialog}
      >
        <Checkbox
          id={`item-compact-${item.id}`}
          checked={item.completed || false}
          onCheckedChange={handleCheckedChange}
          className="h-5 w-5 rounded-full border-primary"
          aria-label={`Mark ${item.type} "${item.title}" as ${item.completed ? 'incomplete' : 'complete'}`}
          data-interactive="true"
          onClick={(e) => e.stopPropagation()}
        />
        
        {isQuickEditMode === 'list' ? (
          <div className="relative">
            <Select 
              open={isListSelectOpen}
              onOpenChange={setIsListSelectOpen}
              value={quickEditValue} 
              onValueChange={(value) => {
                saveQuickEdit(value);
              }}
            >
              <SelectTrigger className="h-6 w-6 p-0 border-none shadow-none focus:ring-0 bg-transparent">
                <div className={cn("h-2.5 w-2.5 rounded-full", listColorMap[lists.find(l => l.id === quickEditValue)?.color || 'gray'])} />
              </SelectTrigger>
              <SelectContent>
                {lists.filter(l => !['my-day', 'important'].includes(l.id)).map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2.5 w-2.5 rounded-full", listColorMap[list.color || 'gray'])} />
                      <span>{list.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div 
            className="cursor-pointer hover:bg-blue-50 p-1 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleQuickEdit('list', item.listId);
            }}
            data-interactive="true"
          >
            {ItemIcon && <ItemIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
            {isQuickEditMode === 'title' ? (
              <Input
                value={quickEditValue}
                onChange={(e) => setQuickEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleInputBlur();
                  if (e.key === 'Escape') cancelQuickEdit();
                }}
                onBlur={handleInputBlur}
                className="text-sm font-medium h-auto py-0 px-0 border-none shadow-none focus-visible:ring-0 bg-transparent"
                style={{ width: `${Math.max(quickEditValue.length * 8, 100)}px` }}
                autoFocus
              />
            ) : (
              <p 
                className={cn(
                  'text-sm font-medium cursor-pointer hover:text-primary hover:bg-blue-50 px-1 rounded transition-colors truncate', 
                  item.completed && 'line-through text-muted-foreground'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickEdit('title', item.title);
                }}
                title={item.title}
              >
                {item.title}
              </p>
            )}
            {timeDisplay && (
              isQuickEditMode === 'time' ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="time"
                    value={quickEditValue}
                    onChange={(e) => setQuickEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleInputBlur();
                      if (e.key === 'Escape') cancelQuickEdit();
                    }}
                    onBlur={handleInputBlur}
                    className="w-auto h-auto py-0 px-1 text-xs border-none shadow-none focus-visible:ring-0 bg-blue-50 rounded"
                    style={{ width: '70px' }}
                    autoFocus
                  />
                  {item.type === 'task' && task?.duration && task?.startTime && (
                    <span className="text-xs text-muted-foreground">
                      - {format(addMinutes(parseISO(task.startTime), task.duration), 'HH:mm')}
                    </span>
                  )}
                </div>
              ) : (
                <p 
                  className="text-xs text-muted-foreground cursor-pointer hover:text-primary hover:bg-blue-50 px-1 rounded transition-colors truncate"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.startTime) {
                      handleQuickEdit('time', format(parseISO(item.startTime), 'HH:mm'));
                    }
                  }}
                  title={timeDisplay}
                  data-interactive="true"
                >
                    {timeDisplay}
                </p>
              )
            )}
        </div>

        {isTask && task && (
            <div className="flex items-center gap-1">
              <Button data-interactive="true" variant="ghost" size="icon" onClick={toggleImportant} className="h-8 w-8 shrink-0 rounded-full hover:bg-accent transition-all duration-200">
                  <Star className={cn("h-4 w-4", task.isImportant ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
                  <VisuallyHidden>{task.isImportant ? 'Remove importance' : 'Mark as important'}</VisuallyHidden>
              </Button>
              <Button data-interactive="true" variant="ghost" size="icon" onClick={toggleMyDay} className="h-8 w-8 shrink-0 rounded-full hover:bg-accent transition-all duration-200">
                  {task.isMyDay ? (
                    <X className="h-4 w-4 text-red-500" />
                  ) : (
                    <Sun className="h-4 w-4 text-yellow-500" />
                  )}
                  <VisuallyHidden>{task.isMyDay ? 'Remove from My Day' : 'Add to My Day'}</VisuallyHidden>
              </Button>
            </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {viewMode === 'detailed' ? renderDetailedView() : renderCompactView()}
      {task && <EditTaskDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} task={task} />}
      {event && <EditEventDialog open={isEventEditDialogOpen} onOpenChange={setIsEventEditDialogOpen} event={event} />}
    </div>
  );
}