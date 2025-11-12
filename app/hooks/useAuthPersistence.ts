'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/app/store/userStore';
import { setAuthToken, getAuthToken } from '@/app/utils/api.client';
import { User } from '@/app/types';

/**
 * Hook to restore user session from localStorage on app load
 * This allows users to stay logged in across page refreshes and browser restarts
 */
export function useAuthPersistence() {
  const { setUser, setLoading, setError } = useUserStore();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        setLoading(true);

        // Check if auth token exists in localStorage
        const token = getAuthToken();
        if (!token) {
          setLoading(false);
          return;
        }

        // Try to restore user from localStorage
        const storedUserJson = localStorage.getItem('user');
        if (storedUserJson) {
          try {
            const storedUser: User = JSON.parse(storedUserJson);
            setUser(storedUser);
            setAuthToken(token);
            console.log('Session restored from localStorage', { address: storedUser.address });
            setLoading(false);
            return;
          } catch (parseError) {
            console.warn('Failed to parse stored user data', parseError);
            localStorage.removeItem('user');
          }
        }

        // If no stored user, try to fetch from backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${apiUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData: User = await response.json();
          setUser(userData);
          // Store user in localStorage for faster restoration next time
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('Session restored from backend', { address: userData.address });
        } else if (response.status === 401) {
          // Token is invalid, clear it
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setUser(null);
          console.warn('Auth token expired or invalid');
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        setError(error instanceof Error ? error.message : 'Failed to restore session');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [setUser, setLoading, setError]);
}
