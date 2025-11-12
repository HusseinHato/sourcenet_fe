'use client';

import '@mysten/dapp-kit/dist/index.css';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

const networks = {
  devnet: { url: getFullnodeUrl('devnet') },
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
};

interface WalletProviderProps {
  children: ReactNode;
  network?: 'devnet' | 'testnet' | 'mainnet';
}

/**
 * Sui Wallet Provider Component
 * Wraps the app with necessary providers for wallet connection
 * Supports Sui Wallet, Suiet, and other standard wallets
 */
export function SuiWalletProvider({ children, network = 'devnet' }: WalletProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork={network}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
