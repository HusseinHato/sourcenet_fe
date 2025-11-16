'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Menu, X, LogOut, Search, Copy, Check, LayoutDashboard, Upload } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { formatAddress } from '@/app/utils/format.utils';
import { clearAuthToken } from '@/app/utils/api.client';

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const router = useRouter();
  const { user, logout: storeLogout } = useUserStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
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
    if (navRef.current) {
      const rect = navRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
      mouseX.set(x);
      mouseY.set(y);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    localStorage.removeItem('user');
    storeLogout();
    setIsMobileMenuOpen(false);
    router.push('/login');
  };

  const handleCopyAddress = () => {
    if (user?.address) {
      navigator.clipboard.writeText(user.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const navLinks = [
    { name: 'Buyer Dashboard', href: '/buyer', icon: LayoutDashboard },
    { name: 'Upload Data', href: '/seller', icon: Upload },
  ];

  const desktopNavVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const desktopNavItemVariants = {
    hidden: { y: -15, opacity: 0, filter: 'blur(3px)' },
    visible: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        stiffness: 350,
        damping: 22,
        mass: 0.8,
      },
    },
  };

  const mobileMenuVariants = {
    hidden: {
      opacity: 0,
      scale: 0.92,
      y: 40,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 28,
        mass: 0.7,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: {
        duration: 0.25,
        ease: 'easeInOut',
      },
    },
  };

  const mobileNavVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const mobileNavItemVariants = {
    hidden: { x: -40, opacity: 0, filter: 'blur(4px)' },
    visible: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        stiffness: 250,
        damping: 20,
      },
    },
  };

  return (
    <>
      <motion.nav
        className={`fixed left-1/2 z-50 w-full max-w-[1400px] -translate-x-1/2 px-4 md:px-6 transition-all duration-500 ${
          isScrolled ? 'top-2 md:top-3' : 'top-4 md:top-5'
        }`}
        aria-label="Main navigation"
      >
        <motion.div
          ref={navRef}
          onMouseMove={handleMouseMove}
          className="relative mx-auto flex items-center justify-between rounded-2xl px-5 md:px-7 py-3 overflow-hidden group/nav transition-shadow duration-500"
          style={{
            boxShadow: isScrolled
              ? '0 30px 70px -32px rgba(34,34,34,0.55)'
              : '0 22px 60px -36px rgba(34,34,34,0.45)',
          }}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 120,
            damping: 22,
            delay: 0.15,
          }}
          role="navigation"
        >
          {/* Background Glassmorphism */}
          <div
            className={`absolute inset-0 rounded-2xl ${
              isScrolled ? 'bg-[#CECECE]/70 backdrop-blur-3xl' : 'bg-[#CECECE]/55 backdrop-blur-2xl'
            }`}
          />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#474747]/10 via-transparent to-[#919191]/15" />

          {/* Animated Grain Texture */}
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-15 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />

          {/* Interactive Glow Effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover/nav:opacity-100 transition-opacity duration-700"
            style={{
              background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(145,145,145,0.2), transparent 50%)`,
            }}
          />

          {/* Border & Shadow */}
          <div className="absolute inset-0 rounded-2xl border border-[#474747]/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_25px_60px_-20px_rgba(71,71,71,0.25)]" />

          {/* Shimmer Effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'linear-gradient(120deg, transparent 35%, rgba(145,145,145,0.25) 50%, transparent 65%)',
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

          {/* Main Content */}
          <div className="relative z-10 flex items-center justify-between w-full">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 220 }}
              className="relative group/logo cursor-pointer"
              role="button"
              aria-label="Go to homepage"
            >
              <Link href="/" passHref>
                <motion.div
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2"
                >
                  <Image
                    src="/sourcenet.png"
                    alt="SourceNet"
                    width={160}
                    height={40}
                    priority
                    className="h-10 w-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
                  />
                  <span className="hidden sm:inline text-base font-black text-[#353535] drop-shadow-[0_2px_3px_rgba(53,53,53,0.25)] leading-none">
                    SourceNet
                  </span>
                </motion.div>
              </Link>

              <motion.div
                className="absolute -inset-2.5 bg-gradient-to-r from-[#919191]/30 to-[#474747]/20 rounded-full blur-xl opacity-0 group-hover/logo:opacity-100"
                transition={{ duration: 0.4 }}
              />
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div
              variants={desktopNavVariants}
              initial="hidden"
              animate="visible"
              className="hidden md:flex items-center gap-5 ml-8"
            >
              {navLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  variants={desktopNavItemVariants}
                  onHoverStart={() => setHoveredLink(link.href)}
                  onHoverEnd={() => setHoveredLink(null)}
                  className="relative px-5 py-1.5 rounded-xl group/link focus:outline-none"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center gap-2 text-[#474747] font-semibold text-sm md:text-[14px] transition-colors duration-300 leading-tight">
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </span>
                </motion.a>
              ))}
            </motion.div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex items-center flex-1 max-w-xs ml-auto mr-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#474747]/60" />
                <input
                  type="text"
                  placeholder="Search data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#474747]/5 border border-[#474747]/15 text-[#353535] placeholder-[#474747]/50 focus:outline-none focus:border-[#474747]/30 transition-all duration-300 text-xs"
                />
              </div>
            </div>

            {/* Desktop User Section */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <motion.button
                    onClick={handleCopyAddress}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#474747]/5 hover:bg-[#474747]/10 border border-[#474747]/15 transition-all duration-300"
                  >
                    <span className="text-xs font-semibold text-[#474747] leading-none">
                      {formatAddress(user.address)}
                    </span>
                    {copiedAddress ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-[#474747]/60" />
                    )}
                  </motion.button>

                  <span className="text-xs font-bold text-[#353535] whitespace-nowrap leading-none">{user.balance} SUI</span>

                  <motion.button
                    onClick={handleLogout}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 220 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative px-5 py-1.5 rounded-full font-bold text-xs md:text-[12px] overflow-hidden group/cta"
                    aria-label="Logout"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#353535] to-[#000000]" />

                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-[#CECECE]/30 to-transparent"
                      animate={{ x: ['-120%', '220%'] }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        repeatDelay: 1.2,
                      }}
                    />

                    <motion.div
                      className="absolute -inset-1 bg-gradient-to-r from-[#919191] to-[#474747] rounded-full opacity-0 group-hover/cta:opacity-70 blur-lg"
                      transition={{ duration: 0.35 }}
                    />

                    <span className="relative z-10 text-white flex items-center gap-1">
                      <LogOut className="w-3 h-3" />
                      Logout
                    </span>
                  </motion.button>
                </>
              ) : (
                <Link href="/login">
                  <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 220 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative px-5 py-1.5 rounded-full font-bold text-xs md:text-[12px] overflow-hidden group/cta"
                    aria-label="Login to SourceNet"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#353535] to-[#000000]" />

                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-[#CECECE]/30 to-transparent"
                      animate={{ x: ['-120%', '220%'] }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        repeatDelay: 1.2,
                      }}
                    />

                    <motion.div
                      className="absolute -inset-1 bg-gradient-to-r from-[#919191] to-[#474747] rounded-full opacity-0 group-hover/cta:opacity-70 blur-lg"
                      transition={{ duration: 0.35 }}
                    />

                    <span className="relative z-10 text-white flex items-center gap-1">
                      Login
                      <motion.span
                        animate={{ x: [0, 3, 0] }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="text-xs"
                      >
                        →
                      </motion.span>
                    </span>
                  </motion.button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              className="md:hidden relative w-10 h-10 rounded-lg bg-[#474747]/15 backdrop-blur-xl border border-[#474747]/30 flex items-center justify-center overflow-hidden group/mobile shadow-lg"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#919191]/30 to-[#474747]/30 opacity-0 group-hover/mobile:opacity-100"
                transition={{ duration: 0.3 }}
              />

              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="x"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 22,
                    }}
                  >
                    <X className="w-5 h-5 text-[#353535]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ scale: 0, rotate: 90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: -90 }}
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 22,
                    }}
                  >
                    <Menu className="w-5 h-5 text-[#353535]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40 flex items-center justify-center p-4 md:p-6"
            onClick={(e) => e.target === e.currentTarget && setIsMobileMenuOpen(false)}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#474747]/50 backdrop-blur-2xl"
            />

            {/* Glass Panel */}
            <motion.div
              className="relative w-full max-w-md"
              initial={{ scale: 0.85, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 25,
              }}
            >
              <div className="relative rounded-3xl overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-[#CECECE]/95 backdrop-blur-3xl" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#919191]/25 via-transparent to-[#474747]/25" />
                <div className="absolute inset-0 rounded-3xl border border-[#474747]/30 shadow-xl" />

                {/* Content */}
                <motion.div
                  variants={mobileNavVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="relative z-10 flex flex-col items-center gap-4 py-8 px-6"
                >
                  {/* Mobile Logo */}
                  <motion.div
                    initial={{ scale: 0, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 250,
                      delay: 0.15,
                    }}
                    className="mb-1"
                  >
                    <Image
                      src="/sourcenet.png"
                      alt="SourceNet"
                      width={200}
                      height={50}
                      className="h-14 w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
                    />
                  </motion.div>

                  {/* Mobile Search */}
                  <motion.div
                    variants={mobileNavItemVariants}
                    className="w-full max-w-[260px]"
                  >
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#474747]/60" />
                      <input
                        type="text"
                        placeholder="Search data..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#474747]/5 border border-[#474747]/15 text-[#353535] placeholder-[#474747]/50 focus:outline-none focus:border-[#474747]/30 transition-all duration-300 text-sm"
                      />
                    </div>
                  </motion.div>

                  {/* Nav Links */}
                  {navLinks.map((link) => (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      variants={mobileNavItemVariants}
                      onClick={() => setIsMobileMenuOpen(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      className="w-full max-w-[260px] rounded-xl"
                    >
                      <div className="relative px-6 py-2.5 flex items-center justify-center gap-2">
                        <link.icon className="w-5 h-5 text-[#474747]" />
                        <span className="text-[#474747] font-semibold text-base">
                          {link.name}
                        </span>
                      </div>
                    </motion.a>
                  ))}

                  {/* User Info or Login */}
                  {user ? (
                    <>
                      <motion.div
                        variants={mobileNavItemVariants}
                        className="w-full max-w-[260px] border-t border-[#474747]/20 pt-4 mt-1"
                      >
                        <motion.button
                          onClick={handleCopyAddress}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#474747]/5 hover:bg-[#474747]/10 border border-[#474747]/15 transition-all duration-300 mb-2"
                        >
                          <span className="text-xs font-semibold text-[#474747]">
                            {formatAddress(user.address)}
                          </span>
                          {copiedAddress ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-[#474747]/60" />
                          )}
                        </motion.button>

                        <p className="text-center text-xs font-bold text-[#353535] mb-2">
                          {user.balance} SUI
                        </p>

                        <motion.button
                          variants={mobileNavItemVariants}
                          onClick={handleLogout}
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full relative px-6 py-2 rounded-full font-bold text-xs overflow-hidden group/mobile-logout"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-[#353535] to-[#000000]" />
                          <motion.div
                            className="absolute -inset-1 bg-gradient-to-r from-[#919191] to-[#474747] rounded-full opacity-0 group-hover/mobile-logout:opacity-70 blur-lg"
                            transition={{ duration: 0.35 }}
                          />
                          <span className="relative z-10 text-white flex items-center justify-center gap-1">
                            <LogOut className="w-3 h-3" />
                            Logout
                          </span>
                        </motion.button>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div
                      variants={mobileNavItemVariants}
                      className="w-full max-w-[260px] border-t border-[#474747]/20 pt-4 mt-1"
                    >
                      <Link href="/login" className="w-full block">
                        <motion.button
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full relative px-6 py-2 rounded-full font-bold text-xs overflow-hidden group/mobile-login"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-[#353535] to-[#000000]" />

                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#CECECE]/30 to-transparent"
                            animate={{ x: ['-120%', '220%'] }}
                            transition={{
                              duration: 2.2,
                              repeat: Infinity,
                              repeatDelay: 1.2,
                            }}
                          />

                          <motion.div
                            className="absolute -inset-1 bg-gradient-to-r from-[#919191] to-[#474747] rounded-full opacity-0 group-hover/mobile-login:opacity-70 blur-lg"
                            transition={{ duration: 0.35 }}
                          />

                          <span className="relative z-10 text-white flex items-center justify-center gap-1">
                            Login
                            <motion.span
                              animate={{ x: [0, 3, 0] }}
                              transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                              className="text-xs"
                            >
                              →
                            </motion.span>
                          </span>
                        </motion.button>
                      </Link>
                    </motion.div>
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