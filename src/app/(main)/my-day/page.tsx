'use client';

import { MyDayView } from "@/components/my-day-view";
import { useState } from "react";

export default function MyDayPage() {
    const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
    
    return <MyDayView viewMode={viewMode} onSwitchViewMode={setViewMode} />;
}
