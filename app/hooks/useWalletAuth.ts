'use client';

import { useCallback } from 'react';
import { useCurrentAccount, useSignPersonalMessage } from '@mysten/dapp-kit';
import { useUserStore } from '@/app/(main)/store/userStore';
import { setAuthToken } from '@/app/utils/api.client';
import { User } from '@/app/types';

/**
 * Hook for wallet-based authentication
 * Allows users to sign in with their Sui wallet (Sui Wallet, Suiet, etc.)
 */
export function useWalletAuth() {
  const { setUser, setLoading, setError } = useUserStore();
  const account = useCurrentAccount();
  const { mutate: signPersonalMessage } = useSignPersonalMessage();

  /**
   * Sign in with wallet by signing a message
   * This proves ownership of the wallet address
   */
  const signInWithWallet = useCallback(async () => {
    if (!account) {
      setError('No wallet connected');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // Create a message to sign (timestamp-based for uniqueness)
      const message = new TextEncoder().encode(
        `Sign in to DataMarket\nAddress: ${account.address}\nTimestamp: ${Date.now()}`
      );

      // Sign the message with the wallet
      return new Promise<boolean>((resolve) => {
        signPersonalMessage(
          { message },
          {
            onSuccess: async (signature) => {
              try {
                // Send signature and address to backend for verification
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

                const response = await fetch(`${apiUrl}/auth/wallet/callback`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    address: account.address,
                    signature: signature.signature,
                    publicKey: account.publicKey ?? null,
                  }),
                });

                if (!response.ok) {
                  const errorData = await response.json().catch(() => ({}));
                  throw new Error(
                    errorData.error?.message || `Wallet auth failed with status ${response.status}`
                  );
                }

                const data = await response.json();

                if (!data.data || !data.data.token) {
                  throw new Error('Invalid response: missing token');
                }

                // Create user object from response
                const user: User = {
                  address: data.data.user.address,
                  email: data.data.user.email || null,
                  username: data.data.user.username,
                  role: data.data.user.role || 'buyer',
                  balance: data.data.user.balance || 0,
                  createdAt: data.data.user.createdAt || new Date().toISOString(),
                };

                // Set auth token and user
                setAuthToken(data.data.token);
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('walletAddress', account.address);
                setUser(user);

                console.log('Wallet auth successful', { address: user.address });
                resolve(true);
              } catch (err) {
                const message = err instanceof Error ? err.message : 'Wallet auth failed';
                setError(message);
                console.error('Wallet auth error:', err);
                resolve(false);
              } finally {
                setLoading(false);
              }
            },
            onError: (error) => {
              const message = error instanceof Error ? error.message : 'Failed to sign message';
              setError(message);
              console.error('Sign message error:', error);
              setLoading(false);
              resolve(false);
            },
          }
        );
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Wallet auth failed';
      setError(message);
      console.error('Wallet auth error:', err);
      setLoading(false);
      return false;
    }
  }, [account, signPersonalMessage, setUser, setLoading, setError]);

  /**
   * Logout from wallet
   */
  const logoutWallet = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('walletAddress');
    setUser(null);
    setError(null);
    console.log('Wallet logout successful');
  }, [setUser, setError]);

  return {
    account,
    signInWithWallet,
    logoutWallet,
    isConnected: !!account,
  };
}
