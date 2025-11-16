'use client';

import { useState } from 'react';
import type { ComponentType } from 'react';
import { Loading } from '@/app/components/common/Loading';
import { Button } from '@/app/components/common/Button';
import Link from 'next/link';
import { 
  TrendingUp, FileText, DollarSign, Star, Upload, MoreVertical, 
  Eye, Edit, Trash2, ChevronRight, ArrowUpRight, Users, Activity,
  Calendar, Search
} from 'lucide-react';

const formatRating = (value: unknown) => {
  if (value === null || value === undefined) {
    return '0.0';
  }

  const numeric =
    typeof value === 'number' ? value : Number.parseFloat(String(value).trim());

  return Number.isFinite(numeric) ? numeric.toFixed(1) : '0.0';
};

type SellerDataPodStatus = 'published' | 'draft';

type SellerDataPod = {
  id: string;
  title: string;
  price_sui: number;
  total_sales: number;
  average_rating: number;
  status: SellerDataPodStatus;
  revenue: number;
  downloads: number;
  views: number;
};

// Mock data
const mockStats = {
  totalSales: 1248,
  totalRevenue: 24960,
  averageRating: 4.7,
  totalDataPods: 12,
  monthlyGrowth: 12.5,
  activeListings: 8,
};

const mockDataPods: SellerDataPod[] = [
  {
    id: 'dp-001',
    title: 'Customer Behavior Analytics',
    price_sui: 150,
    total_sales: 245,
    average_rating: 4.8,
    status: 'published',
    revenue: 36750,
    downloads: 245,
    views: 1248,
  },
  {
    id: 'dp-002',
    title: 'E-commerce Transaction Data',
    price_sui: 200,
    total_sales: 180,
    average_rating: 4.5,
    status: 'published',
    revenue: 36000,
    downloads: 180,
    views: 920,
  },
  {
    id: 'dp-003',
    title: 'Social Media Sentiment Analysis',
    price_sui: 120,
    total_sales: 320,
    average_rating: 4.9,
    status: 'published',
    revenue: 38400,
    downloads: 320,
    views: 1856,
  },
  {
    id: 'dp-004',
    title: 'Healthcare Patient Records',
    price_sui: 180,
    total_sales: 210,
    average_rating: 4.6,
    status: 'published',
    revenue: 37800,
    downloads: 210,
    views: 1125,
  },
  {
    id: 'dp-005',
    title: 'Financial Market Data Feed',
    price_sui: 160,
    total_sales: 195,
    average_rating: 4.7,
    status: 'draft',
    revenue: 31200,
    downloads: 195,
    views: 856,
  },
];

type IconComponent = ComponentType<{ className?: string; size?: number }>;

type StatCardProps = {
  icon: IconComponent;
  label: string;
  value: number | string;
  subValue?: string;
  iconBgColor: string;
};

const StatCard = ({ icon: Icon, label, value, subValue, iconBgColor }: StatCardProps) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
        <p className="text-3xl lg:text-4xl font-bold text-gray-900">{value}</p>
        {subValue && <p className="text-xs text-green-600 font-semibold mt-2 flex items-center gap-1"><ArrowUpRight size={14} /> {subValue}</p>}
      </div>
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgColor}`}>
        <Icon className="text-gray-700" size={24} />
      </div>
    </div>
  </div>
);

type StatusBadgeProps = {
  status: SellerDataPodStatus;
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1";
  if (status === 'published') {
    return <span className={`${baseClasses} bg-emerald-100 text-emerald-800`}><span className="w-2 h-2 bg-emerald-600 rounded-full"></span> Published</span>;
  }
  return <span className={`${baseClasses} bg-amber-100 text-amber-800`}><span className="w-2 h-2 bg-amber-600 rounded-full"></span> Draft</span>;
};

const getRatingStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={14}
      className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
    />
  ));
};

export default function SellerDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [isLoadingStats] = useState(false);
  const [isLoadingPods] = useState(false);

  const stats = mockStats;
  const dataPods: SellerDataPod[] = mockDataPods;

  const filteredPods = dataPods.filter((pod) =>
    pod.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 via-white to-white pt-32 pb-12 sm:pt-36">
      {/* Header */}
      <header className="sticky top-[7.5rem] z-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/80 backdrop-blur-2xl shadow-[0_28px_70px_-45px_rgba(34,34,34,0.45)] px-6 py-6 sm:px-8">
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-slate-100/60" aria-hidden />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-gray-500 mb-2">Seller Hub</p>
                <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">Dashboard Insights</h1>
                <p className="text-sm text-gray-600 mt-3 max-w-xl">
                  Manage your listings, monitor performance, and keep your storefront aligned with SourceNet’s premium experience.
                </p>
              </div>
              <Link href="/seller/upload" className="inline-flex">
                <Button
                  size="lg"
                  className="flex items-center gap-2 bg-gray-900 text-white hover:bg-gray-800 px-6 py-3 rounded-2xl shadow-[0_18px_36px_-20px_rgba(34,34,34,0.55)]"
                >
                  <Upload size={18} />
                  Upload New Data
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Stats Grid */}
        {isLoadingStats ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard
              icon={TrendingUp}
              label="Total Sales"
              value={stats?.totalSales || 0}
              subValue="+12.5% this month"
              iconBgColor="bg-blue-100"
            />
            <StatCard
              icon={DollarSign}
              label="Total Revenue"
              value={`${(stats?.totalRevenue || 0).toLocaleString()} SUI`}
              subValue="Last 30 days"
              iconBgColor="bg-emerald-100"
            />
            <StatCard
              icon={Star}
              label="Average Rating"
              value={formatRating(stats?.averageRating)}
              subValue="From all reviews"
              iconBgColor="bg-amber-100"
            />
            <StatCard
              icon={FileText}
              label="Data Pods"
              value={stats?.totalDataPods || 0}
              subValue={`${stats?.activeListings || 0} active`}
              iconBgColor="bg-purple-100"
            />
            <StatCard
              icon={Activity}
              label="Active Listings"
              value={stats?.activeListings || 0}
              subValue="Ready to sell"
              iconBgColor="bg-indigo-100"
            />
          </div>
        )}

        {/* My Data Pods Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Section Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={28} className="text-gray-600" />
                  My Data Pods
                </h2>
                <p className="text-sm text-gray-600 mt-1">{dataPods.length} datasets available</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search your datasets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm transition"
              />
            </div>
          </div>

          {/* Table */}
          {isLoadingPods ? (
            <div className="flex justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : filteredPods && filteredPods.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Dataset</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Sales</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPods.map((pod) => (
                    <tr 
                      key={pod.id}
                      onMouseEnter={() => setHoveredRow(pod.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className={`transition-colors duration-200 ${hoveredRow === pod.id ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{pod.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{pod.views} views</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">{pod.price_sui} SUI</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users size={14} className="text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{pod.downloads}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-emerald-600">{pod.revenue.toLocaleString()} SUI</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">{getRatingStars(pod.average_rating)}</div>
                          <span className="text-sm font-medium text-gray-900">{formatRating(pod.average_rating)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={pod.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 transition-opacity duration-200 ${hoveredRow === pod.id ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                          <button className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition group" title="View">
                            <Eye size={16} />
                          </button>
                          <button className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 transition" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button className="p-1.5 hover:bg-red-100 rounded-lg text-red-600 transition" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-xl mb-4">
                <FileText size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium text-lg mb-1">No datasets found</p>
              <p className="text-gray-600 text-sm mb-6">
                {searchQuery 
                  ? 'Try adjusting your search query' 
                  : 'Start by uploading your first dataset to begin selling'}
              </p>
              <Link href="/seller/upload">
                <Button className="inline-flex items-center gap-2 bg-black hover:bg-gray-900 text-white">
                  <Upload size={16} />
                  Upload Data
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Stats Footer */}
        {filteredPods.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-600 font-medium mb-1">Total Downloads</p>
              <p className="text-2xl font-bold text-gray-900">{filteredPods.reduce((sum, pod) => sum + pod.downloads, 0).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-600 font-medium mb-1">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{filteredPods.reduce((sum, pod) => sum + pod.views, 0).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-600 font-medium mb-1">Average Rating</p>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">{getRatingStars(4.7)}</div>
                <p className="text-2xl font-bold text-gray-900">4.7</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}