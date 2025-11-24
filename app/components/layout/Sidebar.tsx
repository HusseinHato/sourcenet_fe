'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Database, LayoutDashboard, Upload, ShoppingBag, Star, Store, Info, Wallet, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { UploadDataPodModal } from '../seller/UploadDataPodModal';

const CATEGORIES = ['All', 'AI/ML', 'Finance', 'Healthcare', 'Social', 'E-commerce', 'Climate'];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'All';
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    params.set('page', '1');

    if (pathname !== '/') {
      router.push(`/?${params.toString()}`);
    } else {
      router.replace(`/?${params.toString()}`);
    }
  };

  const navItems = [
    { icon: Database, label: 'Datasets', href: '/', exact: true },
    { icon: LayoutDashboard, label: 'Buyer Dashboard', href: '/buyer' },
    { icon: Upload, label: 'Seller Dashboard', href: '/seller' },
    { icon: Star, label: 'Reviews', href: '/review' },
    { icon: Wallet, label: 'Wallet', href: '/dashboard/wallet' },
  ];

  return (
    <aside
      className="w-64 fixed h-screen hidden md:block top-0 pt-20 z-40 group/sidebar"
    >
      {/* Background & Texture Layer */}
      <div className="absolute inset-0 bg-[#F5F5F5]/90 backdrop-blur-xl border-r border-[#CECECE]/60 shadow-[5px_0_30px_-10px_rgba(0,0,0,0.05)]">
        {/* Noise Texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\\'0 0 400 400\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cfilter id=\\'n\\'%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.8\\' numOctaves=\\'3\\' stitchTiles=\\'stitch\\'/%3E%3C/filter%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' filter=\\'url(%23n)\\'/%3E%3C/svg%3E')",
          }}
        />
        {/* Subtle Right Highlight Line */}
        <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/80 to-transparent" />
      </div>

      <div className="relative flex flex-col h-full overflow-y-auto custom-scrollbar">
        {/* Upload Data Button - Top of Sidebar */}
        <div className="px-4 pt-4 pb-3">
          <motion.button
            onClick={() => {
              const token = localStorage.getItem('authToken') || localStorage.getItem('zklogin_jwt');
              if (!token) {
                router.push('/login');
                return;
              }
              setIsUploadModalOpen(true);
            }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="w-full relative overflow-hidden flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all group"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#353535] to-[#1a1a1a]" />
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 opacity-50" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-120%', '220%'] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
            />

            <Plus size={18} className="relative z-10" />
            <span className="relative z-10">Upload Data</span>
          </motion.button>
        </div>

        {/* Navigation Section */}
        <div className="px-4 pb-6 space-y-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link key={item.label} href={item.href} className="block relative group">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden ${isActive
                      ? 'text-white shadow-[0_4px_12px_rgba(53,53,53,0.25)]'
                      : 'text-[#474747] hover:bg-[#CECECE]/30 hover:shadow-sm border border-transparent hover:border-[#CECECE]/40'
                      }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-[#353535]">
                        {/* Active State Details: Noise & Shine */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                        <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
                        <div className="absolute inset-x-0 bottom-0 h-px bg-black/20" />
                      </div>
                    )}

                    <item.icon
                      size={16}
                      className={`relative z-10 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-[#919191] group-hover:text-[#353535]'}`}
                    />
                    <span className="relative z-10 truncate tracking-wide">{item.label}</span>

                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Categories Section */}
        <div className="relative mt-2 px-5 pt-6 pb-8">
          {/* Separator Line with Depth */}
          <div className="absolute top-0 left-5 right-5 h-px bg-[#CECECE]/60">
            <div className="absolute top-0 left-0 right-0 h-px bg-white/50 transform translate-y-[1px]" />
          </div>

          <div className="flex items-center gap-2 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#919191]">
              Filter by Category
            </p>
            <div className="h-px flex-1 bg-gradient-to-r from-[#CECECE] to-transparent" />
          </div>

          <nav className="space-y-1">
            {CATEGORIES.map((cat) => {
              const isActive = currentCategory === cat && pathname === '/';
              return (
                <motion.button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  whileHover={{ x: 4 }}
                  className={`w-full relative group flex items-center justify-between px-4 py-2.5 text-xs font-medium rounded-lg transition-all duration-200 border ${isActive
                    ? 'bg-white/60 border-[#CECECE] text-[#353535] shadow-[0_2px_8px_rgba(0,0,0,0.03)]'
                    : 'border-transparent text-[#474747] hover:bg-[#EAEAEA]/50'
                    }`}
                >
                  <span className={isActive ? 'font-bold' : ''}>
                    {cat === 'All' ? 'All Datasets' : cat}
                  </span>

                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-[#353535]"
                    >
                      <ChevronRight size={12} strokeWidth={3} />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Fade Gradient for scrolling content */}
        <div className="sticky bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#F5F5F5] to-transparent pointer-events-none" />
      </div>

      {/* Upload Data Modal */}
      <UploadDataPodModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          setIsUploadModalOpen(false);
          // Optionally refresh data if on homepage
          if (pathname === '/') {
            router.refresh();
          }
        }}
      />
    </aside>
  );
}