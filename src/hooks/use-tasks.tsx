'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Task, List, Tag, CalendarEvent } from '@/lib/types';
import { supabase } from '@/lib/supabase';

export type AppState = {
  tasks: Task[];
  lists: List[];
  tags: Tag[];
  events: CalendarEvent[];
};

export type Action =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_EVENT'; payload: CalendarEvent }
  | { type: 'UPDATE_EVENT'; payload: CalendarEvent }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'ADD_TAG'; payload: Tag }
  | { type: 'ADD_LIST'; payload: List }
  | { type: 'UPDATE_LIST'; payload: List }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'SET_STATE'; payload: AppState };

const AppStateContext = createContext<AppState | undefined>(undefined);
const AppDispatchContext = createContext<React.Dispatch<Action> | undefined>(undefined);

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_TASK':
      const newTask = { ...action.payload, id: action.payload.id || window.crypto.randomUUID() };
      supabase.from('tasks').insert(newTask).then(({ error }) => {
        if (error) console.error('Error adding task to Supabase', error);
      });
      return { ...state, tasks: [...state.tasks, newTask] };
    case 'UPDATE_TASK':
      supabase.from('tasks').update(action.payload).eq('id', action.payload.id).then(({ error }) => {
        if (error) console.error('Error updating task in Supabase', error);
      });
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case 'DELETE_TASK':
      supabase.from('tasks').delete().eq('id', action.payload).then(({ error }) => {
        if (error) console.error('Error deleting task from Supabase', error);
      });
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    case 'ADD_EVENT':
      const newEvent = { ...action.payload, id: action.payload.id || window.crypto.randomUUID() };
      supabase.from('events').insert(newEvent).then(({ error }) => {
        if (error) console.error('Error adding event to Supabase', error);
      });
      return { ...state, events: [...state.events, newEvent] };
    case 'UPDATE_EVENT':
      supabase.from('events').update(action.payload).eq('id', action.payload.id).then(({ error }) => {
        if (error) console.error('Error updating event in Supabase', error);
      });
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.id ? action.payload : event
        ),
      };
    case 'DELETE_EVENT':
      supabase.from('events').delete().eq('id', action.payload).then(({ error }) => {
        if (error) console.error('Error deleting event from Supabase', error);
      });
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload),
      };
    case 'ADD_LIST':
        const newList = { ...action.payload, id: action.payload.id || window.crypto.randomUUID() };
        supabase.from('lists').insert(newList).then(({ error }) => {
            if (error) console.error('Error adding list to Supabase', error);
        });
        if (state.lists.some(list => list.id === newList.id)) {
            return state;
        }
        return { ...state, lists: [...state.lists, newList] };
    case 'UPDATE_LIST':
        supabase.from('lists').update(action.payload).eq('id', action.payload.id).then(({ error }) => {
            if (error) console.error('Error updating list in Supabase', error);
        });
        return {
            ...state,
            lists: state.lists.map(list => list.id === action.payload.id ? action.payload : list)
        };
    case 'DELETE_LIST':
        supabase.from('lists').delete().eq('id', action.payload).then(({ error }) => {
            if (error) console.error('Error deleting list from Supabase', error);
        });
        return {
            ...state,
            lists: state.lists.filter(list => list.id !== action.payload),
            tasks: state.tasks.filter(task => task.listId !== action.payload)
        };
    case 'SET_STATE':
        return action.payload;
    default:
      return state;
  }
};

const initialState: AppState = { tasks: [], lists: [], tags: [], events: [] };

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};

export const useTasks = () => {
  const state = useContext(AppStateContext);
  if (state === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return state;
};

export const useTasksDispatch = () => {
  const dispatch = useContext(AppDispatchContext);
  if (dispatch === undefined) {
    throw new Error('useTasksDispatch must be used within a TasksProvider');
  }
  return dispatch;
};

// 添加明确的客户端组件标记
export const TasksProviderClient = TasksProvider;
export const useTasksClient = useTasks;
export const useTasksDispatchClient = useTasksDispatch;
