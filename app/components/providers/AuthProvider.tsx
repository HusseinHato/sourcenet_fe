'use client';

import { useAuthPersistence } from '@/app/hooks/useAuthPersistence';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    useAuthPersistence();
    return <>{children}</>;
}
