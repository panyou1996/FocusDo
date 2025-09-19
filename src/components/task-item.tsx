'use client';
import type { Task } from '@/lib/types';
import { useTasks, useTasksDispatch } from '@/hooks/use-tasks';
import { Checkbox } from './ui/checkbox';
import { cn, getTagColorClasses } from '@/lib/utils';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Clock, Sun, X, Calendar, GripVertical } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useState } from 'react';
import { Input } from './ui/input';

interface TaskItemProps {
  task: Task;
  variant?: 'default' | 'my-day';
}

export function TaskItem({ task, variant = 'default' }: TaskItemProps) {
  const { tags } = useTasks();
  const dispatch = useTasksDispatch();
  const [newTime, setNewTime] = useState(task.dueDate ? format(parseISO(task.dueDate), 'HH:mm') : '');
  const [isTimePopoverOpen, setIsTimePopoverOpen] = useState(false);


  const handleCheckedChange = (checked: boolean) => {
    dispatch({ type: 'UPDATE_TASK', payload: { ...task, completed: checked } });
  };
  
  const handleSubtaskCheckedChange = (subtaskId: string, checked: boolean) => {
    const updatedSubtasks = task.subtasks.map(st => st.id === subtaskId ? {...st, completed: checked} : st);
    const allSubtasksCompleted = updatedSubtasks.every(st => st.completed);
    dispatch({ type: 'UPDATE_TASK', payload: { ...task, subtasks: updatedSubtasks, completed: allSubtasksCompleted } });
  };

  const toggleMyDay = () => {
    if (task.listId === 'my-day') {
      // Remove from My Day, move to 'tasks' list
      dispatch({ type: 'UPDATE_TASK', payload: { ...task, listId: 'tasks' } });
    } else {
      // Add to My Day, ensuring it has a date
      const updatedTask = { ...task, listId: 'my-day' };
      if (!updatedTask.dueDate) {
        updatedTask.dueDate = new Date().toISOString();
      }
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    }
  };

  const handleTimeChange = () => {
    if (task.dueDate && newTime) {
      const date = parseISO(task.dueDate);
      const [hours, minutes] = newTime.split(':');
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      dispatch({ type: 'UPDATE_TASK', payload: { ...task, dueDate: date.toISOString() } });
      setIsTimePopoverOpen(false); // Close popover after setting time
    } else if (!task.dueDate && newTime) {
      // if task has no due date, set it to today with new time
      const date = new Date();
      const [hours, minutes] = newTime.split(':');
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      dispatch({ type: 'UPDATE_TASK', payload: { ...task, dueDate: date.toISOString() } });
      setIsTimePopoverOpen(false);
    }
  };


  const getTaskTags = () => {
    return tags.filter(tag => task.tagIds.includes(tag.id));
  };

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
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                         />
                         <Button size="sm" onClick={handleTimeChange}>Set</Button>
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
             <div className="flex-grow space-y-1 pt-1">
                <p className={cn('font-medium', task.completed && 'line-through text-muted-foreground')}>{task.title}</p>
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
                      <Badge key={tag.id} variant="outline" className={cn("text-xs font-normal border", getTagColorClasses(tag.color))}>
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
        </div>
     );
  }


  return (
    <div
      className={cn(
        'group relative flex flex-col gap-2 rounded-lg border bg-card p-3 text-card-foreground shadow-sm transition-all hover:shadow-md animate-in fade-in-50',
        task.completed && 'bg-card/60 opacity-70'
      )}
    >
        <div className="flex items-start gap-3">
             <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={handleCheckedChange}
                className="h-5 w-5 rounded-full mt-0.5"
                aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
            />
            <div className="flex-1">
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
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {dueDateLabel && (
                        <span className={cn(
                            "flex items-center gap-1.5 font-semibold",
                             task.dueDate && isToday(parseISO(task.dueDate)) ? "text-primary" : ""
                        )}>
                            <Calendar className="h-3 w-3" />
                            {dueDateLabel} {hasTime && format(parseISO(task.dueDate!), 'HH:mm')}
                        </span>
                    )}
                    {task.duration && (
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {task.duration} min
                        </span>
                    )}
                     {taskTags.map((tag) => (
                        <Badge key={tag.id} variant="outline" className={cn("text-xs font-normal border", getTagColorClasses(tag.color))}>
                            #{tag.label}
                        </Badge>
                    ))}
                </div>
            </div>
             <Button variant="ghost" size="icon" onClick={toggleMyDay} className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {task.listId === 'my-day' ? (
                    <X className="h-4 w-4 text-red-500" />
                ) : (
                    <Sun className="h-4 w-4 text-yellow-500" />
                )}
                <span className="sr-only">{task.listId === 'my-day' ? 'Remove from My Day' : 'Add to My Day'}</span>
            </Button>
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
  );
}
