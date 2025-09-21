'use client';

import React, { useState, useEffect } from 'react';
import { AlignJustify, Grid2X2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewModeToggleProps {
  viewMode?: 'compact' | 'detailed';
  onSwitchViewMode?: (mode: 'compact' | 'detailed') => void;
}

export function ViewModeToggle({ viewMode = 'detailed', onSwitchViewMode }: ViewModeToggleProps) {
  const [activeMode, setActiveMode] = useState<'compact' | 'detailed'>(viewMode);

  useEffect(() => {
    setActiveMode(viewMode);
  }, [viewMode]);

  const handleToggle = (mode: 'compact' | 'detailed') => {
    setActiveMode(mode);
    if (onSwitchViewMode) {
      onSwitchViewMode(mode);
    }
  };

  return (
    <div className="flex items-center bg-gray-100/50 rounded-lg p-1 relative border-0">
      {/* 滑动背景 */}
      <div 
        className={cn(
          "absolute top-1 h-7 w-7 bg-white/80 rounded-md shadow-sm transition-transform duration-200 ease-out border-0",
          activeMode === 'compact' ? "translate-x-8" : "translate-x-0"
        )}
      />
      
      <button
        type="button"
        className={cn(
          "w-7 h-7 flex items-center justify-center rounded-md transition-all duration-200 relative z-10 border-0",
          activeMode === 'detailed' 
            ? "text-gray-700" 
            : "text-gray-400 hover:text-gray-600"
        )}
        onClick={() => handleToggle('detailed')}
        aria-label="Detailed view"
      >
        <AlignJustify className="h-3.5 w-3.5" />
      </button>
      
      <button
        type="button"
        className={cn(
          "w-7 h-7 flex items-center justify-center rounded-md transition-all duration-200 relative z-10 border-0",
          activeMode === 'compact' 
            ? "text-gray-700" 
            : "text-gray-400 hover:text-gray-600"
        )}
        onClick={() => handleToggle('compact')}
        aria-label="Compact view"
      >
        <Grid2X2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}