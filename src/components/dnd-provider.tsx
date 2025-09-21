
'use client';

import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useEffect, useState } from "react";

export function DndProvider({ children }: { children: React.ReactNode }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const onDragEnd = (event: DragEndEvent) => {
        // This is a placeholder function, actual drag end logic should be handled in components that use DndProvider
        console.log('Drag ended:', event);
    };

    // Create a context provider for dnd-kit
    if (isClient) {
        return (
            <DndContext onDragEnd={onDragEnd}>
                {children}
            </DndContext>
        );
    }
    
    // 在服务端渲染时，直接返回children以确保内容显示
    return <>{children}</>;
}
