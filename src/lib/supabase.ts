import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xgprwlwqexlymjpxjsuf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhncHJ3bHdxZXhseW1qcHhqc3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MzgxNDEsImV4cCI6MjA3NDAxNDE0MX0.iqQ8BKTao9IMrX00LWOWUaGKhS5C3AeW17XO8K6K3eY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// 数据库类型定义
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string | null;
          name: string | null;
          avatarUrl: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          name?: string | null;
          avatarUrl?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string | null;
          avatarUrl?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          userId: string;
          title: string;
          description: string | null;
          completed: boolean;
          isImportant: boolean;
          isMyDay: boolean;
          fixedTime: boolean;
          startTime: string | null;
          duration: number | null;
          dueDate: string | null;
          listId: string;
          tags: string[];
          subtasks: any; // JSONB
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          userId: string;
          title: string;
          description?: string | null;
          completed?: boolean;
          isImportant?: boolean;
          isMyDay?: boolean;
          fixedTime?: boolean;
          startTime?: string | null;
          duration?: number | null;
          dueDate?: string | null;
          listId?: string;
          tags?: string[];
          subtasks?: any; // JSONB
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          title?: string;
          description?: string | null;
          completed?: boolean;
          isImportant?: boolean;
          isMyDay?: boolean;
          fixedTime?: boolean;
          startTime?: string | null;
          duration?: number | null;
          dueDate?: string | null;
          listId?: string;
          tags?: string[];
          subtasks?: any; // JSONB
          createdAt?: string;
          updatedAt?: string;
        };
      };
      lists: {
        Row: {
          id: string;
          userId: string;
          title: string;
          color: string;
          icon: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          userId: string;
          title: string;
          color?: string;
          icon?: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          title?: string;
          color?: string;
          icon?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      events: {
        Row: {
          id: string;
          userId: string;
          title: string;
          description: string | null;
          startTime: string;
          endTime: string;
          location: string | null;
          listId: string;
          completed: boolean;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          userId: string;
          title: string;
          description?: string | null;
          startTime: string;
          endTime: string;
          location?: string | null;
          listId?: string;
          completed?: boolean;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          title?: string;
          description?: string | null;
          startTime?: string;
          endTime?: string;
          location?: string | null;
          listId?: string;
          completed?: boolean;
          createdAt?: string;
          updatedAt?: string;
        };
      };
    };
  };
}