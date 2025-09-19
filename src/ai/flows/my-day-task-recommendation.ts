'use server';
/**
 * @fileOverview Recommends tasks for the 'My Day' view based on user habits and priorities.
 *
 * - recommendMyDayTasks - A function that recommends tasks for the 'My Day' view.
 * - RecommendMyDayTasksInput - The input type for the recommendMyDayTasks function.
 * - RecommendMyDayTasksOutput - The return type for the recommendMyDayTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendMyDayTasksInputSchema = z.object({
  userHabits: z
    .string()
    .describe('A description of the user habits and daily routine.'),
  taskPriorities: z
    .string()
    .describe('A description of the user task priorities.'),
  availableTasks: z
    .string()
    .describe('A list of tasks that are available to be scheduled.'),
});
export type RecommendMyDayTasksInput = z.infer<
  typeof RecommendMyDayTasksInputSchema
>;

const RecommendMyDayTasksOutputSchema = z.object({
  recommendedTasks: z
    .string()
    .describe('A list of tasks recommended for the My Day view.'),
});
export type RecommendMyDayTasksOutput = z.infer<
  typeof RecommendMyDayTasksOutputSchema
>;

export async function recommendMyDayTasks(
  input: RecommendMyDayTasksInput
): Promise<RecommendMyDayTasksOutput> {
  return recommendMyDayTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendMyDayTasksPrompt',
  input: {schema: RecommendMyDayTasksInputSchema},
  output: {schema: RecommendMyDayTasksOutputSchema},
  prompt: `You are a personal assistant helping the user to plan their day.

Based on the user's habits, priorities and available tasks, you will recommend a list of tasks for the user to schedule in their "My Day" view.

User Habits: {{{userHabits}}}
Task Priorities: {{{taskPriorities}}}
Available Tasks: {{{availableTasks}}}

Recommended Tasks:`,
});

const recommendMyDayTasksFlow = ai.defineFlow(
  {
    name: 'recommendMyDayTasksFlow',
    inputSchema: RecommendMyDayTasksInputSchema,
    outputSchema: RecommendMyDayTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
