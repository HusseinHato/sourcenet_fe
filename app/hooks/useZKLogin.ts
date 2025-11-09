'use client';

import { useState, useCallback } from 'react';
import { useUserStore } from '@/app/store/userStore';
import { User } from '@/app/types';

export function useZKLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, logout: storeLogout } = useUserStore();

  const login = useCallback(async (jwtToken: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement actual ZKLogin flow with backend
      // This is a placeholder that would integrate with Sui ZKLogin SDK
      const response = await fetch('/api/auth/zklogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt: jwtToken }),
      });

      if (!response.ok) {
        throw new Error('ZKLogin failed');
      }

      const data = await response.json();
      const user: User = {
        address: data.address,
        email: data.email,
        username: data.username,
        role: data.role || 'buyer',
        balance: data.balance || 0,
        createdAt: new Date().toISOString(),
      };

      setUser(user);
      localStorage.setItem('authToken', data.token);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  const logout = useCallback(() => {
    storeLogout();
    localStorage.removeItem('authToken');
    setError(null);
  }, [storeLogout]);

  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const user: User = await response.json();
      setUser(user);
      return user;
    } catch (err) {
      return null;
    }
  }, [setUser]);

  return {
    isLoading,
    error,
    login,
    logout,
    getCurrentUser,
  };
}
