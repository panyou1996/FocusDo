
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, ChevronRight, Sparkles, Calendar, Search, Home, Trash, Star, Clock, Filter, Settings, CheckCircle, AlertCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ViewModeToggleSimple } from './view-mode-toggle-simple';

interface AppHeaderProps {
  viewMode?: 'compact' | 'detailed';
  onSwitchViewMode?: (mode: 'compact' | 'detailed') => void;
  onAddTask?: () => void;
  onAddList?: () => void;
}

export function AppHeader({ 
  viewMode = 'detailed',
  onSwitchViewMode,
  onAddTask,
  onAddList 
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <div className="flex items-center gap-3">
        {/* Sidebar trigger for mobile */}
        <SidebarTrigger className="md:hidden" />
        
        {/* Title section */}
        <div className="flex flex-col truncate">
          <h1 className="text-xl font-bold leading-none tracking-tight">
            我的一天
          </h1>
          <p className="text-sm text-muted-foreground">
            09月20日 星期六
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <ViewModeToggleSimple 
          viewMode={viewMode}
          onSwitchViewMode={onSwitchViewMode}
        />
      </div>
    </header>
  );
}
