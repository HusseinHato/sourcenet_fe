'use client';

import Link from 'next/link';
import { useUserStore } from '@/app/store/userStore';
import { Button } from '@/app/components/common/Button';
import { Zap, Lock, TrendingUp } from 'lucide-react';

export default function Home() {
  const { user } = useUserStore();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Buy & Sell Data with <span className="text-blue-600">Confidence</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A decentralized data marketplace powered by Sui blockchain. Secure, transparent, and encrypted data transactions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/marketplace">
              <Button size="lg">Browse Marketplace</Button>
            </Link>
            {!user && (
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why DataMarket?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lock className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">End-to-End Encrypted</h3>
              <p className="text-gray-600">
                Your data is encrypted with X25519 and AES-256-GCM. Only you can decrypt it.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Transactions</h3>
              <p className="text-gray-600">
                Powered by Sui blockchain for fast, low-cost transactions with instant settlement.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Earn & Monetize</h3>
              <p className="text-gray-600">
                Sellers can list datasets and earn passive income. Buyers get quality data at fair prices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center justify-center flex flex-col gap-4 items-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start?</h2>
          <p className="text-blue-100 mb-8">Join thousands of data sellers and buyers on DataMarket</p>
          {user ? (
            <div className='justify-center flex gap-4'>
              <Link href="/marketplace">
                <Button size="lg" variant="secondary">
                  Explore Marketplace
                </Button>
              </Link>
              <Link href="/seller">
                <Button size="lg" variant="secondary">
                  Seller Dashboard
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/login">
              <Button size="lg" variant="secondary">
                Login with ZKLogin
              </Button>
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
