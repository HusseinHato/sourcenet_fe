"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthPersistence } from '@/app/hooks/useAuthPersistence';

const queryClient = new QueryClient()

/**
 * SessionRestorer component that runs the auth persistence hook
 * This is separated to ensure it runs in a client component context
 */
function SessionRestorer({ children }: { children: React.ReactNode }) {
  useAuthPersistence();
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionRestorer>
        {children}
      </SessionRestorer>
    </QueryClientProvider>
  )
}
