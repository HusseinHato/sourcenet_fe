'use client';

import { useState } from 'react';
import { useZKLogin } from '@/app/hooks/useZKLogin';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/common/Button';
import { Loading } from '@/app/components/common/Loading';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useZKLogin();
  const [email, setEmail] = useState('');

  const handleGoogleLogin = async () => {
    // TODO: Integrate with actual Google OAuth and ZKLogin SDK
    // This is a placeholder for the ZKLogin flow
    const success = await login('placeholder-jwt-token');
    if (success) {
      router.push('/marketplace');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">D</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">DataMarket</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGoogleLogin();
          }}
          className="space-y-4"
        >
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>

          {/* ZKLogin Button */}
          <Button type="submit" size="lg" isLoading={isLoading} className="w-full gap-2">
            <LogIn size={20} />
            Sign in with ZKLogin
          </Button>
        </form>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-2">What is ZKLogin?</h3>
          <p className="text-sm text-gray-600">
            ZKLogin is a privacy-preserving authentication method that uses zero-knowledge proofs. Sign in with your Google account without revealing your identity to the blockchain.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          By signing in, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Terms of Service
          </a>
        </p>
      </div>
    </main>
  );
}
