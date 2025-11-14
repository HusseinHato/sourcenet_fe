'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, ConnectButton } from '@mysten/dapp-kit';
import { Button } from '@/app/components/common/Button';
import { useWalletAuth } from '@/app/hooks/useWalletAuth';
import { Wallet, LogIn } from 'lucide-react';

export default function WalletLoginPage() {
  const router = useRouter();
  const account = useCurrentAccount();
  const { signInWithWallet } = useWalletAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleWalletLogin = async () => {
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    const success = await signInWithWallet();
    setIsLoading(false);

    if (success) {
      router.push('/marketplace');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">D</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">DataMarket</h1>
          <p className="text-gray-600 mt-2">Sign in with your Sui Wallet</p>
        </div>

        {/* Wallet Connection */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <ConnectButton />
          </div>

          {account && (
            <>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Connected Wallet:</span>
                </p>
                <p className="text-sm text-gray-900 font-mono mt-1">
                  {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </p>
              </div>

              <Button
                size="lg"
                isLoading={isLoading}
                onClick={handleWalletLogin}
                className="w-full gap-2"
              >
                <LogIn size={20} />
                Sign In with Wallet
              </Button>
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Wallet size={18} />
            Supported Wallets
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Sui Wallet</li>
            <li>• Suiet</li>
            <li>• Ethos Wallet</li>
            <li>• Other Wallet Standard Wallets</li>
          </ul>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          By signing in, you agree to our{' '}
          <a href="#" className="text-gray-900 hover:underline">
            Terms of Service
          </a>
        </p>
      </div>
    </main>
  );
}
