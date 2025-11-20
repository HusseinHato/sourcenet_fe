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
        console.log('User salt:', userSalt, 'Type:', typeof userSalt, 'Length:', userSalt.length);

        // Derive the Sui address from JWT and user salt
        // This returns a hex format address (0x...)
        let address: string;
        try {
          address = jwtToAddress(jwt, userSalt);
          console.log('Derived address:', address);
        } catch (error) {
          console.error('Error deriving address:', error);
          throw error;
        }

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
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[#f5f5f5] via-white to-[#e6e6e6]">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-120px] left-[8%] h-[520px] w-[520px] rounded-full bg-[#919191]/15 blur-3xl" />
        <div className="absolute bottom-[-180px] right-[12%] h-[480px] w-[480px] rounded-full bg-[#474747]/10 blur-3xl" />
        <div className="absolute inset-x-0 top-1/2 mx-auto h-64 w-3/4 -translate-y-1/2 rounded-full bg-[#CECECE]/8 blur-3xl" />
      </div>
      <div className="w-full max-w-md relative overflow-hidden rounded-3xl border border-[#919191]/30 bg-[#CECECE]/60 p-8 backdrop-blur-3xl shadow-[0_45px_90px_-40px_rgba(20,20,20,0.15)]">
        {/* Glassmorphism Layers */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#919191]/15 via-transparent to-[#474747]/10" />
        <div className="absolute inset-0 rounded-3xl border border-[#919191]/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]" />
        {/* Gradient Line Top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#919191]/40 to-transparent" />
        <div className="relative z-20 text-center">
          <Loading size="lg" />
          <p className="mt-6 text-[#474747] font-medium">{message}</p>
          {error && <p className="mt-3 text-red-600 font-medium">{error}</p>}
        </div>
      </div>
    </main>
  );
}
