
'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useTasksClient, useTasksDispatch } from '@/hooks/use-tasks';
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
import { Calendar as CalendarIcon, List, Plus, Tag, Trash2, X, Clock, CheckSquare, Check, Star, Sun, Save, PlusCircle } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn, listColorMap } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import type { Tag as TagType, Task } from '@/lib/types';

const subtaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Subtask title cannot be empty.'),
  completed: z.boolean().default(false),
});

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  listId: z.string().min(1, 'Please select a list'),
  dueDate: z.date().optional(),
  startTime: z.string().optional(),
  duration: z.coerce.number().int().positive().optional(),
  tagIds: z.array(z.string()).optional(),
  subtasks: z.array(subtaskSchema).optional(),
  isMyDay: z.boolean().optional(),
  isImportant: z.boolean().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}

export function EditTaskDialog({ open, onOpenChange, task }: EditTaskDialogProps) {
  const { lists, tags } = useTasksClient();
  const dispatch = useTasksDispatch();
  const { toast } = useToast();
  const [newSubtask, setNewSubtask] = useState('');
  const [isAddTagPopoverOpen, setIsAddTagPopoverOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const isMyDay = watch('isMyDay');
  const selectedListId = watch('listId');

  useEffect(() => {
    if (task && open) {
      reset({ 
        title: task.title,
        description: task.description,
        listId: task.listId,
        dueDate: task.dueDate ? parseISO(task.dueDate) : undefined,
        startTime: task.startTime ? format(parseISO(task.startTime), 'HH:mm') : undefined,
        duration: task.duration,
        tagIds: task.tagIds || [],
        subtasks: task.subtasks || [],
        isMyDay: task.isMyDay,
        isImportant: task.isImportant,
       });
    }
  }, [open, task, reset]);


  const { fields, append, remove } = useFieldArray({
    control,
    name: 'subtasks',
  });

  const selectedTags = watch('tagIds') || [];
  const selectedList = lists.find(l => l.id === selectedListId);

  const onSubmit = (data: TaskFormValues) => {
    let startTime: string | undefined = undefined;
    if (data.isMyDay && data.startTime) {
        const today = new Date();
        const [hours, minutes] = data.startTime.split(':');
        today.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        startTime = today.toISOString();
    } else {
        // 如果不是"我的一天"或者没有设置时间，则清空startTime
        startTime = undefined;
    }

    const updatedTask: Task = {
      ...task,
      title: data.title,
      description: data.description,
      isMyDay: data.isMyDay,
      isImportant: data.isImportant,
      listId: data.listId,
      dueDate: data.dueDate?.toISOString(),
      startTime: startTime,
      duration: data.duration,
      tagIds: data.tagIds || [],
      subtasks: (data.subtasks || []).map(st => ({...st, id: st.id || `SUB-${Date.now()}-${Math.random()}`})),
    };

    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    toast({
      title: 'Task Updated',
      description: `"${data.title}" has been updated.`,
    });
    onOpenChange(false);
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim() !== '') {
      append({ id: `SUB-${Date.now()}-${Math.random()}`, title: newSubtask.trim(), completed: false });
      setNewSubtask('');
    }
  };

  const handleAddNewTag = () => {
    if (newTagName.trim()) {
      const newTag: TagType = {
        id: newTagName.trim().toLowerCase().replace(/\s+/g, '-'),
        label: newTagName.trim(),
      };
      dispatch({ type: 'ADD_TAG', payload: newTag });
      setNewTagName('');
      setIsAddTagPopoverOpen(false);
    }
  };

  const regularLists = lists.filter(l => !['my-day', 'important'].includes(l.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogTitle>
          <VisuallyHidden>Edit Task</VisuallyHidden>
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 w-full">
                <div className="space-y-4 pt-6 pb-6 px-6">
                    <div>
                        <Input 
                            id="title" 
                            {...register('title')} 
                            placeholder="e.g. Finalize presentation" 
                            className="text-xl font-semibold border-none -ml-2 shadow-none focus-visible:ring-0" 
                        />
                        {errors.title && <p className="text-sm text-destructive ml-3">{errors.title.message}</p>}
                         <Textarea 
                            id="description" 
                            {...register('description')} 
                            placeholder="Add more details..." 
                            className="border-none shadow-none focus-visible:ring-0 -ml-2"
                        />
                    </div>
                    
                    <div className="space-y-4 px-1">

                        <div className="flex items-center space-x-4">
                            <Controller
                                name="isMyDay"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex items-center space-x-2">
                                        <Switch id="isMyDay-edit" checked={field.value} onCheckedChange={field.onChange} />
                                        <Label htmlFor="isMyDay-edit" className="flex items-center gap-2 cursor-pointer">
                                            <Sun className="h-4 w-4 text-yellow-500" />
                                            Add to My Day
                                        </Label>
                                    </div>
                                )}
                            />
                            <Controller
                                name="isImportant"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex items-center space-x-2">
                                        <Switch id="isImportant-edit" checked={field.value} onCheckedChange={field.onChange} />
                                        <Label htmlFor="isImportant-edit" className="flex items-center gap-2 cursor-pointer">
                                            <Star className="h-4 w-4 text-muted-foreground" />
                                            Mark as Important
                                        </Label>
                                    </div>
                                )}
                            />
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
                            {isMyDay && (
                                <Controller
                                    name="startTime"
                                    control={control}
                                    render={({field: { value, onChange }}) => (
                                        <div className="relative">
                                            <Input 
                                                type="time"
                                                className="h-9 pr-8"
                                                placeholder="开始时间"
                                                value={value || ''}
                                                onChange={(e) => onChange(e.target.value)}
                                            />
                                            {value && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted rounded-full"
                                                    onClick={() => onChange('')}
                                                    title="清空开始时间"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                             <Controller
                                name="duration"
                                control={control}
                                render={({ field: { onChange, ...field } }) => (
                                    <Input 
                                        type="number"
                                        placeholder="持续时间 (分钟)"
                                        className="h-9"
                                        onChange={e => onChange(e.target.value === '' ? undefined : +e.target.value)}
                                        {...field}
                                    />
                                )}
                            />
                            <Controller
                                name="listId"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="w-full h-9 px-3">
                                        <div className="flex items-center gap-2">

                                            <SelectValue placeholder="Select a list" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {regularLists.map((list) => (
                                        <SelectItem key={list.id} value={list.id}>
                                           <div className="flex items-center gap-2">
                                                <div className={cn("h-2.5 w-2.5 rounded-full", listColorMap[list.color || 'gray'])} />
                                                <span>{list.title}</span>
                                            </div>
                                        </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        {errors.listId && <p className="text-sm text-destructive">{errors.listId.message}</p>}
                        {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
                        
                        <div className="space-y-2">
                             <div className="flex items-center gap-2">
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
                                                ? 'bg-muted border-transparent'
                                                : 'bg-transparent text-muted-foreground hover:bg-muted border-dashed'
                                            )}
                                        >
                                        {selectedTags.includes(tag.id) && <Check className="h-3 w-3" />}
                                        #{tag.label}
                                        </button>
                                    ))}
                                    <Popover open={isAddTagPopoverOpen} onOpenChange={setIsAddTagPopoverOpen}>
                                        <PopoverTrigger asChild>
                                        <Button type="button" variant="outline" size="sm" className="h-auto py-1 text-xs">
                                                <Plus className="mr-1 h-3 w-3" />
                                                New Tag
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-60">
                                            <div className="space-y-4">
                                                <h4 className="font-medium leading-none">Create a new tag</h4>
                                                <Input 
                                                    placeholder="Tag name" 
                                                    value={newTagName} 
                                                    onChange={(e) => setNewTagName(e.target.value)}
                                                />
                                                <Button onClick={handleAddNewTag} className="w-full">Create</Button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    </div>
                                )}
                            />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                                <h4 className="text-sm font-medium">Subtasks</h4>
                            </div>
                            <div className="space-y-2">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-2">
                                    <Controller
                                        name={`subtasks.${index}.completed`}
                                        control={control}
                                        render={({ field: checkboxField }) => (
                                        <Checkbox
                                            checked={checkboxField.value}
                                            onCheckedChange={checkboxField.onChange}
                                            />
                                        )}
                                    />
                                    <Input {...register(`subtasks.${index}.title`)} className="h-8" />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8 flex-shrink-0">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
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
                                <Button type="button" size="icon" variant="ghost" onClick={handleAddSubtask} className="h-8 w-8 flex-shrink-0">
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>
            <DialogFooter className="pt-4 px-6 pb-6 border-t">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    