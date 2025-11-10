'use client';

import { useState, useEffect } from 'react';
import { useGetDataPods } from '@/app/hooks/useApi';
import { useMarketplaceStore } from '@/app/store/marketplaceStore';
import { DataPodCard } from '@/app/components/marketplace/DataPodCard';
import { Loading } from '@/app/components/common/Loading';
import { Search } from 'lucide-react';

export default function MarketplacePage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>();
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'rating'>('newest');
  const [priceMin, setPriceMin] = useState<number>();
  const [priceMax, setPriceMax] = useState<number>();

  const { data, isLoading, error } = useGetDataPods(page, limit, {
    search: searchQuery,
    category,
    sort_by: sortBy,
    price_min: priceMin,
    price_max: priceMax,
  });

  const { setDataPods, setTotalCount } = useMarketplaceStore();

  // Update store when data changes - use useEffect to prevent infinite loop
  useEffect(() => {
    if (data && data.datapods) {
      setDataPods(data.datapods);
      setTotalCount(data.total_count);
    }
  }, [data, setDataPods, setTotalCount]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Marketplace</h1>
        <p className="text-gray-600 text-lg">Browse and purchase datasets from verified sellers</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Failed to load datasets. Please try again later.
        </div>
      )}

      {/* Data Pods Grid */}
      {!isLoading && data && data.datapods && data.datapods.length > 0 && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {data.datapods.map((dataPod: any) => (
              <DataPodCard key={dataPod.id} dataPod={dataPod} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || data.has_prev === false}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600">
              Page {data.page} of {Math.ceil(data.total_count / limit)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!data.has_next}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && data && (!data.datapods || data.datapods.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No datasets found. Try adjusting your search.</p>
        </div>
      )}
    </main>
  );
}
