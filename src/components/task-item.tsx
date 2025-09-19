'use client';
import type { Task } from '@/lib/types';
import { useTasks, useTasksDispatch } from '@/hooks/use-tasks';
import { Checkbox } from './ui/checkbox';
import { cn, getTagColorClasses } from '@/lib/utils';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { Badge } from './ui/badge';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { tags, lists } = useTasks();
  const dispatch = useTasksDispatch();

  const handleCheckedChange = (checked: boolean) => {
    dispatch({ type: 'UPDATE_TASK', payload: { ...task, completed: checked } });
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

  return (
    <div
      className={cn(
        'group flex items-start gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-all hover:shadow-md animate-in fade-in-50',
        task.completed && 'bg-card/60 opacity-70'
      )}
    >
      <div className="flex flex-col items-center gap-2 pt-1">
        <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={handleCheckedChange}
            className="h-5 w-5 rounded-full"
            aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />
        {dueDateLabel && (
            <span className={cn(
                "text-xs font-semibold w-max px-2 py-0.5 rounded-full",
                isToday(parseISO(task.dueDate!)) ? "bg-primary/20 text-primary-foreground-dark" : "bg-muted text-muted-foreground"
            )}>
                {dueDateLabel}
            </span>
        )}
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
        <div className="mt-2 flex items-center gap-2">
            {getTaskTags().map((tag) => (
                <Badge key={tag.id} variant="outline" className={cn("text-xs font-normal border", getTagColorClasses(tag.color))}>
                    #{tag.label}
                </Badge>
            ))}
        </div>
      </div>
    </div>
  );
}
