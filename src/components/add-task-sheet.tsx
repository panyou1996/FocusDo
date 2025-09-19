'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
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
import { CalendarIcon, Plus } from 'lucide-react';
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

interface AddTaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultListId?: string;
}

export function AddTaskSheet({ open, onOpenChange, defaultListId }: AddTaskSheetProps) {
  const { lists } = useTasks();
  const dispatch = useTasksDispatch();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>Add a new task</SheetTitle>
            <SheetDescription>
              Fill in the details below to create a new task.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-6 overflow-y-auto p-1 py-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} placeholder="e.g. Finalize presentation" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} placeholder="Add more details..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <Label>Due Date</Label>
                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
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
               </div>
               <div>
                  <Label htmlFor="listId">List</Label>
                  <Controller
                    name="listId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a list" />
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
                  {errors.listId && <p className="text-sm text-destructive">{errors.listId.message}</p>}
               </div>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Create Task
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
