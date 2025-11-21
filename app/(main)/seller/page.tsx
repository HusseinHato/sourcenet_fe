'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Loader2,
} from 'lucide-react';
import { api, getAuthToken } from '../../utils/api.client';
import { UploadDataPodModal } from '../../components/seller/UploadDataPodModal';
import { useUserStore } from '../store/userStore';

interface DataPod {
  id: string;
  title: string;
  category: string;
  price_sui: number;
  sales: number;
  revenue: number;
  rating: number;
  reviews: number;
  status: 'active' | 'inactive';
  views: number;
}

interface SellerStats {
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  activeListings: number;
}

export default function SellerDashboard() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dataPods, setDataPods] = useState<DataPod[]>([]);
  const [stats, setStats] = useState<SellerStats>({
    totalSales: 0,
    totalRevenue: 0,
    averageRating: 0,
    activeListings: 0,
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [podsResponse, statsResponse] = await Promise.all([
        api.getSellerDataPods(),
        api.getSellerStats(),
      ]);

      // Transform API response to match UI interface
      // API returns: { status, count, datapods: [...] }
      const pods = podsResponse.data.datapods || podsResponse.data.data || [];
      setDataPods(pods.map((pod: any) => ({
        id: pod.datapodId || pod.id,
        title: pod.title,
        category: pod.category,
        price_sui: parseFloat(pod.priceSui || pod.price_sui || '0'),
        sales: parseInt(pod.totalSales || pod.sales || '0'),
        revenue: parseFloat(pod.priceSui || pod.price_sui || '0') * parseInt(pod.totalSales || pod.sales || '0'),
        rating: parseFloat(pod.averageRating || '0'),
        reviews: parseInt(pod.reviewsCount || '0'),
        status: pod.status || 'draft',
        views: parseInt(pod.views || '0'),
      })));

      // Get stats from response or calculate from pods
      const statsData = statsResponse.data.data || statsResponse.data || {};
      const totalSalesCount = pods.reduce((sum: number, pod: any) => sum + parseInt(pod.totalSales || 0), 0);
      const totalRevenueAmount = pods.reduce((sum: number, pod: any) => sum + (parseFloat(pod.priceSui || 0) * parseInt(pod.totalSales || 0)), 0);
      
      setStats({
        totalSales: statsData.totalSales !== undefined ? statsData.totalSales : totalSalesCount,
        totalRevenue: statsData.totalRevenue !== undefined ? statsData.totalRevenue : totalRevenueAmount,
        averageRating: statsData.averageRating || 0,
        activeListings: statsData.totalDataPods !== undefined ? statsData.totalDataPods : pods.length,
      });

    } catch (error) {
      console.error('Failed to fetch seller data:', error);
      // Fallback to empty or error state
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Wait for auth persistence to finish loading
    if (isAuthLoading) {
      return;
    }

    // Check if user is authenticated after loading is complete
    const token = getAuthToken();
    if (!token || !user) {
      console.warn('No auth token or user found, redirecting to login');
      router.push('/login');
      return;
    }

    fetchData();
  }, [router, isAuthLoading, user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this data pod? This action cannot be undone.')) return;

    try {
      await api.deleteDataPod(id);
      // Optimistically remove from UI or refresh
      setDataPods((prev) => prev.filter((pod) => pod.id !== id));
      // Also refresh stats if needed, but for now just removing from list is good feedback
      fetchData();
    } catch (error) {
      console.error('Failed to delete data pod:', error);
      alert('Failed to delete data pod. Please try again.');
    }
  };

  const handleEdit = (id: string) => {
    alert('Edit functionality coming soon!');
  };

  const filteredDataPods = dataPods.filter((pod) =>
    pod.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    return status === 'published' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: '#474747' }}>
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
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium shadow-sm"
              style={{ backgroundColor: '#474747' }}
            >
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
                <BarChart3 className="text-[#474747]" size={20} />
              </div>
              {/* <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +12.5%
              </span> */}
            </div>
            <p className="text-gray-500 text-sm font-medium">Total Sales</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{isLoading ? '-' : stats.totalSales}</p>
          </div>

          <div className="p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: '#474747', borderColor: '#474747' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <DollarSign className="text-white" size={20} />
              </div>
              {/* <span className="text-xs font-medium text-green-400 bg-green-900/30 px-2 py-1 rounded-full">
                +8.3%
              </span> */}
            </div>
            <p className="text-gray-400 text-sm font-medium">Total Revenue</p>
            <p className="text-3xl font-bold text-white mt-1">
              {isLoading ? '-' : `${(stats.totalRevenue).toLocaleString()} SUI`}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Star className="text-[#474747]" size={20} />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">Average Rating</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{isLoading ? '-' : stats.averageRating.toFixed(1)}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Package className="text-[#474747]" size={20} />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">Active Listings</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{isLoading ? '-' : stats.activeListings}</p>
          </div>
        </div>

        {/* My Data Pods Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900">My Data Pods</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                {dataPods.length}
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
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ '--tw-ring-color': '#474747' } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="animate-spin text-gray-400" size={32} />
              </div>
            ) : (
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
                  {filteredDataPods.length > 0 ? (
                    filteredDataPods.map((pod) => (
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
                            <Star size={14} className="fill-[#474747] text-[#474747]" />
                            <span className="font-medium text-gray-900">{pod.rating}</span>
                            <span className="text-xs text-gray-500">({pod.reviews})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(pod.status)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(pod.id)}
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(pod.id)}
                              className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No data pods found. Upload your first dataset!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <UploadDataPodModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          fetchData();
        }}
      />
    </main>
  );
}