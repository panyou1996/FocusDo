'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { Task, List, Tag } from '@/lib/types';
import { initialTasks, initialLists, initialTags } from '@/lib/data';

type AppState = {
  tasks: Task[];
  lists: List[];
  tags: Tag[];
};

type Action =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
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
  if (typeof window === 'undefined') {
    return { tasks: initialTasks, lists: initialLists, tags: initialTags };
  }
  try {
    const item = window.localStorage.getItem('aqua-do-state');
    return item ? JSON.parse(item) : { tasks: initialTasks, lists: initialLists, tags: initialTags };
  } catch (error) {
    console.error('Error reading from localStorage', error);
    return { tasks: initialTasks, lists: initialLists, tags: initialTags };
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
