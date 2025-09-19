
'use client';
import type { Task } from '@/lib/types';
import { useTasks, useTasksDispatch } from '@/hooks/use-tasks';
import { Checkbox } from './ui/checkbox';
import { cn, getListColorClasses } from '@/lib/utils';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Clock, Sun, X, Calendar, GripVertical, Star, CalendarDays, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useMemo, useState } from 'react';
import { Input } from './ui/input';
import { EditTaskDialog } from './edit-task-dialog';
import { Calendar as CalendarPicker } from './ui/calendar';

interface TaskItemProps {
  task: Task;
  variant?: 'default' | 'my-day';
}

export function TaskItem({ task, variant = 'default' }: TaskItemProps) {
  const { lists, tags } = useTasks();
  const dispatch = useTasksDispatch();
  const [newTime, setNewTime] = useState(task.dueDate ? format(parseISO(task.dueDate), 'HH:mm') : '');
  const [isTimePopoverOpen, setIsTimePopoverOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);


  const handleCheckedChange = (checked: boolean) => {
    dispatch({ type: 'UPDATE_TASK', payload: { ...task, completed: checked } });
  };
  
  const handleSubtaskCheckedChange = (subtaskId: string, checked: boolean) => {
    const updatedSubtasks = task.subtasks.map(st => st.id === subtaskId ? {...st, completed: checked} : st);
    const allSubtasksCompleted = updatedSubtasks.every(st => st.completed);
    dispatch({ type: 'UPDATE_TASK', payload: { ...task, subtasks: updatedSubtasks, completed: allSubtasksCompleted } });
  };

  const toggleMyDay = () => {
    const updatedTask = { ...task, isMyDay: !task.isMyDay };
    if (updatedTask.isMyDay && !updatedTask.dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for an "all-day" task
        updatedTask.dueDate = today.toISOString();
    }
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
  };

  const handleTimeChange = (e: React.FocusEvent<HTMLInputElement>) => {
    const time = e.target.value;
    const date = task.dueDate ? parseISO(task.dueDate) : new Date();
    if (time) {
      const [hours, minutes] = time.split(':');
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      dispatch({ type: 'UPDATE_TASK', payload: { ...task, dueDate: date.toISOString() } });
    } else {
      // If time is cleared, reset to midnight
      date.setHours(0, 0, 0, 0);
      dispatch({ type: 'UPDATE_TASK', payload: { ...task, dueDate: date.toISOString() } });
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    let newDueDate: string | undefined;

    if (date) {
      const currentDueDate = task.dueDate ? parseISO(task.dueDate) : new Date();
      const newDate = new Date(date);
      // Preserve existing time if it exists, otherwise default to midnight
      newDate.setHours(currentDueDate.getHours(), currentDueDate.getMinutes(), currentDueDate.getSeconds(), currentDueDate.getMilliseconds());
      newDueDate = newDate.toISOString();
    } else {
      // This handles the "Remove due date" case
      newDueDate = undefined;
    }
    
    dispatch({ type: 'UPDATE_TASK', payload: { ...task, dueDate: newDueDate } });
  }

  const handleDurationChange = (e: React.FocusEvent<HTMLInputElement>) => {
    const duration = e.target.value ? parseInt(e.target.value) : undefined;
    dispatch({ type: 'UPDATE_TASK', payload: { ...task, duration: duration } });
  }

  const handleRemoveTag = (tagId: string) => {
    const newTagIds = task.tagIds.filter(id => id !== tagId);
    dispatch({ type: 'UPDATE_TASK', payload: { ...task, tagIds: newTagIds } });
  }

  const toggleImportant = () => {
    dispatch({ type: 'UPDATE_TASK', payload: { ...task, isImportant: !task.isImportant } });
  };


  const getTaskTags = () => {
    return tags.filter(tag => task.tagIds.includes(tag.id));
  };
  
  const getTaskList = useMemo(() => {
    return lists.find(list => list.id === task.listId);
  }, [task.listId, lists]);

  const getDueDateLabel = () => {
    if (!task.dueDate) return null;
    const date = parseISO(task.dueDate);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, 'MMM d');
  };

  const dueDateLabel = getDueDateLabel();
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  const taskTags = getTaskTags();
  const taskList = getTaskList;

  const hasTime = task.dueDate && format(parseISO(task.dueDate), 'HH:mm') !== '00:00';

  if (variant === 'my-day' && !task.completed) {
     return (
        <div className={cn('group relative flex items-start gap-4 rounded-lg p-4 transition-colors hover:bg-muted/50', task.completed && 'opacity-60')}>
            {/* Time and Date Section */}
            <div className="flex-shrink-0 text-right w-14">
                <Popover open={isTimePopoverOpen} onOpenChange={setIsTimePopoverOpen}>
                    <PopoverTrigger asChild>
                        <button className="text-lg font-bold focus:outline-none focus:ring-2 focus:ring-ring rounded-md px-1 -mx-1 h-7">
                            {hasTime ? format(parseISO(task.dueDate!), 'HH:mm') : <Clock className="h-4 w-4 text-muted-foreground" />}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2">
                       <div className="flex gap-2">
                         <Input 
                            type="time"
                            defaultValue={hasTime ? format(parseISO(task.dueDate!), 'HH:mm') : ''}
                            onBlur={handleTimeChange}
                         />
                       </div>
                    </PopoverContent>
                </Popover>
                {task.dueDate && (
                    <p className="text-xs text-muted-foreground">{format(parseISO(task.dueDate), 'MMM d')}</p>
                )}
            </div>

             {/* Divider */}
            <div className="h-full border-l"></div>

             {/* Task Details Section */}
             <div className="flex-grow space-y-1 pt-1" onClick={() => setIsEditDialogOpen(true)}>
                <p className={cn('font-medium cursor-pointer', task.completed && 'line-through text-muted-foreground')}>{task.title}</p>
                {task.description && (
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                )}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {task.duration && (
                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {task.duration}m
                        </span>
                    )}
                    {taskTags.map(tag => (
                      <Badge key={tag.id} variant="outline" className="text-xs font-normal border">
                        #{tag.label}
                      </Badge>
                    ))}
                    {totalSubtasks > 0 && (
                        <span>{completedSubtasks}/{totalSubtasks}</span>
                    )}
                </div>
             </div>

              {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={toggleMyDay} className="h-8 w-8 shrink-0">
                    <X className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Remove from My Day</span>
                </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 cursor-grab">
                    <GripVertical className="h-4 w-4" />
                </Button>
            </div>
            <EditTaskDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} task={task} />
        </div>
     );
  }


  return (
    <>
    <div
      className={cn(
        'group relative flex flex-col gap-2 rounded-lg border shadow-sm transition-all hover:shadow-md animate-in fade-in-50 p-3 text-card-foreground',
        getListColorClasses(taskList?.color),
        task.completed && 'opacity-70'
      )}
    >
        <div className="flex items-start gap-3">
             <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={handleCheckedChange}
                className="h-5 w-5 rounded-full mt-0.5 border-primary"
                aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
            />
            <div className="flex-1" onClick={(e) => {
                // Prevent opening edit dialog when clicking on interactive elements
                if ((e.target as HTMLElement).closest('[data-interactive="true"]')) return;
                setIsEditDialogOpen(true);
            }}>
                <label
                htmlFor={`task-${task.id}`}
                className={cn(
                    'font-medium cursor-pointer',
                    task.completed && 'line-through text-muted-foreground'
                )}
                >
                {task.title}
                </label>
                {task.description && (
                <p className="text-sm text-muted-foreground">{task.description}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                data-interactive="true"
                                className={cn("flex items-center gap-1.5 font-semibold rounded-md -ml-1 px-1 py-0.5 hover:bg-muted",
                                dueDateLabel && task.dueDate && isToday(parseISO(task.dueDate)) ? "text-primary" : ""
                            )}>
                                <CalendarDays className="h-3 w-3" />
                                {dueDateLabel ? (
                                    <>
                                        {dueDateLabel} {hasTime && format(parseISO(task.dueDate!), 'HH:mm')}
                                    </>
                                ) : (
                                    <span>Set due date</span>
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <CalendarPicker
                                mode="single"
                                selected={task.dueDate ? parseISO(task.dueDate) : undefined}
                                onSelect={handleDateChange}
                            />
                            <div className="p-2 border-t">
                                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={(e) => { e.stopPropagation(); handleDateChange(undefined) }}>
                                    <X className="mr-2 h-4 w-4"/>
                                    Remove due date
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                    
                    <Popover>
                        <PopoverTrigger asChild>
                             <button
                                data-interactive="true"
                                className="flex items-center gap-1.5 font-semibold rounded-md px-1 py-0.5 hover:bg-muted"
                            >
                                <Clock className="h-3 w-3" />
                                {task.duration ? `${task.duration} min` : 'Set duration'}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2">
                            <div className="flex gap-2">
                                <Input type="number" placeholder="Mins" defaultValue={task.duration} onBlur={handleDurationChange} />
                            </div>
                        </PopoverContent>
                    </Popover>

                    <div data-interactive="true" className="flex items-center gap-1">
                        <Tag className="h-3 w-3"/>
                        {taskTags.map((tag) => (
                            <Badge 
                                key={tag.id} 
                                variant="outline" 
                                className="text-xs font-normal group/tag relative pr-5 cursor-pointer hover:border-destructive"
                                onClick={() => handleRemoveTag(tag.id)}
                            >
                                #{tag.label}
                                <span className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover/tag:inline">
                                    <X className="h-3 w-3" />
                                </span>
                            </Badge>
                        ))}
                        {taskTags.length === 0 && <span className="font-semibold text-muted-foreground">Add tag</span>}
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
            <div className="pl-8 space-y-2 mt-1">
                {totalSubtasks > 0 && <Progress value={subtaskProgress} className="h-1" />}
                <div className="space-y-1 text-sm text-muted-foreground">
                    {completedSubtasks} of {totalSubtasks} completed
                </div>
                {/* Collapsible subtasks could be an option here if needed */}
            </div>
        )}
    </div>
    <EditTaskDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} task={task} />
    </>
  );
}

    

      

    