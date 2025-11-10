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
        // Extract authorization code from URL params
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code) {
          setMessage('No authorization code found. Redirecting to login...');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        setMessage('Verifying with backend...');

        // Send authorization code to backend for verification
        // The backend will exchange it for JWT and return user data + token
        const success = await login(code);

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
