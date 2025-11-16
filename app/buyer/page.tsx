'use client';

import { useState } from 'react';
import type { ComponentType } from 'react';
import {
  ShoppingCart,
  Download,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  Package,
  TrendingUp,
  Eye,
  Share2,
} from 'lucide-react';

type PurchaseStatus = 'completed' | 'pending';

type BuyerPurchase = {
  id: string;
  datapod_title: string;
  price_sui: number;
  purchase_status: PurchaseStatus;
  created_at: string;
  seller: string;
  category: string;
  fileSize: string;
  downloads: number;
};

type FilterStatus = 'all' | PurchaseStatus;

type IconComponent = ComponentType<{ className?: string; size?: number }>;

type StatCardProps = {
  icon: IconComponent;
  label: string;
  value: number | string;
};

interface StatusBadgeProps {
  status: PurchaseStatus;
}

const formatPrice = (price: number): string => `${price.toLocaleString()} SUI`;
const formatDateRelative = (date: string | Date): string => {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};

const mockPurchases: BuyerPurchase[] = [
  {
    id: 'p-001',
    datapod_title: 'Customer Behavior Analytics',
    price_sui: 150,
    purchase_status: 'completed',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    seller: 'DataVault Pro',
    category: 'AI/ML',
    fileSize: '2.5 GB',
    downloads: 3,
  },
  {
    id: 'p-002',
    datapod_title: 'E-commerce Transaction Data',
    price_sui: 200,
    purchase_status: 'completed',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    seller: 'Commerce Insights',
    category: 'E-commerce',
    fileSize: '3.8 GB',
    downloads: 5,
  },
  {
    id: 'p-003',
    datapod_title: 'Social Media Sentiment Analysis',
    price_sui: 120,
    purchase_status: 'pending',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    seller: 'Social Analytics',
    category: 'Social',
    fileSize: '1.2 GB',
    downloads: 0,
  },
  {
    id: 'p-004',
    datapod_title: 'Financial Market Data Feed',
    price_sui: 160,
    purchase_status: 'completed',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    seller: 'FinData Systems',
    category: 'Finance',
    fileSize: '4.2 GB',
    downloads: 2,
  },
  {
    id: 'p-005',
    datapod_title: 'Healthcare Patient Records',
    price_sui: 180,
    purchase_status: 'completed',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    seller: 'Health Analytics',
    category: 'Healthcare',
    fileSize: '2.1 GB',
    downloads: 1,
  },
];

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5';
  if (status === 'completed') {
    return (
      <span className={`${baseClasses} bg-emerald-100 text-emerald-800`}>
        <CheckCircle size={14} /> Completed
      </span>
    );
  }
  return (
    <span className={`${baseClasses} bg-amber-100 text-amber-800`}>
      <Clock size={14} /> Pending
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value }: StatCardProps) => (
  <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-blue-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="relative flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default function BuyerDashboardPage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const purchases: BuyerPurchase[] = mockPurchases;

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch = purchase.datapod_title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || purchase.purchase_status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const completedCount = purchases.filter(p => p.purchase_status === 'completed').length;
  const pendingCount = purchases.filter(p => p.purchase_status === 'pending').length;
  const totalSpent = purchases.reduce((sum, p) => sum + p.price_sui, 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-white pt-28 sm:pt-32 lg:pt-36">
      {/* Top Action Bar */}
      <section className="px-4 sm:px-6 lg:px-10 xl:px-16 pb-6">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-end rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm backdrop-blur">
          <button className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 font-medium text-white transition-transform duration-200 hover:scale-105 hover:bg-gray-900">
            <ShoppingCart size={18} />
            Browse Marketplace
          </button>
        </div>
      </section>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto space-y-10 px-4 sm:px-6 lg:px-8 pb-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Package}
            label="Total Purchases"
            value={purchases.length}
          />
          <StatCard
            icon={CheckCircle}
            label="Completed"
            value={completedCount}
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={pendingCount}
          />
          <StatCard
            icon={TrendingUp}
            label="Total Spent"
            value={formatPrice(totalSpent)}
          />
        </div>

        {/* Purchases Table Section */}
        <section className="rounded-3xl border border-gray-200 bg-white/90 shadow-sm backdrop-blur">
          {/* Section Header with Filters */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                  <Package size={28} className="text-blue-600" />
                  Your Datasets
                </h2>
                <p className="mt-1 text-sm text-gray-600">{filteredPurchases.length} dataset{filteredPurchases.length !== 1 ? 's' : ''} available</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filterStatus === 'all'
                      ? 'bg-black text-white shadow-md'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('completed')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filterStatus === 'completed'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filterStatus === 'pending'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mt-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search datasets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white/80 py-3 pl-11 pr-4 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          {filteredPurchases.length > 0 ? (
            <>
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Dataset</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Seller</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Price</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Size</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Purchased</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPurchases.map((purchase) => (
                        <tr
                          key={purchase.id}
                          onMouseEnter={() => setHoveredRow(purchase.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          className={`transition-colors duration-200 ${hoveredRow === purchase.id ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{purchase.datapod_title}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="inline-block rounded px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100">
                                  {purchase.category}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900">{purchase.seller}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-900">{formatPrice(purchase.price_sui)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">{purchase.fileSize}</span>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={purchase.purchase_status} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar size={14} className="text-gray-400" />
                              {formatDateRelative(purchase.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`flex items-center gap-2 transition-opacity duration-200 ${hoveredRow === purchase.id ? 'opacity-100' : 'opacity-60'}`}>
                              {purchase.purchase_status === 'completed' ? (
                                <>
                                  <button className="rounded-lg p-1.5 text-blue-600 transition hover:bg-blue-100" title="Download">
                                    <Download size={16} />
                                  </button>
                                  <button className="rounded-lg p-1.5 text-gray-600 transition hover:bg-gray-200" title="View Details">
                                    <Eye size={16} />
                                  </button>
                                  <button className="rounded-lg p-1.5 text-gray-600 transition hover:bg-gray-200" title="Share">
                                    <Share2 size={16} />
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs font-medium text-gray-500">Processing...</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-4 p-4 md:hidden">
                {filteredPurchases.map((purchase) => (
                  <div key={purchase.id} className="rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-gray-900">{purchase.datapod_title}</p>
                        <span className="mt-2 inline-flex items-center rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                          {purchase.category}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{formatPrice(purchase.price_sui)}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-500">Seller</span>
                        <span className="font-semibold text-gray-900">{purchase.seller}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-500">Size</span>
                        <span>{purchase.fileSize}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-500">Purchased</span>
                        <span className="flex items-center gap-1 text-gray-700">
                          <Calendar size={14} className="text-gray-400" />
                          {formatDateRelative(purchase.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <StatusBadge status={purchase.purchase_status} />
                      <div className="flex flex-wrap items-center gap-2">
                        {purchase.purchase_status === 'completed' ? (
                          <>
                            <button className="inline-flex items-center gap-1 rounded-lg bg-blue-600/10 px-3 py-1.5 text-sm font-semibold text-blue-600">
                              <Download size={16} />
                              Download
                            </button>
                            <button className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700">
                              <Eye size={16} />
                              View
                            </button>
                            <button className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700">
                              <Share2 size={16} />
                              Share
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-medium text-gray-500">Processing...</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100">
                <ShoppingCart size={32} className="text-blue-400" />
              </div>
              <p className="mb-1 text-lg font-medium text-gray-900">
                {searchQuery ? 'No datasets found' : "You haven't purchased any datasets yet"}
              </p>
              <p className="mb-6 text-sm text-gray-600">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Start exploring our marketplace to find and purchase datasets'}
              </p>
              <button className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 font-medium text-white transition-all duration-200 hover:bg-gray-900">
                <ShoppingCart size={16} />
                Browse Marketplace
              </button>
            </div>
          )}
        </section>

        {/* Quick Insights */}
        {filteredPurchases.length > 0 && (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="group relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                  <p className="mt-1 text-3xl font-bold text-blue-600">
                    {filteredPurchases.reduce((sum, p) => sum + p.downloads, 0)}
                  </p>
                </div>
                <Download size={32} className="text-blue-300" />
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ready to Download</p>
                  <p className="mt-1 text-3xl font-bold text-emerald-600">
                    {filteredPurchases.filter((p) => p.purchase_status === 'completed').length}
                  </p>
                </div>
                <CheckCircle size={32} className="text-emerald-300" />
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}