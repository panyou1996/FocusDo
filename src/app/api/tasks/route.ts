import { initialTasks } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET() {
  const inboxTasks = initialTasks.filter(task => task.listId === 'inbox');
  
  return NextResponse.json({
    allTasks: initialTasks,
    inboxTasks: inboxTasks,
    inboxTaskCount: inboxTasks.length
  });
}