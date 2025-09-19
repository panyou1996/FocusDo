'use server';
/**
 * @fileOverview Schedules tasks for the 'My Day' view based on user's routine, task priorities, and duration.
 *
 * - scheduleMyDayTasks - A function that orchestrates the task scheduling.
 * - ScheduleMyDayTasksInput - The input type for the scheduleMyDayTasks function.
 * - ScheduleMyDayTasksOutput - The return type for the scheduleMyDayTasks function.
 */

import { ai } from '@/ai/genkit';
import type { Task } from '@/lib/types';
import { z } from 'genkit';

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  duration: z.number().optional(),
  isImportant: z.boolean().optional(),
  dueDate: z.string().optional(), // Keep existing due date for context
});

const ScheduleMyDayTasksInputSchema = z.object({
  userSchedule: z.string().describe('The user\'s daily routine, including work hours and breaks.'),
  tasks: z.array(TaskSchema).describe('The list of tasks to be scheduled for My Day.'),
  currentDate: z.string().describe('The current date in ISO format.'),
});
export type ScheduleMyDayTasksInput = z.infer<typeof ScheduleMyDayTasksInputSchema>;

const ScheduledTaskSchema = z.object({
  id: z.string(),
  // The AI should return a full ISO string with date and the new time.
  scheduledTime: z.string().describe("The suggested new date and time for the task in ISO 8601 format."),
});

const ScheduleMyDayTasksOutputSchema = z.object({
  scheduledTasks: z.array(ScheduledTaskSchema),
});
export type ScheduleMyDayTasksOutput = z.infer<typeof ScheduleMyDayTasksOutputSchema>;

export async function scheduleMyDayTasks(input: ScheduleMyDayTasksInput): Promise<ScheduleMyDayTasksOutput> {
  return scheduleMyDayTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scheduleMyDayPrompt',
  input: { schema: ScheduleMyDayTasksInputSchema },
  output: { schema: ScheduleMyDayTasksOutputSchema },
  prompt: `You are an expert personal assistant responsible for intelligently scheduling a user's day.

You will be given a list of tasks, their estimated durations, and their importance. You will also receive the user's daily routine.

Your goal is to assign a specific start time to each task for the current date: {{{currentDate}}}.

Follow these rules strictly:
1.  Schedule tasks within the user's available time slots as defined in their schedule.
2.  Prioritize 'isImportant: true' tasks. Try to schedule them earlier in the day if possible.
3.  Respect the duration of each task. Ensure there is enough time in the schedule for it.
4.  If a task has no duration, treat it as a 15-minute task.
5.  The output for 'scheduledTime' for each task MUST be a complete ISO 8601 string, including the date and the new time you have assigned. For example: '2024-08-15T09:30:00.000Z'.
6.  Do not schedule tasks during break times or outside the specified working hours.

User's Schedule:
{{{userSchedule}}}

Today's Date: {{{currentDate}}}

Tasks to schedule:
{{#each tasks}}
- Task ID: {{id}}, Title: "{{title}}", Duration: {{duration}} mins, Important: {{isImportant}}
{{/each}}

Please provide the optimized schedule.`,
});

const scheduleMyDayTasksFlow = ai.defineFlow(
  {
    name: 'scheduleMyDayTasksFlow',
    inputSchema: ScheduleMyDayTasksInputSchema,
    outputSchema: ScheduleMyDayTasksOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
