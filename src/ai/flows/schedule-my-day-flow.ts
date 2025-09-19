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
  dueDate: z.string().optional().describe("The task's deadline. This is a hard constraint."),
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
  startTime: z.string().describe("The suggested new start time for the task in ISO 8601 format."),
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

You will be given a list of tasks, their estimated durations, their importance, and their deadlines (dueDate).

Your goal is to assign a specific start time (startTime) to each and every task for the current date: {{{currentDate}}}.

Follow these rules strictly:
1.  You MUST schedule ALL tasks provided. Do not leave any task unscheduled.
2.  Schedule tasks ONLY within the user's available time slots as defined in their schedule.
3.  Prioritize 'isImportant: true' tasks. Try to schedule them earlier in the day if possible.
4.  Respect the 'dueDate' as a hard deadline. The task MUST be scheduled to finish before its dueDate.
5.  Respect the duration of each task. Ensure there is enough time in the schedule for it.
6.  The end time of a task (startTime + duration) CANNOT extend into a break, non-work period, or past the task's dueDate. This is a hard constraint.
7.  After each task, schedule a 15-minute break before the next task begins. This break must also be within available time.
8.  If a task has no duration, you MUST treat it as a 15-minute task for scheduling purposes.
9.  The output for 'startTime' for each task MUST be a complete ISO 8601 string, including the date and the new time you have assigned. For example: '2024-08-15T09:30:00.000Z'.
10. Do not schedule tasks during specified break times (e.g., lunch, dinner) or outside the user's specified free/working hours.

User's Schedule:
{{{userSchedule}}}

Today's Date: {{{currentDate}}}

Tasks to schedule:
{{#each tasks}}
- Task ID: {{id}}, Title: "{{title}}", Duration: {{duration}} mins, Important: {{isImportant}}, Due Date: {{dueDate}}
{{/each}}

Please provide the optimized schedule. All tasks must be assigned a start time.`,
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
