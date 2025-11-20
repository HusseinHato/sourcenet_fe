'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, ConnectButton } from '@mysten/dapp-kit';
import { Button } from '@/app/components/common/Button';
import { useWalletAuth } from '@/app/hooks/useWalletAuth';
import { Wallet, LogIn, Lock, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

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
      router.push('/');
    }
  };

  return (
    <>
      {/* Background Elements */}
      <motion.div
        className="w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
      >
        {/* Card */}
        <div className="relative overflow-hidden rounded-3xl border border-[#919191]/30 bg-[#CECECE]/60 p-8 backdrop-blur-3xl shadow-[0_45px_90px_-40px_rgba(20,20,20,0.15)]">
          {/* Glassmorphism Layers */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#919191]/15 via-transparent to-[#474747]/10" />
          <div className="absolute inset-0 rounded-3xl border border-[#919191]/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]" />

          {/* Gradient Line Top */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#919191]/40 to-transparent" />

          {/* Shimmer Effect */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: 'linear-gradient(120deg, transparent 35%, rgba(145,145,145,0.15) 50%, transparent 65%)',
            }}
            animate={{
              x: ['-120%', '220%'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatDelay: 2.5,
              ease: 'easeInOut',
            }}
          />

          {/* Content */}

          {/* Header */}
          <div className="relative z-20 text-center mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-20 h-20 relative mx-auto mb-4"
            >
              <Image
                src="/sourcenet.png"
                alt="SourceNet Logo"
                width={80}
                height={80}
                className="object-contain"
              />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-3xl font-bold text-[#353535]"
            >
              SourceNet
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[#474747] mt-2 text-sm"
            >
              Connect your Sui Wallet
            </motion.p>
          </div>

          {/* Wallet Connection */}
          <motion.div
            className="relative z-20 space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <div className="flex justify-center">
              <ConnectButton />
            </div>

            {account && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="p-4 bg-gradient-to-br from-[#919191]/10 to-[#474747]/5 rounded-2xl border border-[#919191]/30 backdrop-blur-sm">
                  <p className="text-xs text-[#474747] font-medium">
                    Connected Wallet
                  </p>
                  <p className="text-sm text-[#353535] font-mono mt-2 break-all">
                    {account.address.slice(0, 6)}...{account.address.slice(-4)}
                  </p>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 rounded-2xl bg-[#919191]/30 blur-xl opacity-0 transition duration-300 group-hover:opacity-100" />
                  <Button
                    size="lg"
                    isLoading={isLoading}
                    onClick={handleWalletLogin}
                    className="relative w-full gap-2 rounded-2xl border border-[#474747]/40 bg-gradient-to-r from-[#353535] via-[#1a1a1a] to-[#353535] text-white font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 group-hover:shadow-[0_15px_40px_-20px_rgba(0,0,0,0.3)]"
                  >
                    <LogIn size={20} />
                    {isLoading ? 'Signing in...' : 'Sign In with Wallet'}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          {/* Info Section */}
          <motion.div
            className="relative z-20 mt-8 p-4 rounded-2xl border border-[#919191]/30 bg-gradient-to-br from-[#919191]/10 to-[#474747]/5 backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <h3 className="font-semibold text-[#353535] mb-3 flex items-center gap-2">
              <Wallet size={18} className="text-[#474747]" />
              Supported Wallets
            </h3>
            <ul className="text-sm text-[#474747] space-y-2">
              <li className="flex items-center gap-2"><span className="text-[#353535]">✓</span> Sui Wallet</li>
              <li className="flex items-center gap-2"><span className="text-[#353535]">✓</span> Suiet</li>
              <li className="flex items-center gap-2"><span className="text-[#353535]">✓</span> Ethos Wallet</li>
              <li className="flex items-center gap-2"><span className="text-[#353535]">✓</span> Standard Wallets</li>
            </ul>
          </motion.div>

          {/* Footer */}
          <motion.p
            className="relative z-20 text-center text-xs text-[#474747] mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            By signing in, you agree to our{' '}
            <a href="#" className="text-[#353535] font-medium hover:text-[#1a1a1a] transition-colors">
              Terms of Service
            </a>
          </motion.p>
        </div>
      </motion.div>
    </>
  );
}
