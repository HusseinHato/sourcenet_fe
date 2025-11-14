'use client';

import { useGetMyDataPods, useGetUserStats } from '@/app/hooks/useApi';
import { useUserStore } from '@/app/store/userStore';
import { Loading } from '@/app/components/common/Loading';
import { Button } from '@/app/components/common/Button';
import Link from 'next/link';
import { TrendingUp, FileText, DollarSign, Star } from 'lucide-react';
import { redirect } from 'next/navigation';

const formatRating = (value: unknown) => {
  if (value === null || value === undefined) {
    return '0.0';
  }

  const numeric =
    typeof value === 'number' ? value : Number.parseFloat(String(value).trim());

  return Number.isFinite(numeric) ? numeric.toFixed(1) : '0.0';
};

export default function SellerDashboardPage() {
  const { user } = useUserStore();
  const { data: dataPods, isLoading: isLoadingPods } = useGetMyDataPods();
  const { data: stats, isLoading: isLoadingStats } = useGetUserStats();

  if (!user) {
    return (
      redirect('/login')
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your data listings and earnings</p>
        </div>
        <Link href="/seller/upload">
          <Button size="lg">Upload New Data</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      {isLoadingStats ? (
        <div className="flex justify-center py-12">
          <Loading />
        </div>
      ) : (
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {/* Total Sales */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Sales</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalSales || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-gray-600" size={24} />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalRevenue || 0} SUI</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          {/* Average Rating */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900">{formatRating(stats?.averageRating)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          {/* Data Pods */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Data Pods</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalDataPods || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Data Pods */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">My Data Pods</h2>
        </div>

        {isLoadingPods ? (
          <div className="flex justify-center py-12">
            <Loading />
          </div>
        ) : dataPods && dataPods.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price (SUI)</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sales</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rating</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {dataPods.map((pod: any) => (
                  <tr key={pod.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{pod.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{pod.price_sui || pod.priceSui}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{pod.total_sales || pod.totalSales || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatRating(pod.average_rating ?? pod.averageRating)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${pod.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {pod.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-600 mb-4">No data pods yet. Start by uploading your first dataset.</p>
            <Link href="/seller/upload">
              <Button>Upload Data</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
