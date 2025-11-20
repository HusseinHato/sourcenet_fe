'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useZKLogin } from '@/app/hooks/useZKLogin';
import { Loading } from '@/app/components/common/Loading';
import { jwtToAddress } from '@mysten/sui/zklogin';
import { getUserSalt } from '@/app/utils/zklogin.utils';

export default function CallbackPage() {
  const router = useRouter();
  const { login, isLoading, error } = useZKLogin();
  const [message, setMessage] = useState('Processing login...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract JWT from URL fragment (Google returns it as id_token in fragment)
        const fragment = window.location.hash.substring(1);
        const params = new URLSearchParams(fragment);
        const jwt = params.get('id_token');

        if (!jwt) {
          setMessage('No JWT found. Redirecting to login...');
          console.error('No JWT in callback URL');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        setMessage('Deriving Sui address...');

        // Get user salt (persistent across sessions)
        const userSalt = getUserSalt();

        // Derive the Sui address from JWT and user salt
        // This returns a hex format address (0x...)
        const address = jwtToAddress(jwt, userSalt);

        if (!address) {
          setMessage('Failed to derive address. Redirecting to login...');
          console.error('Failed to derive address from JWT');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        setMessage('Verifying with backend...');

        // Send JWT and address to backend for verification
        // Backend will verify JWT and return user data + token
        const success = await login(jwt, address);

        if (success) {
          setMessage('Login successful! Redirecting...');
          // Clear session storage
          sessionStorage.removeItem('zklogin_ephemeral_keypair');
          sessionStorage.removeItem('zklogin_randomness');
          sessionStorage.removeItem('zklogin_max_epoch');
          setTimeout(() => router.push('/'), 1000);
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
  }, [login, router]);

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
