'use client';

import { useGetMyPurchases } from '@/app/hooks/useApi';
import { useUserStore } from '@/app/store/userStore';
import { Loading } from '@/app/components/common/Loading';
import { Button } from '@/app/components/common/Button';
import Link from 'next/link';
import { ShoppingCart, Download } from 'lucide-react';
import { formatPrice, formatDateRelative } from '@/app/utils/format.utils';

export default function BuyerDashboardPage() {
  const { user } = useUserStore();
  const { data: purchases, isLoading } = useGetMyPurchases();

  if (!user) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to access your purchases</p>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">My Purchases</h1>
          <p className="text-gray-600 mt-2">View and manage your purchased datasets</p>
        </div>
        <Link href="/marketplace">
          <Button size="lg">Browse Marketplace</Button>
        </Link>
      </div>

      {/* Purchases List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading />
          </div>
        ) : purchases && purchases.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Dataset</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Purchased</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {purchases.items.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">Dataset #{purchase.dataPodId.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatPrice(purchase.price)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          purchase.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : purchase.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDateRelative(purchase.createdAt)}</td>
                    <td className="px-6 py-4 text-sm">
                      {purchase.status === 'completed' && (
                        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                          <Download size={16} />
                          Download
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-600 mb-4">You haven't purchased any datasets yet.</p>
            <Link href="/marketplace">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
