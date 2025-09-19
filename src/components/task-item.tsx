'use client';
import type { Task } from '@/lib/types';
import { useTasks, useTasksDispatch } from '@/hooks/use-tasks';
import { Checkbox } from './ui/checkbox';
import { cn, getTagColorClasses } from '@/lib/utils';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Check, Clock } from 'lucide-react';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { tags, lists } = useTasks();
  const dispatch = useTasksDispatch();

  const handleCheckedChange = (checked: boolean) => {
    dispatch({ type: 'UPDATE_TASK', payload: { ...task, completed: checked } });
  };
  
  const handleSubtaskCheckedChange = (subtaskId: string, checked: boolean) => {
    const updatedSubtasks = task.subtasks.map(st => st.id === subtaskId ? {...st, completed: checked} : st);
    const allSubtasksCompleted = updatedSubtasks.every(st => st.completed);
    dispatch({ type: 'UPDATE_TASK', payload: { ...task, subtasks: updatedSubtasks, completed: allSubtasksCompleted } });
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


  return (
    <div
      className={cn(
        'group flex flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-all hover:shadow-md animate-in fade-in-50',
        task.completed && 'bg-card/60 opacity-70'
      )}
    >
        <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-2 pt-1">
                <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={handleCheckedChange}
                    className="h-5 w-5 rounded-full"
                    aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                />
            </div>
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
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    {dueDateLabel && (
                        <span className={cn(
                            "flex items-center gap-1.5 font-semibold",
                            isToday(parseISO(task.dueDate!)) ? "text-primary" : ""
                        )}>
                            <Clock className="h-3 w-3" />
                            {dueDateLabel} {task.dueDate && format(parseISO(task.dueDate), 'HH:mm')}
                        </span>
                    )}
                    {task.duration && (
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {task.duration} min
                        </span>
                    )}
                </div>
                <div className="mt-2 flex items-center gap-2">
                    {getTaskTags().map((tag) => (
                        <Badge key={tag.id} variant="outline" className={cn("text-xs font-normal border", getTagColorClasses(tag.color))}>
                            #{tag.label}
                        </Badge>
                    ))}
                </div>
            </div>
        </div>
        {task.subtasks && task.subtasks.length > 0 && (
            <div className="pl-8 space-y-2">
                <Progress value={subtaskProgress} className="h-1" />
                <div className="space-y-1">
                    {task.subtasks.map(subtask => (
                        <div key={subtask.id} className="flex items-center gap-2">
                            <Checkbox 
                                id={`subtask-${subtask.id}`}
                                checked={subtask.completed}
                                onCheckedChange={(checked) => handleSubtaskCheckedChange(subtask.id, !!checked)}
                                className="h-4 w-4"
                            />
                            <label 
                                htmlFor={`subtask-${subtask.id}`}
                                className={cn("text-sm flex-1", subtask.completed && "line-through text-muted-foreground")}
                            >
                                {subtask.title}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}
