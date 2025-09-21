'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { TasksProvider } from '@/hooks/use-tasks';

/**
 * 客户端专用的TasksProvider包装器
 * 这个组件确保TasksProvider只在客户端渲染，避免在服务器端预渲染时访问localStorage
 */
export const ClientTasksProvider = ({ children }: { children: ReactNode }) => {
  // 标记是否在客户端环境中
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // 这个effect只在客户端运行
    setIsClient(true);
  }, []);

  // 在服务器端渲染时返回null，只在客户端渲染TasksProvider
  if (!isClient) {
    return null;
  }

  return <TasksProvider>{children}</TasksProvider>;
};