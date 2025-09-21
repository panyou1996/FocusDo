'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarEvent } from '@/lib/types';
import { useTasksClient, useTasksDispatch } from '@/hooks/use-tasks';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { cn, listColorMap } from '@/lib/utils';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  listId: z.string().min(1, 'List is required'),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultListId?: string;
}

export function AddEventDialog({ open, onOpenChange, defaultListId }: AddEventDialogProps) {
  const { lists } = useTasksClient();
  const dispatch = useTasksDispatch();
  const { toast } = useToast();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      startTime: '',
      endTime: '',
      listId: defaultListId || 'personal',
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (open) {
      reset({
        title: '',
        startTime: '',
        endTime: '',
        listId: defaultListId || 'personal',
      });
    }
  }, [open, defaultListId, reset]);

  const onSubmit = (data: EventFormValues) => {
    const today = new Date();
    const [startHours, startMinutes] = data.startTime.split(':');
    const [endHours, endMinutes] = data.endTime.split(':');
    
    const startDate = new Date(today);
    startDate.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10), 0, 0);
    
    const endDate = new Date(today);
    endDate.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10), 0, 0);

    const newEvent: CalendarEvent = {
      id: `EVENT-${Date.now()}`,
      title: data.title,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      listId: data.listId,
    };

    dispatch({ type: 'ADD_EVENT', payload: newEvent });
    toast({
      title: '日程已创建',
      description: `"${data.title}" 已添加到您的日程中。`,
    });
    onOpenChange(false);
  };

  const regularLists = lists.filter(l => !['my-day', 'important'].includes(l.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="flex items-center gap-2 text-lg font-medium">
          <Calendar className="h-5 w-5 text-primary" />
          添加日程
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-3">
            <Input 
              id="title" 
              {...register('title')} 
              placeholder="日程标题" 
              className="text-base border-none shadow-none px-0 text-lg font-medium focus-visible:ring-0" 
              autoFocus
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>时间:</span>
                <Input 
                  type="time"
                  {...register('startTime')}
                  className="h-8 w-20 border-none shadow-none focus-visible:ring-0 px-1 text-center"
                />
                <span>-</span>
                <Input 
                  type="time"
                  {...register('endTime')}
                  className="h-8 w-20 border-none shadow-none focus-visible:ring-0 px-1 text-center"
                />
              </div>
            </div>
            {(errors.startTime || errors.endTime) && (
              <p className="text-sm text-destructive">
                {errors.startTime?.message || errors.endTime?.message}
              </p>
            )}

            <Controller
              name="listId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-8 border-none shadow-none focus:ring-0">
                    <div className="flex items-center gap-2">

                      <SelectValue placeholder="选择列表" />
                    </div>
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
            {errors.listId && <p className="text-sm text-destructive">{errors.listId.message}</p>}
          </div>

          <DialogFooter className="pt-2">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? '创建中...' : '创建日程'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}