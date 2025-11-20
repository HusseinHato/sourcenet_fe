'use client';

import { useState } from 'react';
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  Star,
  Package,
  Download,
  Eye,
  ChevronRight,
  Calendar,
  Search,
  Filter,
} from 'lucide-react';

interface Purchase {
  id: string;
  title: string;
  seller: string;
  price_sui: number;
  purchased_at: string;
  status: 'completed' | 'pending' | 'processing';
  rating?: number;
  category: string;
}

const mockPurchases: Purchase[] = [
  {
    id: 'p-001',
    title: 'Customer Behavior Analytics',
    seller: 'DataVault Pro',
    price_sui: 150,
    purchased_at: '2024-11-15',
    status: 'completed',
    rating: 5,
    category: 'AI/ML',
  },
  {
    id: 'p-002',
    title: 'E-commerce Transaction Data',
    seller: 'Commerce Insights',
    price_sui: 200,
    purchased_at: '2024-11-10',
    status: 'completed',
    rating: 4,
    category: 'E-commerce',
  },
  {
    id: 'p-003',
    title: 'Social Media Sentiment Analysis',
    seller: 'Social Analytics',
    price_sui: 120,
    purchased_at: '2024-11-08',
    status: 'processing',
    category: 'Social',
  },
  {
    id: 'p-004',
    title: 'Financial Market Data Feed',
    seller: 'FinanceAPI',
    price_sui: 160,
    purchased_at: '2024-10-28',
    status: 'completed',
    rating: 5,
    category: 'Finance',
  },
];

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'pending'>('all');

  const filteredPurchases = mockPurchases.filter((p) => {
    if (activeTab === 'all') return true;
    return p.status === activeTab;
  });

  const totalPurchases = mockPurchases.length;
  const completedPurchases = mockPurchases.filter((p) => p.status === 'completed').length;
  const pendingPurchases = mockPurchases.filter((p) => p.status === 'pending' || p.status === 'processing').length;
  const totalSpent = mockPurchases.reduce((sum, p) => sum + p.price_sui, 0);

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < Math.floor(rating) ? 'fill-gray-900 text-gray-900' : 'fill-gray-200 text-gray-200'}
      />
    ));
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-gray-100 text-gray-800 border border-gray-200',
      pending: 'bg-gray-50 text-gray-600 border border-gray-200',
      processing: 'bg-gray-50 text-gray-600 border border-gray-200',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-8 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Buyer Dashboard</h1>
              <p className="text-gray-500 mt-1">Manage your purchases and track your spending</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm">
                <ShoppingBag size={16} />
                Browse Marketplace
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Package className="text-gray-900" size={20} />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">Total Purchases</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalPurchases}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Download className="text-gray-900" size={20} />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">Completed</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{completedPurchases}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Clock className="text-gray-900" size={20} />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">Pending</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{pendingPurchases}</p>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <TrendingUp className="text-white" size={20} />
              </div>
            </div>
            <p className="text-gray-400 text-sm font-medium">Total Spent</p>
            <p className="text-3xl font-bold text-white mt-1">{totalSpent} <span className="text-lg font-normal text-gray-400">SUI</span></p>
          </div>
        </div>

        {/* Recent Purchases Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Purchases</h2>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-lg self-start sm:self-auto">
              {(['all', 'completed', 'pending'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === tab
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Purchases List */}
          <div className="divide-y divide-gray-100">
            {filteredPurchases.length > 0 ? (
              filteredPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="p-6 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {purchase.title}
                        </h3>
                        {getStatusBadge(purchase.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Eye size={14} />
                          {purchase.seller}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {new Date(purchase.purchased_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-xs font-medium text-gray-600">
                          {purchase.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      {purchase.rating && (
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">{getRatingStars(purchase.rating)}</div>
                        </div>
                      )}
                      <div className="text-right min-w-[80px]">
                        <p className="text-lg font-bold text-gray-900">{purchase.price_sui} SUI</p>
                      </div>
                      <button className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all">
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                  <Package className="text-gray-400" size={24} />
                </div>
                <p className="text-base font-semibold text-gray-900 mb-1">No purchases found</p>
                <p className="text-sm text-gray-500">Try adjusting your filter or browse the marketplace</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}