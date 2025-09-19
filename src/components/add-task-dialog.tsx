'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useTasks, useTasksDispatch } from '@/hooks/use-tasks';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarIcon, List, Plus } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import React from 'react';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  listId: z.string().min(1, 'Please select a list'),
  dueDate: z.date().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultListId?: string;
}

export function AddTaskDialog({ open, onOpenChange, defaultListId }: AddTaskDialogProps) {
  const { lists } = useTasks();
  const dispatch = useTasksDispatch();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      listId: defaultListId || 'tasks',
    }
  });

  const onSubmit = (data: TaskFormValues) => {
    const newTask = {
      id: `TASK-${Date.now()}`,
      title: data.title,
      description: data.description,
      completed: false,
      listId: data.listId,
      dueDate: data.dueDate?.toISOString(),
      createdAt: new Date().toISOString(),
      tagIds: [],
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
    toast({
      title: 'Task Created',
      description: `"${data.title}" has been added.`,
    });
    reset();
    onOpenChange(false);
  };
  
  React.useEffect(() => {
    if (open) {
      reset({ listId: defaultListId || 'tasks', title: '', description: '', dueDate: undefined });
    }
  }, [open, defaultListId, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a new task</DialogTitle>
          <DialogDescription>
            What needs to get done?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Input id="title" {...register('title')} placeholder="e.g. Finalize presentation" className="text-base" />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            <Textarea id="description" {...register('description')} placeholder="Add more details..." />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      size="sm"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'MMM d') : <span>Due date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            <Controller
              name="listId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="w-full h-9 px-3">
                     <div className="flex items-center gap-2">
                        <List className="h-4 w-4" />
                        <SelectValue placeholder="Select a list" />
                     </div>
                  </SelectTrigger>
                  <SelectContent>
                    {lists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {errors.listId && <p className="text-sm text-destructive">{errors.listId.message}</p>}
        
          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
                <Plus className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
