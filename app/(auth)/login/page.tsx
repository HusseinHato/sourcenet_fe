'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { LogIn, Wallet, ArrowRight, Shield, Lock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateNonce, generateRandomness } from '@mysten/sui/zklogin';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const handleZKLogin = async () => {
    try {
      setIsLoading(true);

      const clientId = process.env.NEXT_PUBLIC_ZKLOGIN_CLIENT_ID;
      const redirectUrl = process.env.NEXT_PUBLIC_ZKLOGIN_REDIRECT_URL;
      const suiRpcUrl = process.env.NEXT_PUBLIC_SUI_RPC_URL || getFullnodeUrl('devnet');

      if (!clientId || !redirectUrl) {
        alert('ZKLogin is not properly configured. Please check environment variables.');
        return;
      }

      const ephemeralKeyPair = new Ed25519Keypair();
      const ephemeralPublicKey = ephemeralKeyPair.getPublicKey();

      const suiClient = new SuiClient({ url: suiRpcUrl });
      const { epoch } = await suiClient.getLatestSuiSystemState();
      const maxEpoch = Number(epoch) + 10;

      const randomness = generateRandomness();
      const nonce = generateNonce(ephemeralPublicKey, maxEpoch, randomness);

      // Store in localStorage to ensure persistence across tabs/redirects
      localStorage.setItem('zklogin_ephemeral_keypair', JSON.stringify({
        publicKey: ephemeralPublicKey.toBase64(),
        secretKey: Array.from(ephemeralKeyPair.getSecretKey()),
      }));
      localStorage.setItem('zklogin_randomness', randomness);
      localStorage.setItem('zklogin_max_epoch', maxEpoch.toString());

      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      googleAuthUrl.searchParams.append('client_id', clientId);
      googleAuthUrl.searchParams.append('redirect_uri', redirectUrl);
      googleAuthUrl.searchParams.append('response_type', 'id_token');
      googleAuthUrl.searchParams.append('scope', 'openid email profile');
      googleAuthUrl.searchParams.append('nonce', nonce);

      window.location.href = googleAuthUrl.toString();
    } catch (err) {
      console.error('ZKLogin error:', err);
      alert('Failed to initiate ZKLogin. Please try again.');
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  } satisfies Variants;

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
      },
    },
  } satisfies Variants;

  return (
    <>
      {/* Main Content */}
      <motion.div
        className="w-full max-w-md mt-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Login Card */}
        <motion.div
          variants={itemVariants}
          className="relative"
        >
          {/* Card */}
          <motion.div
            className="relative overflow-hidden rounded-3xl border border-[#919191]/30 bg-[#CECECE]/60 p-8 backdrop-blur-3xl shadow-[0_45px_90px_-40px_rgba(20,20,20,0.15)]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
          >
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

            {/* Card Content */}
            <div className="relative z-20 space-y-6 max-w-sm mx-auto">
              {/* Logo */}
              <motion.div
                variants={itemVariants}
                className="flex justify-center"
              >
                <div className="w-20 h-20 relative">
                  <Image
                    src="/sourcenet.png"
                    alt="SourceNet Logo"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
              </motion.div>

              {/* Title */}
              <motion.div
                variants={itemVariants}
                className="text-center"
              >
                <h1 className="text-3xl font-bold text-[#353535]">SourceNet</h1>
                <p className="text-[#474747] mt-2 text-sm">Secure Web3 Authentication</p>
              </motion.div>

              {/* Login Options */}
              <motion.div
                variants={itemVariants}
                className="space-y-3"
              >
                {/* ZKLogin Button */}
                <motion.div
                  onHoverStart={() => setHoveredOption('zklogin')}
                  onHoverEnd={() => setHoveredOption(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 rounded-2xl bg-[#919191]/30 blur-xl opacity-0 transition duration-300 group-hover:opacity-100" />

                  <button
                    onClick={handleZKLogin}
                    disabled={isLoading}
                    className="relative flex w-full items-center justify-between gap-2 rounded-2xl border border-[#474747]/40 bg-gradient-to-r from-[#353535] via-[#1a1a1a] to-[#353535] px-6 py-3 font-semibold text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 group-hover:shadow-[0_15px_40px_-20px_rgba(0,0,0,0.3)]"
                  >
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: isLoading ? 360 : 0 }}
                        transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
                        className="text-white"
                      >
                        <LogIn className="h-4 w-4" />
                      </motion.div>
                      <span className="text-sm">
                        {isLoading ? 'Signing in...' : 'Sign in with Google (ZKLogin)'}
                      </span>
                    </div>
                    {!isLoading && (
                      <motion.div
                        animate={{ x: hoveredOption === 'zklogin' ? 4 : 0 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="text-white"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    )}
                  </button>
                </motion.div>

                {/* Divider */}
                <motion.div
                  variants={itemVariants}
                  className="relative py-2"
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-[#474747]/40" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 text-xs font-semibold text-[#474747] bg-[#CECECE]/60">
                      OR
                    </span>
                  </div>
                </motion.div>

                {/* Wallet Button */}
                <Link href="/wallet-login" className="block">
                  <motion.div
                    onHoverStart={() => setHoveredOption('wallet')}
                    onHoverEnd={() => setHoveredOption(null)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group"
                  >
                    <div className="absolute -inset-0.5 rounded-2xl bg-gray-300/30 blur-lg opacity-0 transition duration-300 group-hover:opacity-100" />

                    <button className="relative flex w-full items-center justify-between gap-2 rounded-2xl border border-[#919191]/40 bg-gradient-to-br from-[#f5f5f5] to-[#e6e6e6] px-6 py-3 font-semibold text-[#353535] transition-all duration-300 hover:from-[#e6e6e6] hover:to-[#d4d4d4] group-hover:shadow-[0_15px_35px_-22px_rgba(0,0,0,0.15)]">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: hoveredOption === 'wallet' ? 12 : 0 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                          className="text-gray-800"
                        >
                          <Wallet className="h-4 w-4" />
                        </motion.div>
                        <span className="text-sm">Sign in with Wallet</span>
                      </div>
                      <motion.div
                        animate={{ x: hoveredOption === 'wallet' ? 4 : 0 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="text-gray-800"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    </button>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Info Box */}
              <motion.div
                variants={itemVariants}
                className="rounded-2xl border border-[#919191]/30 bg-gradient-to-br from-[#919191]/10 to-[#474747]/5 p-4 transition-all duration-300 hover:border-[#919191]/50 backdrop-blur-sm"
              >
                <div className="flex items-start gap-3 text-[#474747]">
                  <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#353535]" />
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-[#353535]">
                      Privacy-Preserving Auth
                    </h3>
                    <p className="text-xs leading-relaxed text-[#474747]">
                      ZKLogin uses zero-knowledge proofs. Sign in with Google without revealing your identity to the blockchain.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Footer */}
              <motion.p
                variants={itemVariants}
                className="text-center text-xs text-[#474747]"
              >
                By signing in, you agree to our{' '}
                <a
                  href="#"
                  className="text-[#353535] font-medium transition-colors hover:text-[#1a1a1a]"
                >
                  Terms of Service
                </a>
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}