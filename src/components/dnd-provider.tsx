
'use client';

import { useEffect, useState } from "react";

export function DndProvider({ children }: { children: React.ReactNode }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient ? <>{children}</> : null;
}
