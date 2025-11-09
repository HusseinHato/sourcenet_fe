'use client';

import Link from 'next/link';
import { useUserStore } from '@/app/store/userStore';
import { formatAddress } from '@/app/utils/format.utils';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/app/components/common/Button';

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useUserStore();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="font-bold text-lg text-gray-900">DataMarket</span>
          </Link>

          {/* Menu button for mobile */}
          <button onClick={onMenuClick} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={24} />
          </button>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">{formatAddress(user.address)}</span>
                <span className="text-sm font-semibold text-blue-600">{user.balance} SUI</span>
                <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
                  <LogOut size={16} />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
