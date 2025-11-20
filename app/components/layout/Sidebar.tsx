'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Database, LayoutDashboard, Upload, ShoppingBag, Star, Store, Info } from 'lucide-react';

const CATEGORIES = ['All', 'AI/ML', 'Finance', 'Healthcare', 'Social', 'E-commerce', 'Climate'];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'All';

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    // Reset page when category changes
    params.set('page', '1');

    // If not on home page, redirect to home
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
  ];

  return (
    <aside style={{ backgroundColor: '#F5F5F5', borderRight: '1px solid #CECECE' }} className="w-52 fixed h-screen overflow-y-auto hidden md:block top-0 pt-24 z-40">
      <div className="flex flex-col h-full">
        <div className="px-5 pb-5 space-y-3">
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              const baseClass = 'group w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-semibold transition-colors';
              const stateClass = isActive
                ? 'bg-[#353535] text-white border border-[#2b2b2b] shadow-glass-sm hover:bg-[#2b2b2b]'
                : 'text-[#474747] border border-transparent hover:bg-[#E8E8E8] hover:border-[#CECECE]';

              return (
                <Link key={item.label} href={item.href} className={`${baseClass} ${stateClass}`}>
                  <item.icon size={14} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-4 border-t border-[#D7D7D7] px-5 pt-5 pb-6">
          <p style={{ color: '#919191' }} className="text-[11px] font-semibold uppercase tracking-wide mb-3">
            Categories
          </p>
          <nav className="space-y-1">
            {CATEGORIES.map((cat) => {
              const isActive = currentCategory === cat && pathname === '/';
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`w-full text-left px-4 py-1.75 text-xs font-medium rounded-md transition-colors border ${isActive
                    ? 'bg-[#EAEAEA] border-[#CECECE] text-[#353535]'
                    : 'border-transparent text-[#474747] hover:bg-[#F0F0F0] hover:border-[#E0E0E0]'
                    }`}
                >
                  {cat === 'All' ? 'All datasets' : cat}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
