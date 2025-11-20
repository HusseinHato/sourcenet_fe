'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Menu, X, Search, Copy, Check, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/(main)/store/userStore';
import { useUIStore } from '@/app/(main)/store/uiStore';
import { formatAddress } from '@/app/utils/format.utils';
import { clearAuthToken } from '@/app/utils/api.client';

interface NavbarProps {
  onMenuClick?: () => void;
}

const springConfig = { damping: 25, stiffness: 150 };

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const router = useRouter();
  const { user, logout: storeLogout } = useUserStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  useSpring(mouseX, springConfig);
  useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleLogout = () => {
    clearAuthToken();
    localStorage.removeItem('user');
    storeLogout();
    setIsMobileMenuOpen(false);
    router.push('/login');
  };

  const handleCopyAddress = () => {
    if (!user?.address) return;
    navigator.clipboard.writeText(user.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const mobileMenuVariants: any = {
    hidden: { opacity: 0, scale: 0.92, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 28, mass: 0.7 },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: { duration: 0.25, ease: 'easeInOut' },
    },
  };

  const mobileItemVariants: any = {
    hidden: { x: -40, opacity: 0, filter: 'blur(4px)' },
    visible: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 250, damping: 20 },
    },
  };

  return (
    <>

      <motion.nav
        className="fixed top-0 left-0 right-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E5E5]"
        aria-label="Main navigation"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 22, delay: 0.05 }}
      >
        <motion.div
          ref={navRef}
          onMouseMove={handleMouseMove}
          className={`relative w-full border-b border-[#d8d8d8]/80 shadow-[0_26px_60px_-36px_rgba(34,34,34,0.45)] ${isScrolled ? 'bg-[#CECECE]/85 backdrop-blur-3xl' : 'bg-[#CECECE]/70 backdrop-blur-2xl'
            }`}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/14 via-transparent to-[#919191]/18" />
            <motion.div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  "url('data:image/svg+xml,%3Csvg viewBox=\\'0 0 400 400\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cfilter id=\\'n\\'%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.9\\' numOctaves=\\'4\\' stitchTiles=\\'stitch\\'/%3E%3C/filter%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' filter=\\'url(%23n)\\'/%3E%3C/svg%3E')",
              }}
              animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
              transition={{ duration: 25, repeat: Infinity, repeatType: 'reverse' }}
            />
            <motion.div
              className="absolute inset-0 opacity-0 transition-opacity duration-700"
              style={{
                background: `radial-gradient(900px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(145,145,145,0.2), transparent 60%)`,
              }}
              animate={{ opacity: 1 }}
            />
            <div className="absolute inset-0 border-b border-white/15" />
          </div>

          <div className="mx-auto flex max-w-[1400px] items-center gap-4 md:gap-6 px-4 md:pl-[13rem] md:pr-12 py-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 220 }}
              className="relative flex items-center gap-2 cursor-pointer"
            >
              <Link href="/" passHref>
                <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2">
                  <Image
                    src="/sourcenet.png"
                    alt="SourceNet"
                    width={160}
                    height={48}
                    priority
                    className="h-9 w-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
                  />
                  <span className="hidden sm:inline text-lg font-black text-[#353535] drop-shadow-[0_2px_3px_rgba(53,53,53,0.25)]">
                    SourceNet
                  </span>
                </motion.div>
              </Link>
              <motion.div
                className="absolute -inset-2 rounded-lg bg-gradient-to-r from-[#919191]/30 to-[#474747]/20 blur-xl opacity-0"
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45 }}
              />
            </motion.div>

            <div className="hidden md:flex flex-1 justify-center">
              <div className="relative w-full max-w-4xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#474747]/60" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  placeholder="Search datasets"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#474747]/15 bg-[#F7F7F7] text-sm text-[#353535] placeholder-[#474747]/50 focus:outline-none focus:border-[#474747]/35 focus:bg-white transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                />
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3 ml-auto">
              {user ? (
                <>
                  <motion.button
                    onClick={handleCopyAddress}
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/60 border border-[#474747]/12 backdrop-blur-md text-xs font-semibold text-[#474747] shadow-[0_10px_25px_-18px_rgba(53,53,53,0.45)] hover:bg-white/75 transition-all"
                  >
                    {formatAddress(user.address)}
                    {copiedAddress ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-[#474747]/60" />}
                  </motion.button>
                  <span className="text-xs font-bold text-[#353535]">{user.balance} SUI</span>
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="relative overflow-hidden px-5 py-2 rounded-lg text-xs font-semibold text-white group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#353535] to-[#000000]" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-[#CECECE]/25 to-transparent"
                      animate={{ x: ['-120%', '220%'] }}
                      transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.2 }}
                    />
                    <motion.div
                      className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#919191] to-[#474747] opacity-0 blur-lg group-hover:opacity-70"
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      Logout
                      <LogOut className="h-3.5 w-3.5" />
                    </span>
                  </motion.button>
                </>
              ) : (
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="relative overflow-hidden px-5 py-2 rounded-lg font-semibold text-xs text-white group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#353535] to-[#000000]" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-[#CECECE]/28 to-transparent"
                      animate={{ x: ['-120%', '220%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.4 }}
                    />
                    <motion.div
                      className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#919191] to-[#474747] opacity-0 blur-lg group-hover:opacity-70"
                      transition={{ duration: 0.35 }}
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      Login
                      <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
                        →
                      </motion.span>
                    </span>
                  </motion.button>
                </Link>
              )}
            </div>

            <motion.button
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => {
                const next = !isMobileMenuOpen;
                setIsMobileMenuOpen(next);
                if (next) onMenuClick?.();
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="md:hidden relative ml-auto h-11 w-11 rounded-lg border border-[#474747]/30 bg-[#474747]/15 backdrop-blur-xl flex items-center justify-center overflow-hidden shadow-lg"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#919191]/30 to-[#474747]/30 opacity-0"
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="x"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  >
                    <X className="h-6 w-6 text-[#353535]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ scale: 0, rotate: 90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: -90 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  >
                    <Menu className="h-6 w-6 text-[#353535]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center p-4 md:hidden"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsMobileMenuOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#474747]/55 backdrop-blur-2xl"
            />
            <motion.div
              className="relative w-full max-w-md"
              initial={{ scale: 0.85, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 280, damping: 25 }}
            >
              <div className="relative overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-[#CECECE]/95 backdrop-blur-3xl" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#919191]/20 via-transparent to-[#474747]/25" />
                <div className="absolute inset-0 rounded-3xl border border-[#474747]/30 shadow-xl" />

                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="relative z-10 flex flex-col items-center gap-5 px-6 py-9"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
                    },
                  }}
                >
                  <motion.div
                    initial={{ scale: 0, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 250, delay: 0.15 }}
                  >
                    <Image
                      src="/sourcenet.png"
                      alt="SourceNet"
                      width={220}
                      height={60}
                      className="h-16 w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
                    />
                  </motion.div>

                  <motion.div variants={mobileItemVariants} className="w-full">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#474747]/60" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        type="text"
                        placeholder="Search datasets"
                        className="w-full rounded-2xl border border-[#474747]/15 bg-white/70 px-12 py-3 text-sm text-[#353535] placeholder-[#474747]/50 focus:outline-none focus:border-[#474747]/30"
                      />
                    </div>
                  </motion.div>

                  {user ? (
                    <>
                      <motion.button
                        variants={mobileItemVariants}
                        onClick={handleCopyAddress}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="w-full rounded-2xl border border-[#474747]/20 bg-white/70 px-6 py-3 text-sm font-semibold text-[#474747]"
                      >
                        {formatAddress(user.address)}
                        {copiedAddress ? (
                          <Check className="ml-2 h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="ml-2 h-4 w-4 text-[#474747]/60" />
                        )}
                      </motion.button>
                      <motion.div variants={mobileItemVariants} className="text-center text-xs font-bold text-[#353535]">
                        {user.balance} SUI
                      </motion.div>
                      <motion.button
                        variants={mobileItemVariants}
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        className="relative w-full overflow-hidden rounded-2xl px-7 py-3 text-sm font-semibold text-white"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#353535] to-[#000000]" />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          Logout
                          <LogOut className="h-4 w-4" />
                        </span>
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      variants={mobileItemVariants}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push('/login');
                      }}
                      whileHover={{ scale: 1.06, y: -3 }}
                      whileTap={{ scale: 0.96 }}
                      className="relative w-full overflow-hidden rounded-2xl px-8 py-4 text-lg font-semibold text-white"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#353535] to-[#000000]" />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Launch App
                        <motion.span animate={{ x: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
                          →
                        </motion.span>
                      </span>
                    </motion.button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </>
  );
};