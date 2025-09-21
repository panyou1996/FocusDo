'use client';

import React from 'react';
import { List, Grid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ViewModeToggleProps {
  viewMode?: 'compact' | 'detailed';
  onSwitchViewMode?: (mode: 'compact' | 'detailed') => void;
}

export function ViewModeToggleSimple({ 
  viewMode = 'detailed', 
  onSwitchViewMode 
}: ViewModeToggleProps) {
  const handleToggle = (mode: 'compact' | 'detailed') => {
    if (onSwitchViewMode) {
      onSwitchViewMode(mode);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={viewMode === 'detailed' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleToggle('detailed')}
        aria-label="详细视图"
        className="px-2 h-8"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'compact' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleToggle('compact')}
        aria-label="紧凑视图"
        className="px-2 h-8"
      >
        <Grid className="h-4 w-4" />
      </Button>
    </div>
  );
}