'use client';

import { useState, useCallback } from 'react';
import { useUserStore } from '@/app/store/userStore';
import { setAuthToken } from '@/app/utils/api.client';
import { User } from '@/app/types';

export function useZKLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, logout: storeLogout } = useUserStore();

  /**
   * Login with ZKLogin - sends JWT and address to backend
   * @param jwt - JWT token from Google OAuth
   * @param address - Sui address derived from JWT (hex format 0x...)
   */
  const login = useCallback(async (jwt: string, address: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      if (!jwt || jwt.trim().length === 0) {
        throw new Error('JWT is required');
      }
      if (!address || address.trim().length === 0) {
        throw new Error('Address is required');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      console.log('ZKLogin: Sending callback to backend', { apiUrl, address });

      // Build request payload with JWT and address
      const payload = { jwt, address };

      const response = await fetch(`${apiUrl}/auth/zklogin/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('ZKLogin: Backend response', { status: response.status, ok: response.ok });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `ZKLogin failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      console.log('ZKLogin: Response data', { hasData: !!data.data, hasToken: !!data.data?.token });

      // Validate response data
      if (!data.data || !data.data.token) {
        throw new Error('Invalid response: missing token');
      }

      const user: User = {
        address: data.data.user.address,
        email: data.data.user.email || null,
        username: data.data.user.username,
        role: 'buyer',
        balance: 0,
        createdAt: new Date().toISOString(),
      };

      console.log('ZKLogin: User authenticated', { address: user.address, username: user.username });

      // Set auth token in both localStorage and API client
      setAuthToken(data.data.token);
      
      // Persist user data for session restoration
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      console.error('ZKLogin error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  const logout = useCallback(() => {
    storeLogout();
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // NOTE: Do NOT clear zklogin_user_salt - it must persist across sessions
    // to ensure the same Sui address is derived for the same Google account
    setError(null);
    console.log('User logged out, session cleared');
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
