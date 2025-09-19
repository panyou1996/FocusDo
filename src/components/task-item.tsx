
'use client';
import type { Task, CalendarEvent } from '@/lib/types';
import { useTasks, useTasksDispatch } from '@/hooks/use-tasks';
import { Checkbox } from './ui/checkbox';
import { cn, getListColorClasses, getBorderColorClasses } from '@/lib/utils';
import { format, isToday, isTomorrow, parseISO, addMinutes } from 'date-fns';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Clock, Sun, X, CalendarDays, GripVertical, Star, Tag, Plus, Check as CheckIcon, Sparkles, Briefcase, Video } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useMemo, useState } from 'react';
import { Input } from './ui/input';
import { EditTaskDialog } from './edit-task-dialog';
import { Calendar as CalendarPicker } from './ui/calendar';
import { Draggable } from 'react-beautiful-dnd';
import { useToast } from '@/hooks/use-toast';
import { scheduleMyDayTasks } from '@/ai/flows/schedule-my-day-flow';
import * as Lucide from 'lucide-react';

type Item = (Task & { type: 'task' }) | (CalendarEvent & { type: 'event' });

interface TaskItemProps {
  item: Item;
  viewMode?: 'compact' | 'detailed';
  index: number;
  isDragDisabled?: boolean;
}

export function TaskItem({ item, viewMode = 'detailed', index, isDragDisabled = false }: TaskItemProps) {
  const { lists, tags, tasks, events } = useTasks();
  const dispatch = useTasksDispatch();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const isTask = item.type === 'task';
  const task = isTask ? item : null;
  const event = !isTask ? item : null;

  const handleAiSchedule = async () => {
    if (!task) return;
    const userSchedule = localStorage.getItem('userSchedule') || 'Works from 8:30 to 11:30, breaks for lunch, works again from 13:00 to 17:30, breaks for dinner, and is free from 18:30 to 22:00.';
    const myDayTasks = tasks.filter((t) => t.isMyDay && !t.completed);
    const todayEvents = events.filter(event => isToday(parseISO(event.startTime)));
    
    toast({ title: '🤖 Optimizing your remaining day...', description: 'The AI is working its magic.' });
    
    const tasksToSchedule = myDayTasks.filter(t => t.id !== task.id);
    
    try {
      const input = {
        userSchedule: userSchedule,
        tasks: tasksToSchedule.map(t => ({
          id: t.id,
          title: t.title,
          duration: t.duration,
          isImportant: t.isImportant,
          dueDate: t.dueDate,
        })),
        events: todayEvents.map(e => ({
          title: e.title,
          startTime: e.startTime,
          endTime: e.endTime,
        })),
        currentDate: new Date().toISOString(),
      };

      const result = await scheduleMyDayTasks(input);
      
      result.scheduledTasks.forEach(scheduledTask => {
        const originalTask = tasks.find(t => t.id === scheduledTask.id);
        if (originalTask) {
          const updatedTask: Task = {
            ...originalTask,
            startTime: scheduledTask.startTime,
          };
          dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
        }
      });

      toast({ 
        title: '✅ Schedule Optimized!', 
        description: 'Your remaining tasks have been rescheduled.',
      });
    } catch (error) {
      console.error('Failed to schedule tasks:', error);
      toast({ variant: 'destructive', title: 'Scheduling failed', description: 'The AI could not optimize your schedule.' });
    }
  };

  const handleCheckedChange = (checked: boolean) => {
    if (!task) return;
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
  };
  
  const handleSubtaskCheckedChange = (subtaskId: string, checked: boolean) => {
    if (!task) return;
    const updatedSubtasks = task.subtasks.map(st => st.id === subtaskId ? {...st, completed: checked} : st);
    const allSubtasksCompleted = updatedSubtasks.every(st => st.completed);
    dispatch({ type: 'UPDATE_TASK', payload: { ...task, subtasks: updatedSubtasks, completed: allSubtasksCompleted } });
  };

  const toggleMyDay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task) return;
    const updatedTask = { ...task, isMyDay: !task.isMyDay };
    if (!updatedTask.isMyDay) {
        updatedTask.startTime = undefined; // Remove start time if removed from My Day
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
    if (target.closest('[data-interactive="true"]')) {
      return;
    }

    if (isTask) {
        setIsEditDialogOpen(true);
    }
  };


  const getTaskTags = () => {
    if (!task) return [];
    return tags.filter(tag => task.tagIds.includes(tag.id));
  };
  
  const getTaskList = useMemo(() => {
    if (!task) return undefined;
    return lists.find(list => list.id === task.listId);
  }, [task, lists]);

  const getDueDateLabel = () => {
    if (!task || !task.dueDate) return null;
    const date = parseISO(task.dueDate);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, 'MMM d, yyyy');
  };

  const renderDetailedView = (provided?: any) => {
    if (!task) return null; // Detailed view is only for tasks

    const dueDateLabel = getDueDateLabel();
    const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;
    const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
    const taskTags = getTaskTags();
    const taskList = getTaskList;

    return (
      <div
        ref={provided?.innerRef}
        {...provided?.draggableProps}
        className={cn(
          'group relative flex flex-col gap-2 rounded-lg border bg-card shadow-sm transition-all hover:shadow-md animate-in fade-in-50 p-3',
          getListColorClasses(taskList?.color),
          task.completed && 'bg-card/60 dark:bg-card/40 opacity-60'
        )}
        onClick={openEditDialog}
      >
        <div className="flex items-start gap-3">
          {viewMode !== 'compact' && !isDragDisabled && provided?.dragHandleProps ? (
            <div {...provided.dragHandleProps} className="mt-1 cursor-grab" data-interactive="true">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          ) : <div className="w-4" />}

          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={handleCheckedChange}
            className="h-5 w-5 rounded-full mt-0.5 border-primary"
            aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
            data-interactive="true"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex-1">
            <label
              htmlFor={`task-${task.id}`}
              className={cn(
                'font-medium',
                task.completed && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </label>
            {task.description && (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {dueDateLabel && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        data-interactive="true"
                        onClick={(e) => e.stopPropagation()}
                        className={cn("flex items-center gap-1.5 font-semibold rounded-md -ml-1 px-1 py-0.5 hover:bg-muted",
                          task.dueDate && isToday(parseISO(task.dueDate)) ? "text-primary" : ""
                        )}>
                        <CalendarDays className="h-3 w-3" />
                        <span>Due: {dueDateLabel}</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" onClick={(e) => e.stopPropagation()}>
                      <CalendarPicker
                        mode="single"
                        selected={task.dueDate ? parseISO(task.dueDate) : undefined}
                        onSelect={handleDateChange}
                      />
                      <div className="p-2 border-t">
                        <Button data-interactive="true" variant="ghost" size="sm" className="w-full justify-start" onClick={(e) => { e.stopPropagation(); handleDateChange(undefined) }}>
                          <X className="mr-2 h-4 w-4" />
                          Remove due date
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
              )}

              {task.duration && (
                <div data-interactive="true" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 font-semibold rounded-md px-1 py-0.5">
                  <Clock className="h-3 w-3" />
                  {task.duration} min
                </div>
              )}

              <div data-interactive="true" className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3 w-3" />
                  {taskTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="text-xs font-normal group/tag relative pr-1.5 cursor-pointer"
                      onClick={(e) => handleRemoveTag(e, tag.id)}
                    >
                      #{tag.label}
                      <span className="absolute -right-1 -top-1 hidden group-hover/tag:flex items-center justify-center w-3.5 h-3.5 bg-background border rounded-full">
                        <X className="w-2.5 h-2.5" />
                      </span>
                    </Badge>
                  ))}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button onClick={(e) => e.stopPropagation()} className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-muted">
                      <Plus className="h-3 w-3" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-2" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Add/Remove Tags</p>
                      <div className="flex flex-col gap-1">
                        {tags.map(tag => (
                          <button
                            key={tag.id}
                            onClick={(e) => handleToggleTag(e, tag.id)}
                            className="flex items-center gap-2 p-1.5 rounded-md text-sm hover:bg-muted w-full text-left"
                          >
                            <div className="w-4">
                              {task.tagIds.includes(tag.id) && <CheckIcon className="h-4 w-4" />}
                            </div>
                            <span>#{tag.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <Button data-interactive="true" variant="ghost" size="icon" onClick={toggleImportant} className="h-8 w-8 shrink-0">
              <Star className={cn("h-4 w-4", task.isImportant ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
              <span className="sr-only">{task.isImportant ? 'Remove importance' : 'Mark as important'}</span>
            </Button>
            <Button data-interactive="true" variant="ghost" size="icon" onClick={toggleMyDay} className="h-8 w-8 shrink-0">
              {task.isMyDay ? (
                <X className="h-4 w-4 text-red-500" />
              ) : (
                <Sun className="h-4 w-4 text-yellow-500" />
              )}
              <span className="sr-only">{task.isMyDay ? 'Remove from My Day' : 'Add to My Day'}</span>
            </Button>
          </div>
        </div>
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="pl-12 space-y-2 mt-1">
            <Progress value={subtaskProgress} className="h-1" />
            <div className="space-y-1 text-sm text-muted-foreground">
              {completedSubtasks} of {totalSubtasks} completed
            </div>
          </div>
        )}
      </div>
    );
  }

  const renderCompactView = (provided?: any) => {
    const taskList = getTaskList;
    const eventColor = event?.calendarId === 'work' ? 'blue' : 'green';
    const borderColorClass = getBorderColorClasses(isTask ? taskList?.color : eventColor);

    let ItemIcon;

    if (isTask) {
        ItemIcon = Lucide[taskList?.icon as keyof typeof Lucide] || Lucide.List;
    } else {
        ItemIcon = event?.calendarId === 'work' ? Briefcase : Video;
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
        ref={provided?.innerRef}
        {...provided?.draggableProps}
        className={cn(
          'group relative flex items-center gap-3 rounded-lg bg-card p-3 shadow-sm transition-all hover:shadow-md animate-in fade-in-50 border-l-4',
          borderColorClass,
          task?.completed && 'bg-card/60 dark:bg-card/40 opacity-60'
        )}
        onClick={openEditDialog}
      >
        { !isDragDisabled && provided?.dragHandleProps ? (
          <div {...provided.dragHandleProps} className="cursor-grab" data-interactive="true" onClick={(e) => e.stopPropagation()}>
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        ) : <div className="w-4" />}

        {isTask ? (
           <Checkbox
              id={`task-compact-${item.id}`}
              checked={task!.completed}
              onCheckedChange={handleCheckedChange}
              className="h-5 w-5 rounded-full border-primary"
              aria-label={`Mark task "${task!.title}" as ${task!.completed ? 'incomplete' : 'complete'}`}
              data-interactive="true"
              onClick={(e) => e.stopPropagation()}
            />
        ): (
          <Checkbox
            id={`event-compact-${item.id}`}
            className="h-5 w-5 rounded-full border-primary"
            aria-label="Event checkbox"
            data-interactive="true"
            disabled
          />
        )}
        
        {ItemIcon && <ItemIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
        
        <div className="flex-1">
            <p className={cn('font-medium', task?.completed && 'line-through text-muted-foreground')}>
              {item.title}
            </p>
            {timeDisplay && (
                <p className="text-sm text-muted-foreground">
                    {timeDisplay}
                </p>
            )}
        </div>

        {isTask && (
            <div className="flex items-center">
              <Button data-interactive="true" variant="ghost" size="icon" onClick={toggleImportant} className="h-8 w-8 shrink-0">
                  <Star className={cn("h-4 w-4", task.isImportant ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
                  <span className="sr-only">{task.isImportant ? 'Remove importance' : 'Mark as important'}</span>
              </Button>
            </div>
        )}
      </div>
    );
  }

  return (
    <Draggable draggableId={item.id} index={index} isDragDisabled={isDragDisabled || (viewMode === 'detailed' && !isTask)}>
      {(provided) => (
        <>
          {viewMode === 'detailed' ? renderDetailedView(provided) : renderCompactView(provided)}
          {task && <EditTaskDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} task={task} />}
        </>
      )}
    </Draggable>
  );
}
