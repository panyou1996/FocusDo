
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
import { useTasksDispatch } from '@/hooks/use-tasks';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Plus, Palette } from 'lucide-react';
import type { List } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import React from 'react';
import * as Lucide from 'lucide-react';

const listColors = [
  'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray', 'pink', 'brown'
] as const;

const listIcons = [
  'List', 'Briefcase', 'Heart', 'Home', 'Star', 'BookOpen', 'Car', 'Coffee',
  'ShoppingCart', 'Camera', 'Music', 'Gamepad2', 'Dumbbell', 'Plane',
  'Utensils', 'GraduationCap', 'Stethoscope', 'Palette', 'Code', 'Gift'
] as const;

const listSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  color: z.enum(listColors).default('gray'),
  icon: z.string().default('List'),
});

type ListFormValues = z.infer<typeof listSchema>;

interface AddListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddListDialog({ open, onOpenChange }: AddListDialogProps) {
  const dispatch = useTasksDispatch();
  const { toast } = useToast();

  const form = useForm<ListFormValues>({
    resolver: zodResolver(listSchema),
    defaultValues: {
      title: '',
      color: 'gray',
      icon: 'List',
    }
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = (data: ListFormValues) => {
    const newList: List = {
      id: data.title.toLowerCase().replace(/\s+/g, '-'),
      title: data.title,
      icon: data.icon,
      color: data.color,
    };
    dispatch({ type: 'ADD_LIST', payload: newList });
    toast({
      title: 'List Created',
      description: `"${data.title}" list has been added.`,
    });
    reset();
    onOpenChange(false);
  };
  
  React.useEffect(() => {
    if (open) {
      reset({ title: '', color: 'gray', icon: 'List' });
    }
  }, [open, reset]);

  const listColorMap: Record<NonNullable<List['color']>, string> = {
    red: "bg-red-500",
    orange: "bg-orange-500",
    yellow: "bg-yellow-500",
    green: "bg-green-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    gray: "bg-gray-500",
    pink: "bg-pink-500",
    brown: "bg-stone-500",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new list</DialogTitle>
          <DialogDescription>
            Organize your tasks into lists.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Input id="title" {...register('title')} placeholder="e.g. Project Phoenix" />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <Controller
            name="icon"
            control={control}
            render={({ field }) => {
              const IconComponent = (Lucide[field.value as keyof typeof Lucide] as React.ComponentType<{className?: string}>) || Lucide.List;
              return (
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Icon</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <span>{field.value}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="grid grid-cols-5 gap-2">
                        {listIcons.map(iconName => {
                          const Icon = (Lucide[iconName as keyof typeof Lucide] as React.ComponentType<{className?: string}>) || Lucide.List;
                          return (
                            <button
                              key={iconName}
                              type="button"
                              className={cn(
                                "p-2 rounded hover:bg-gray-100 transition-colors",
                                field.value === iconName && "bg-gray-200"
                              )}
                              onClick={() => field.onChange(iconName)}
                            >
                              <Icon className="h-4 w-4" />
                            </button>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              );
            }}
          />

          <Controller
            name="color"
            control={control}
            render={({ field }) => (
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium">Color</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <div className={cn("h-4 w-4 rounded-full", listColorMap[field.value])} />
                                <span>{field.value.charAt(0).toUpperCase() + field.value.slice(1)}</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto">
                           <div className="grid grid-cols-5 gap-2">
                                {listColors.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={cn("h-6 w-6 rounded-full", listColorMap[color])}
                                        onClick={() => field.onChange(color)}
                                    />
                                ))}
                           </div>
                        </PopoverContent>
                    </Popover>
                </div>
            )}
            />

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              <Plus className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Creating...' : 'Create List'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
