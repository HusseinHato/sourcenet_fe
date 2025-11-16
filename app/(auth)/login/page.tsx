'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { LogIn, Wallet, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';
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
      const maxEpoch = Number(epoch) + 2;

      const randomness = generateRandomness();
      const nonce = generateNonce(ephemeralPublicKey, maxEpoch, randomness);

      sessionStorage.setItem('zklogin_ephemeral_keypair', JSON.stringify({
        publicKey: ephemeralPublicKey.toBase64(),
      }));
      sessionStorage.setItem('zklogin_randomness', randomness);
      sessionStorage.setItem('zklogin_max_epoch', maxEpoch.toString());

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
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-[#f5f5f5] via-white to-[#e6e6e6]">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute top-[-120px] left-[8%] h-[520px] w-[520px] rounded-full bg-white/50 blur-3xl"
          animate={{ y: [0, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-180px] right-[12%] h-[480px] w-[480px] rounded-full bg-gray-300/40 blur-3xl"
          animate={{ y: [0, -35, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-x-0 top-1/2 mx-auto h-64 w-3/4 -translate-y-1/2 rounded-full bg-white/30 blur-3xl" />
      </div>
      {/* Navbar */}
      <motion.nav
        className="fixed top-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-4"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.1 }}
      >
        <div className="relative rounded-3xl border border-white/40 bg-white/40 px-6 md:px-8 py-4 backdrop-blur-2xl shadow-[0_25px_60px_-30px_rgba(20,20,20,0.25)]">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg font-bold text-gray-800"
            >
              SourceNet
            </motion.div>

            {/* Nav Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden md:flex items-center gap-8"
            >
              <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <span>🛒</span>
                <span className="text-sm font-medium">Marketplace</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <span>📚</span>
                <span className="text-sm font-medium">Docs</span>
              </a>
            </motion.div>

            {/* Auth Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3"
            >
              <button className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium">
                Login
              </button>
              <button className="text-sm bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-full transition-colors border border-gray-800 font-medium">
                Register
              </button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

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
            className="relative overflow-hidden rounded-3xl border border-gray-300 bg-[#F0F0F0] p-8 backdrop-blur-2xl shadow-[0_45px_90px_-40px_rgba(20,20,20,0.15)]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
          >
            {/* Gradient Line Top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-400/50 to-transparent" />

            {/* Card Content */}
            <div className="relative z-10 space-y-6 max-w-sm mx-auto">
              {/* Logo Placeholder */}
              <motion.div
                variants={itemVariants}
                className="flex justify-center"
              >
                <div className="w-20 h-20 bg-gray-700 rounded-xl flex items-center justify-center">
                  <span className="text-3xl text-gray-600">📦</span>
                </div>
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
                  <div className="absolute -inset-0.5 rounded-2xl bg-gray-400/30 blur-xl opacity-0 transition duration-300 group-hover:opacity-100" />

                  <button
                    onClick={handleZKLogin}
                    disabled={isLoading}
                    className="relative flex w-full items-center justify-between gap-2 rounded-2xl border border-gray-400 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 px-6 py-3 font-semibold text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 group-hover:shadow-[0_15px_40px_-20px_rgba(0,0,0,0.3)]"
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
                    <div className="w-full h-px bg-gray-400/50" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 text-xs font-semibold text-gray-600 bg-[#F0F0F0]">
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

                    <button className="relative flex w-full items-center justify-between gap-2 rounded-2xl border border-gray-400 bg-white px-6 py-3 font-semibold text-gray-800 transition-all duration-300 hover:bg-gray-50 group-hover:shadow-[0_15px_35px_-22px_rgba(0,0,0,0.15)]">
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
                className="rounded-2xl border border-gray-300 bg-white p-3 transition-colors duration-300 hover:border-gray-400"
              >
                <div className="flex items-start gap-3 text-gray-700">
                  <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-700" />
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-gray-900">
                      Privacy-Preserving Auth
                    </h3>
                    <p className="text-xs leading-relaxed text-gray-700">
                      ZKLogin uses zero-knowledge proofs. Sign in with Google without revealing your identity to the blockchain.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Footer */}
              <motion.p
                variants={itemVariants}
                className="text-center text-xs text-gray-600"
              >
                By signing in, you agree to our{' '}
                <a
                  href="#"
                  className="text-gray-800 transition-colors hover:text-gray-900"
                >
                  Terms of Service
                </a>
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  );
}