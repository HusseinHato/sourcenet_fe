'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useZKLogin } from '@/app/hooks/useZKLogin';
import { Loading } from '@/app/components/common/Loading';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error } = useZKLogin();
  const [message, setMessage] = useState('Processing login...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract JWT from URL params
        // ZKLogin SDK will put the JWT in the URL after Google OAuth redirect
        const jwtToken = searchParams.get('jwt');
        const state = searchParams.get('state');
        const code = searchParams.get('code'); // Google OAuth code

        if (!jwtToken && !code) {
          setMessage('No authentication token found. Redirecting to login...');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        setMessage('Verifying with backend...');

        // If we have a Google OAuth code, we need to exchange it for JWT first
        // This is typically done by the backend or ZKLogin SDK
        // For now, we'll assume we have the JWT directly

        const tokenToUse = jwtToken || code;

        if (!tokenToUse) {
          throw new Error('No valid token received');
        }

        // Send JWT to backend for verification
        // The backend will verify the JWT and return user data + token
        const success = await login(tokenToUse);

        if (success) {
          setMessage('Login successful! Redirecting...');
          setTimeout(() => router.push('/marketplace'), 1000);
        } else {
          setMessage('Login failed. Redirecting to login page...');
          setTimeout(() => router.push('/login'), 2000);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setMessage(`Error: ${errorMessage}`);
        console.error('Callback error:', err);
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, login, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Loading size="lg" />
        <p className="mt-4 text-gray-600">{message}</p>
        {error && <p className="mt-2 text-red-600">{error}</p>}
      </div>
    </main>
  );
}
