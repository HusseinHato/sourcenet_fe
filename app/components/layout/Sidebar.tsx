'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { ShoppingCart, Upload, TrendingUp, Home, Search, LogOut } from 'lucide-react';
import { clearAuthToken } from '@/app/utils/api.client';

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const router = useRouter();
  const { user, logout: storeLogout } = useUserStore();

  const handleLogout = () => {
    // Clear auth token and user data from localStorage
    clearAuthToken();
    localStorage.removeItem('user');
    // NOTE: Do NOT clear zklogin_user_salt - it must persist across sessions
    // to ensure the same Sui address is derived for the same Google account
    
    // Clear user from store
    storeLogout();
    
    // Redirect to login
    router.push('/login');
    
    console.log('User logged out from sidebar');
  };

  const menuItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/marketplace', icon: Search, label: 'Marketplace' },
    ...(user?.role === 'seller' || user?.role === 'both'
      ? [
          { href: '/seller', icon: TrendingUp, label: 'Seller Dashboard' },
          { href: '/seller/upload', icon: Upload, label: 'Upload Data' },
        ]
      : []),
    ...(user?.role === 'buyer' || user?.role === 'both'
      ? [{ href: '/buyer', icon: ShoppingCart, label: 'My Purchases' }]
      : []),
  ];

  return (
    <aside className={`fixed md:relative left-0 top-16 md:top-0 h-screen w-64 bg-gray-50 border-r border-gray-200 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="flex flex-col h-full">
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              <item.icon size={20} className="text-gray-600" />
              <span className="text-gray-700 font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {user && (
          <div className="p-4 border-t border-gray-200">
            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
