'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Calendar as CalendarIcon, List, Plus, Tag, Trash2, X, Clock, CheckSquare, Check, Star, Sun, Save, PlusCircle, Pencil } from 'lucide-react';
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

  const onSubmit = (data: TaskFormValues) => {
    let startTime: string | undefined = undefined;
    if (data.isMyDay && data.startTime) {
      const today = new Date();
      const [hours, minutes] = data.startTime.split(':');
      today.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      startTime = today.toISOString();
    } else {
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
      subtasks: (data.subtasks || []).map(st => ({ ...st, id: st.id || `SUB-${Date.now()}-${Math.random()}` })),
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
      <DialogContent className="sm:max-w-lg p-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="max-h-[70vh]">
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Task title"
                  className="text-xl font-semibold border-none shadow-none p-0 focus-visible:ring-0"
                />
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Add a description..."
                  className="border-none shadow-none p-0 focus-visible:ring-0 min-h-[40px] text-sm text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
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
                      <Input {...register(`subtasks.${index}.title`)} className="h-8 text-sm" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add a new subtask..."
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddSubtask} className="flex-shrink-0 text-xs h-8">
                    <Plus className="mr-1 h-3 w-3" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between bg-muted/50 p-2.5 rounded-md">
                  <Label htmlFor="isMyDay-edit" className="flex items-center gap-2.5 cursor-pointer text-sm">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    <span>My Day</span>
                  </Label>
                  <Controller
                    name="isMyDay"
                    control={control}
                    render={({ field }) => <Switch id="isMyDay-edit" checked={field.value} onCheckedChange={field.onChange} />}
                  />
                </div>

                <div className="flex items-center justify-between bg-muted/50 p-2.5 rounded-md">
                  <Label htmlFor="isImportant-edit" className="flex items-center gap-2.5 cursor-pointer text-sm">
                    <Star className="h-4 w-4 text-blue-500" />
                    <span>Important</span>
                  </Label>
                  <Controller
                    name="isImportant"
                    control={control}
                    render={({ field }) => <Switch id="isImportant-edit" checked={field.value} onCheckedChange={field.onChange} />}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Due Date</Label>
                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={cn('w-full justify-start text-left font-normal h-9', !field.value && 'text-muted-foreground')}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'MMM d, yyyy') : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>

                {isMyDay && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Start Time</Label>
                    <Controller
                      name="startTime"
                      control={control}
                      render={({ field }) => <Input type="time" {...field} className="w-full h-9" />}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">List</Label>
                <Controller
                  name="listId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select a list" />
                      </SelectTrigger>
                      <SelectContent>
                        {regularLists.map((list) => (
                          <SelectItem key={list.id} value={list.id}>
                            <div className="flex items-center gap-2">
                              <div className={cn("h-2 w-2 rounded-full", listColorMap[list.color || 'gray'])} />
                              <span>{list.title}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Tags</Label>
                <Controller
                  name="tagIds"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-1.5">
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
                            "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors",
                            selectedTags.includes(tag.id)
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : 'bg-muted/50 hover:bg-muted'
                          )}
                        >
                          {tag.label}
                        </button>
                      ))}
                      <Popover open={isAddTagPopoverOpen} onOpenChange={setIsAddTagPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" size="sm" className="h-auto py-0.5 text-xs">
                            <Plus className="mr-1 h-3 w-3" />
                            New
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-60 p-2">
                          <div className="space-y-1.5">
                            <p className="text-sm font-medium">Create tag</p>
                            <Input
                              placeholder="Tag name"
                              value={newTagName}
                              onChange={(e) => setNewTagName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddNewTag();
                                }
                              }}
                            />
                            <Button onClick={handleAddNewTag} size="sm" className="w-full">Create</Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t bg-muted/30 justify-between">
            <Button variant="ghost" type="button" onClick={() => {
              dispatch({ type: 'DELETE_TASK', payload: task.id });
              onOpenChange(false);
            }} disabled={isSubmitting} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
