"use client";

import '@mysten/dapp-kit/dist/index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { useAuthPersistence } from '@/app/hooks/useAuthPersistence';

const queryClient = new QueryClient()

const networks = {
  devnet: { url: getFullnodeUrl('devnet') },
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
};

/**
 * SessionRestorer component that runs the auth persistence hook
 * This is separated to ensure it runs in a client component context
 */
function SessionRestorer({ children }: { children: React.ReactNode }) {
  useAuthPersistence();
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const network = (process.env.NEXT_PUBLIC_SUI_NETWORK as 'devnet' | 'testnet' | 'mainnet') || 'devnet';

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork={network}>
        <WalletProvider>
          <SessionRestorer>
            {children}
          </SessionRestorer>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}
