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
import { useForm, Controller, useFieldArray } from 'react-hook-form';
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
import { Calendar as CalendarIcon, List, Plus, Tag, Trash2, X, Clock, CheckSquare, Check } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { format, isToday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn, getTagColorClasses } from '@/lib/utils';
import React, { useState } from 'react';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

const subtaskSchema = z.object({
  title: z.string().min(1, 'Subtask title cannot be empty.'),
  completed: z.boolean().default(false),
});

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  listId: z.string().min(1, 'Please select a list'),
  dueDate: z.date().optional(),
  time: z.string().optional(),
  duration: z.coerce.number().int().positive().optional(),
  tagIds: z.array(z.string()).optional(),
  subtasks: z.array(subtaskSchema).optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultListId?: string;
}

export function AddTaskDialog({ open, onOpenChange, defaultListId }: AddTaskDialogProps) {
  const { lists, tags } = useTasks();
  const dispatch = useTasksDispatch();
  const { toast } = useToast();
  const [newSubtask, setNewSubtask] = useState('');

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      listId: defaultListId || 'tasks',
      tagIds: [],
      subtasks: [],
    }
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'subtasks',
  });

  const selectedTags = watch('tagIds') || [];

  const onSubmit = (data: TaskFormValues) => {
    let dueDate: string | undefined = undefined;
    let listId = data.listId;

    if (data.dueDate) {
        const date = new Date(data.dueDate);
        if (data.time) {
            const [hours, minutes] = data.time.split(':');
            date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        } else {
            // Set to beginning of the day if no time is specified
            date.setHours(0, 0, 0, 0);
        }
        dueDate = date.toISOString();

        if (isToday(date)) {
            listId = 'my-day';
        }
    }


    const newTask = {
      id: `TASK-${Date.now()}`,
      title: data.title,
      description: data.description,
      completed: false,
      listId: listId,
      dueDate: dueDate,
      duration: data.duration,
      tagIds: data.tagIds || [],
      subtasks: (data.subtasks || []).map(st => ({...st, id: `SUB-${Date.now()}-${Math.random()}`})),
      createdAt: new Date().toISOString(),
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
      reset({ 
        listId: defaultListId || 'tasks', 
        title: '', 
        description: '', 
        dueDate: undefined,
        time: undefined,
        duration: undefined,
        tagIds: [],
        subtasks: [],
       });
    }
  }, [open, defaultListId, reset]);

  const handleAddSubtask = () => {
    if (newSubtask.trim() !== '') {
      append({ title: newSubtask.trim(), completed: false });
      setNewSubtask('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
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
                      {field.value ? format(field.value, 'MMM d, yyyy') : <span>Due date</span>}
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
                name="time"
                control={control}
                render={({field}) => (
                    <Input 
                        type="time"
                        className="h-9"
                        {...field}
                    />
                )}
            />
          </div>

        <div className="grid grid-cols-2 gap-2">
            <Controller
                name="duration"
                control={control}
                render={({ field: { onChange, ...field } }) => (
                    <div className="relative">
                         <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="number"
                            placeholder="Duration (mins)"
                            className="pl-9"
                             onChange={e => onChange(e.target.value === '' ? undefined : +e.target.value)}
                            {...field}
                        />
                    </div>
                )}
            />
            <Controller
              name="listId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} >
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
        {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}


        <div>
            <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Tags</h4>
            </div>
             <Controller
                name="tagIds"
                control={control}
                render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <button
                            type="button"
                            key={tag.id}
                            onClick={() => {
                                const newValue = selectedTags.includes(tag.id)
                                ? selectedTags.filter(id => id !== tag.id)
                                : [...selectedTags, tag.id];
                                field.onChange(newValue);
                            }}
                            className={cn(
                                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors",
                                selectedTags.includes(tag.id)
                                ? getTagColorClasses(tag.color) + ' border-transparent'
                                : 'bg-transparent text-muted-foreground hover:bg-muted'
                            )}
                        >
                        {selectedTags.includes(tag.id) && <Check className="h-3 w-3" />}
                        #{tag.label}
                        </button>
                    ))}
                    </div>
                )}
            />
        </div>

        <div>
            <div className="flex items-center gap-2 mb-2">
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Subtasks</h4>
            </div>
            <ScrollArea className="h-40 rounded-md border">
              <div className="p-4 space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Checkbox checked={field.completed} disabled />
                      <Input {...register(`subtasks.${index}.title`)} className="h-8" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
              </div>
            </ScrollArea>
             <div className="flex items-center gap-2 mt-2">
                <Input
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add a new subtask..."
                    className="h-8"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSubtask();
                        }
                    }}
                />
                <Button type="button" size="sm" onClick={handleAddSubtask}>Add</Button>
            </div>
        </div>

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
