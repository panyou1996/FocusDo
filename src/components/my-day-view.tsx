
'use client';

import { useTasks, useTasksDispatch } from '@/hooks/use-tasks';
import { useMemo } from 'react';
import { TaskList } from './task-list';
import { parseISO } from 'date-fns';
import { Calendar } from 'lucide-react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import type { Task } from '@/lib/types';


export function MyDayView() {
  const { tasks } = useTasks();
  const dispatch = useTasksDispatch();

  const myDayTasks = useMemo(() => {
    return tasks
      .filter((task) => task.isMyDay)
      .sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;

        if (a.startTime && b.startTime) return parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime();
        if (a.startTime) return -1;
        if (b.startTime) return 1;

        if (a.isImportant && !b.isImportant) return -1;
        if (!a.isImportant && b.isImportant) return 1;
        
        return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime();
      });
  }, [tasks]);


  const tasksWithTime = myDayTasks.filter(t => t.startTime && !t.completed);
  const allDayTasks = myDayTasks.filter(t => !t.startTime && !t.completed);
  const completedTasks = myDayTasks.filter(t => t.completed);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceList = source.droppableId === 'timed-tasks' ? tasksWithTime : allDayTasks;
    const destinationList = destination.droppableId === 'timed-tasks' ? tasksWithTime : allDayTasks;
    
    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;
    
    // Reordering within the timed list
    if (source.droppableId === 'timed-tasks' && destination.droppableId === 'timed-tasks') {
        const newList = Array.from(sourceList);
        const [removed] = newList.splice(source.index, 1);
        newList.splice(destination.index, 0, removed);
        
        // This is a simplified re-scheduling. It swaps times or shifts them.
        // A more complex implementation could recalculate all times.
        const newStartTime = destination.index > 0 ? newList[destination.index - 1].startTime : new Date().toISOString();
        // For simplicity, we're just updating this one task's order.
        // A full re-sort/re-schedule logic would be needed for true time-shifting.
        // For now, we dispatch updates for the affected tasks based on their new positions.
        const updatedTasks = newList.map((t, index) => {
          // This is a placeholder for a more complex time update logic
          // For now, just re-dispatch to reflect order change.
          return t;
        })
        
        // A simple re-ordering for now.
        const reorderedTasks = Array.from(tasks);
        const taskIndex = reorderedTasks.findIndex(t => t.id === draggableId);
        const [movedTask] = reorderedTasks.splice(taskIndex, 1);
        
        // Find the anchor task in the full task list
        const anchorId = newList[destination.index + (destination.index > source.index ? 0 : 1)]?.id;
        if (!anchorId) {
            // Moved to end
             const lastTimedTask = tasksWithTime[tasksWithTime.length - 1];
             const lastTaskIndex = reorderedTasks.findIndex(t => t.id === lastTimedTask.id);
             reorderedTasks.splice(lastTaskIndex, 0, movedTask);
        } else {
             const anchorIndex = reorderedTasks.findIndex(t => t.id === anchorId);
             reorderedTasks.splice(anchorIndex, 0, movedTask);
        }

        // The reordering logic needs to be more robust. 
        // For this iteration, we focus on the visual drag-drop.
        // The actual time property is not updated, only the visual order.
        // Let's create a new sorted list and dispatch updates.
        const newOrder = [...tasks];
        const [draggedItem] = newOrder.splice(newOrder.findIndex(t => t.id === draggableId), 1);
        
        let targetIndex = -1;
        if (destination.index < newList.length) {
          targetIndex = newOrder.findIndex(t => t.id === newList[destination.index].id);
        }
        if (targetIndex === -1) {
          const lastItem = newList[newList.length-1];
          targetIndex = newOrder.findIndex(t => t.id === lastItem.id)
        }

        newOrder.splice(targetIndex, 0, draggedItem);
        
        // This is not a perfect reorder, but it's a start.
        // We'll dispatch an update for just the moved task for now.
        // A better approach would be a dedicated "REORDER_MY_DAY" action.
        const originalTask = tasks.find(t => t.id === draggableId)!;
        const targetTask = newList[destination.index];
        const updatedTask: Task = {...originalTask, startTime: targetTask.startTime}; // Just as an example.
        // dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    }
  };

  
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-8">
        <div>
          {tasksWithTime.length > 0 && (
            <div className="space-y-2">
              <TaskList tasks={tasksWithTime} variant="my-day" droppableId="timed-tasks" />
            </div>
          )}

          {(allDayTasks.length > 0 || completedTasks.length > 0) && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  All-day / Unscheduled
              </h3>
              <div className="space-y-2">
                  <TaskList tasks={allDayTasks} variant="my-day" droppableId="allday-tasks" isDropDisabled />
              </div>
            </div>
          )}

          {myDayTasks.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">Your day is clear.</p>
                  <p className="text-muted-foreground text-sm">Add tasks from your lists to get started.</p>
              </div>
          )}

          {completedTasks.length > 0 && (
            <div className="pt-4 mt-8">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 px-4">Completed</h3>
                <div className="space-y-2">
                    <TaskList tasks={completedTasks} variant="my-day" droppableId="completed-tasks" isDropDisabled/>
                </div>
            </div>
        )}
        </div>
      </div>
    </DragDropContext>
  );
}

