'use client';

import React, { ReactNode } from 'react';
import { TasksProvider } from '@/hooks/use-tasks';

/**
 * 客户端专用的TasksProvider包装器
 * 这个组件确保TasksProvider只在客户端渲染，避免在服务器端预渲染时访问localStorage
 */
export const ClientTasksProvider = ({ children }: { children: ReactNode }) => {
  return <TasksProvider>{children}</TasksProvider>;
};