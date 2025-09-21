'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { Task, List, Tag, CalendarEvent } from '@/lib/types';
import { initialTasks, initialLists, initialTags, initialEvents } from '@/lib/data';

type AppState = {
  tasks: Task[];
  lists: List[];
  tags: Tag[];
  events: CalendarEvent[];
};

type Action =
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
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.id ? action.payload : event
        ),
      };
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload),
      };
    case 'ADD_TAG':
        // Avoid adding duplicate tags
        if (state.tags.some(tag => tag.id === action.payload.id)) {
            return state;
        }
        return { ...state, tags: [...state.tags, action.payload] };
    case 'ADD_LIST':
        if (state.lists.some(list => list.id === action.payload.id)) {
            return state;
        }
        return { ...state, lists: [...state.lists, action.payload] };
    case 'UPDATE_LIST':
        return {
            ...state,
            lists: state.lists.map(list => list.id === action.payload.id ? action.payload : list)
        };
    case 'DELETE_LIST':
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

const getInitialState = (): AppState => {
  const initialState = { tasks: initialTasks, lists: initialLists, tags: initialTags, events: initialEvents };
  try {
    const item = window.localStorage.getItem('aqua-do-state');
    if (item) {
      const savedState = JSON.parse(item);
      // Ensure events are also loaded, or fall back to initialEvents
      return { ...initialState, ...savedState, events: savedState.events || initialEvents };
    }
    return initialState;
  } catch (error) {
    console.error('Error reading from localStorage', error);
    return initialState;
  }
};

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, getInitialState());

  useEffect(() => {
    try {
      window.localStorage.setItem('aqua-do-state', JSON.stringify(state));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [state]);

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
