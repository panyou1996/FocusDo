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
import { Save } from 'lucide-react';
import { format, parseISO } from 'date-fns';
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

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent;
}

export function EditEventDialog({ open, onOpenChange, event }: EditEventDialogProps) {
  const { lists } = useTasksClient();
  const dispatch = useTasksDispatch();
  const { toast } = useToast();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (event && open) {
      const startDate = parseISO(event.startTime);
      const endDate = parseISO(event.endTime);
      
      reset({
        title: event.title,
        startTime: format(startDate, 'HH:mm'),
        endTime: format(endDate, 'HH:mm'),
        listId: event.listId,
      });
    }
  }, [open, event, reset]);

  const onSubmit = (data: EventFormValues) => {
    // 保持原来的日期，只更新时间
    const originalStartDate = parseISO(event.startTime);
    const originalEndDate = parseISO(event.endTime);
    
    const [startHours, startMinutes] = data.startTime.split(':');
    const [endHours, endMinutes] = data.endTime.split(':');
    
    const newStartDate = new Date(originalStartDate);
    newStartDate.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10), 0, 0);
    
    const newEndDate = new Date(originalEndDate);
    newEndDate.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10), 0, 0);

    const updatedEvent: CalendarEvent = {
      ...event,
      title: data.title,
      startTime: newStartDate.toISOString(),
      endTime: newEndDate.toISOString(),
      listId: data.listId,
    };

    dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent });
    toast({
      title: 'Event Updated',
      description: `"${data.title}" has been updated.`,
    });
    onOpenChange(false);
  };

  const regularLists = lists.filter(l => !['my-day', 'important'].includes(l.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>
          <VisuallyHidden>Edit Event</VisuallyHidden>
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4 pt-4">
            <div>
              <Input 
                id="title" 
                {...register('title')} 
                placeholder="Event title" 
                className="text-lg font-semibold" 
              />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Start Time</label>
                <Input 
                  type="time"
                  {...register('startTime')}
                />
                {errors.startTime && <p className="text-sm text-destructive mt-1">{errors.startTime.message}</p>}
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">End Time</label>
                <Input 
                  type="time"
                  {...register('endTime')}
                />
                {errors.endTime && <p className="text-sm text-destructive mt-1">{errors.endTime.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">List</label>
              <Controller
                name="listId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select list" />
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
              {errors.listId && <p className="text-sm text-destructive mt-1">{errors.listId.message}</p>}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
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