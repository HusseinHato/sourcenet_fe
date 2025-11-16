'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
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

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Technology', href: '#technology' },
    { name: 'About', href: '#about' },
  ];

  // Animasi untuk desktop nav
  const desktopNavVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.2 
      } 
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
        mass: 0.8 
      } 
    },
  };

  // Animasi untuk mobile menu
  const mobileMenuVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.92,
      y: 40 
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 28,
        mass: 0.7
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: { 
        duration: 0.25,
        ease: 'easeInOut' 
      }
    }
  };

  const mobileNavVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2 
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
        damping: 20 
      } 
    },
  };

  return (
    <>
      <motion.nav
        className={`fixed left-1/2 z-50 w-full max-w-[1400px] -translate-x-1/2 px-4 md:px-6 transition-all duration-500 ${
          isScrolled 
            ? 'top-3 md:top-4'
            : 'top-6 md:top-8'
        }`}
        aria-label="Main navigation"
      >
        <motion.div
          ref={navRef}
          onMouseMove={handleMouseMove}
          className="relative mx-auto flex items-center justify-between rounded-[28px] px-5 md:px-7 py-4 overflow-hidden group/nav transition-shadow duration-500"
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
            delay: 0.15 
          }}
          role="navigation"
        >
          {/* ✅ Lapisan Background Glassmorphism */}
          <div
            className={`absolute inset-0 rounded-[28px] ${
              isScrolled ? 'bg-[#CECECE]/70 backdrop-blur-3xl' : 'bg-[#CECECE]/55 backdrop-blur-2xl'
            }`}
          />
          <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#474747]/10 via-transparent to-[#919191]/15" />
          
          {/* Animated Grain Texture */}
          <motion.div 
            className="absolute inset-0 rounded-[28px] opacity-15 pointer-events-none"
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
            className="absolute inset-0 rounded-[28px] opacity-0 group-hover/nav:opacity-100 transition-opacity duration-700"
            style={{
              background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(145,145,145,0.2), transparent 50%)`,
            }}
          />

          {/* ✅ Border & Shadow Profesional */}
          <div className="absolute inset-0 rounded-[28px] 
            border border-[#474747]/25 
            shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_25px_60px_-20px_rgba(71,71,71,0.25)]" 
          />
          
          {/* Shimmer Effect */}
          <motion.div
            className="absolute inset-0 rounded-[28px]"
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

          {/* ✅ Konten Utama — dengan spacing diperbaiki */}
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
                    width={180}
                    height={50}
                    priority
                    className="h-12 w-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
                  />
                  <span className="hidden sm:inline text-lg font-black text-[#353535] drop-shadow-[0_2px_3px_rgba(53,53,53,0.25)]">SourceNet</span>
                </motion.div>
              </Link>
              
              {/* Logo Glow */}
              <motion.div
                className="absolute -inset-2.5 bg-gradient-to-r from-[#919191]/30 to-[#474747]/20 rounded-full blur-xl opacity-0 group-hover/logo:opacity-100"
                transition={{ duration: 0.4 }}
              />
            </motion.div>

            {/* ✅ Desktop Navigation — spacing diperbesar & lebih elegan */}
            <motion.div
              variants={desktopNavVariants}
              initial="hidden"
              animate="visible"
              className="hidden md:flex items-center gap-6 ml-8" // 🔥 gap-1 → gap-6 + ml-8
            >
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  variants={desktopNavItemVariants}
                  onHoverStart={() => setHoveredLink(link.href)}
                  onHoverEnd={() => setHoveredLink(null)}
                  onFocus={() => setHoveredLink(link.href)}
                  onBlur={() => setHoveredLink(null)}
                  className="relative px-7 py-2.5 rounded-2xl group/link focus:outline-none"
                  whileHover={{ scale: 1.06, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  aria-current={link.href === '#features' ? 'page' : undefined}
                >
                  {/* ✅ Hover Background */}
                  <AnimatePresence>
                    {hoveredLink === link.href && (
                      <motion.div
                        layoutId="navHover"
                        className="absolute inset-0 bg-gradient-to-r from-[#919191]/35 to-[#474747]/15 rounded-2xl backdrop-blur-sm"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ 
                          type: 'spring', 
                          stiffness: 450, 
                          damping: 28 
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {/* ✅ Border saat hover */}
                  {hoveredLink === link.href && (
                    <motion.div
                      layoutId="navBorder"
                      className="absolute inset-0 rounded-2xl border border-[#474747]/40"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    />
                  )}

                  <span className="relative z-10 text-[#474747] group-hover/link:text-[#353535] font-semibold text-base md:text-[15px] transition-colors duration-300">
                    {link.name}
                  </span>

                  {/* ✅ Underline animasi */}
                  {hoveredLink === link.href && (
                    <motion.div
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-[#353535] to-transparent"
                      layoutId="underline"
                      initial={{ width: '0%', opacity: 0 }}
                      animate={{ width: '85%', opacity: 1 }}
                      exit={{ width: '0%', opacity: 0 }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 550, 
                        damping: 32,
                        mass: 0.7 
                      }}
                    />
                  )}
                </motion.a>
              ))}
            </motion.div>

            {/* ✅ CTA Button — spacing & interaksi diperbaiki */}
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 220 }}
              whileHover={{ scale: 1.1, y: -3 }}
              whileTap={{ scale: 0.95, y: 0 }}
              className="hidden md:block relative px-8 py-3.5 rounded-full font-bold text-base md:text-[15px] overflow-hidden group/cta mr-2" // 🔥 px-7 → px-8, py-3 → py-3.5, + mr-2
              aria-label="Get started with SourceNet"
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#353535] to-[#000000]" />
              
              {/* Shine Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#CECECE]/30 to-transparent"
                animate={{ x: ['-120%', '220%'] }}
                transition={{ 
                  duration: 2.2, 
                  repeat: Infinity, 
                  repeatDelay: 1.2 
                }}
              />
              
              {/* Outer Glow */}
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-[#919191] to-[#474747] rounded-full opacity-0 group-hover/cta:opacity-70 blur-lg"
                transition={{ duration: 0.35 }}
              />

              <span className="relative z-10 text-white flex items-center gap-2">
                Launch App
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ 
                    duration: 1.8, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-lg"
                >
                  →
                </motion.span>
              </span>
            </motion.button>

            {/* ✅ Mobile Menu Button — ukuran & spacing diperbesar */}
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              className="md:hidden relative w-12 h-12 rounded-xl bg-[#474747]/15 backdrop-blur-xl border border-[#474747]/30 flex items-center justify-center overflow-hidden group/mobile shadow-lg"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {/* Inner Glow */}
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
                      damping: 22 
                    }}
                  >
                    <X className="w-6 h-6 text-[#353535]" />
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
                      damping: 22 
                    }}
                  >
                    <Menu className="w-6 h-6 text-[#353535]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>
      </motion.nav>

      {/* ✅ Mobile Menu Overlay — UX diperbaiki */}
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

            {/* ✅ Glass Panel — ukuran & spacing diperbaiki */}
            <motion.div
              className="relative w-full max-w-md"
              initial={{ scale: 0.85, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ 
                type: 'spring', 
                stiffness: 280, 
                damping: 25 
              }}
            >
              <div className="relative rounded-3xl overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-[#CECECE]/95 backdrop-blur-3xl" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#919191]/25 via-transparent to-[#474747]/25" />
                <div className="absolute inset-0 rounded-3xl border border-[#474747]/30 shadow-xl" />

                {/* ✅ Konten Mobile */}
                <motion.div
                  variants={mobileNavVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="relative z-10 flex flex-col items-center gap-5 py-10 px-6"
                >
                  {/* Mobile Logo */}
                  <motion.div
                    initial={{ scale: 0, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 250, 
                      delay: 0.15 
                    }}
                    className="mb-2"
                  >
                    <Image
                      src="/sourcenet.png"
                      alt="SourceNet"
                      width={220}
                      height={60}
                      className="h-16 w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
                    />
                  </motion.div>

                  {/* Nav Links */}
                  {navLinks.map((link, index) => (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      variants={mobileNavItemVariants}
                      onClick={() => setIsMobileMenuOpen(false)}
                      whileHover={{ scale: 1.06, x: 8 }}
                      whileTap={{ scale: 0.96 }}
                      className="w-full max-w-[280px]"
                      aria-current={link.href === '#features' ? 'page' : undefined}
                    >
                      <div className="relative rounded-2xl overflow-hidden">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-[#919191]/0 to-[#919191]/0 group-hover:from-[#919191]/45 group-hover:to-[#474747]/30"
                          transition={{ duration: 0.35 }}
                        />
                        <div className="absolute inset-0 rounded-2xl border border-[#474747]/0 group-hover:border-[#474747]/35 transition-colors duration-300" />
                        
                        <div className="relative z-10 px-7 py-4.5 flex items-center justify-center">
                          <span className="text-[#474747] group-hover:text-[#353535] font-semibold text-xl transition-colors duration-250">
                            {link.name}
                          </span>
                        </div>
                      </div>
                    </motion.a>
                  ))}

                  {/* ✅ Mobile CTA — ukuran diperbesar */}
                  <motion.button
                    variants={mobileNavItemVariants}
                    onClick={() => setIsMobileMenuOpen(false)}
                    whileHover={{ scale: 1.06, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full max-w-[280px] relative mt-3 px-8 py-4.5 rounded-2xl font-bold text-lg overflow-hidden group/mobile-cta"
                    aria-label="Get started with SourceNet"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#353535] to-[#000000]" />
                    <motion.div
                      className="absolute -inset-1.5 bg-gradient-to-r from-[#919191] to-[#474747] rounded-2xl opacity-0 group-hover/mobile-cta:opacity-70 blur-xl"
                      transition={{ duration: 0.35 }}
                    />
                    <span className="relative z-10 text-white flex items-center justify-center gap-2.5">
                      Launch App
                      <motion.span
                        animate={{ x: [0, 6, 0] }}
                        transition={{ 
                          duration: 1.8, 
                          repeat: Infinity 
                        }}
                        className="text-xl"
                      >
                        →
                      </motion.span>
                    </span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}