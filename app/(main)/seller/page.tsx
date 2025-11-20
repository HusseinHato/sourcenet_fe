'use client';

import { useState } from 'react';
import {
  Upload,
  TrendingUp,
  DollarSign,
  Star,
  Package,
  Eye,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  Users,
  Search,
  MoreHorizontal,
} from 'lucide-react';

interface DataPod {
  id: string;
  title: string;
  category: string;
  price_sui: number;
  sales: number;
  revenue: number;
  rating: number;
  reviews: number;
  status: 'published' | 'draft';
  views: number;
}

const mockDataPods: DataPod[] = [
  {
    id: 'dp-001',
    title: 'Customer Behavior Analytics',
    category: 'AI/ML',
    price_sui: 150,
    sales: 245,
    revenue: 36750,
    rating: 4.8,
    reviews: 127,
    status: 'published',
    views: 1248,
  },
  {
    id: 'dp-002',
    title: 'E-commerce Transaction Data',
    category: 'E-commerce',
    price_sui: 200,
    sales: 180,
    revenue: 36000,
    rating: 4.5,
    reviews: 89,
    status: 'published',
    views: 923,
  },
  {
    id: 'dp-003',
    title: 'Social Media Sentiment Analysis',
    category: 'Social',
    price_sui: 120,
    sales: 320,
    revenue: 38400,
    rating: 4.9,
    reviews: 156,
    status: 'published',
    views: 1567,
  },
  {
    id: 'dp-004',
    title: 'Financial Market Data Feed',
    category: 'Finance',
    price_sui: 160,
    sales: 195,
    revenue: 31200,
    rating: 4.7,
    reviews: 98,
    status: 'draft',
    views: 0,
  },
];

export default function SellerDashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDataPods = mockDataPods.filter((pod) =>
    pod.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSales = mockDataPods.reduce((sum, pod) => sum + pod.sales, 0);
  const totalRevenue = mockDataPods.reduce((sum, pod) => sum + pod.revenue, 0);
  const avgRating = mockDataPods.reduce((sum, pod) => sum + pod.rating, 0) / mockDataPods.length;
  const activeListings = mockDataPods.filter((pod) => pod.status === 'published').length;

  const getStatusBadge = (status: string) => {
    return status === 'published' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-900 text-white">
        Published
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
        Draft
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
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Seller Hub</h1>
              <p className="text-gray-500 mt-1">Monitor performance and manage your listings</p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm">
              <Plus size={16} />
              Upload New Data
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <BarChart3 className="text-gray-900" size={20} />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +12.5%
              </span>
            </div>
            <p className="text-gray-500 text-sm font-medium">Total Sales</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalSales}</p>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <DollarSign className="text-white" size={20} />
              </div>
              <span className="text-xs font-medium text-green-400 bg-green-900/30 px-2 py-1 rounded-full">
                +8.3%
              </span>
            </div>
            <p className="text-gray-400 text-sm font-medium">Total Revenue</p>
            <p className="text-3xl font-bold text-white mt-1">
              {(totalRevenue / 1000).toFixed(1)}k <span className="text-lg font-normal text-gray-400">SUI</span>
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Star className="text-gray-900" size={20} />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">Average Rating</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{avgRating.toFixed(1)}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Package className="text-gray-900" size={20} />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">Active Listings</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{activeListings}</p>
          </div>
        </div>

        {/* My Data Pods Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900">My Data Pods</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                {mockDataPods.length}
              </span>
            </div>

            {/* Search */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search datasets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Dataset
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDataPods.map((pod) => (
                  <tr key={pod.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{pod.title}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{pod.category}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{pod.price_sui} SUI</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <BarChart3 size={14} className="text-gray-400" />
                          <span className="font-medium">{pod.sales} sales</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <DollarSign size={12} className="text-gray-400" />
                          {pod.revenue.toLocaleString()} SUI revenue
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Star size={14} className="fill-gray-900 text-gray-900" />
                        <span className="font-medium text-gray-900">{pod.rating}</span>
                        <span className="text-xs text-gray-500">({pod.reviews})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(pod.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}