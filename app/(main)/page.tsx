'use client';

import { useState, useEffect, Suspense } from 'react';
import { Database, Star, MoreVertical, Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '../utils/api.client';
import Link from 'next/link';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get('page')) || 1;
  const selectedCategory = searchParams.get('category') || 'All';
  const sortBy = searchParams.get('sort') || 'trending';
  const limit = 12;

  const [datapods, setDatapods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const categories = ['All', 'AI/ML', 'Finance', 'Healthcare', 'Social', 'E-commerce', 'Climate'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Map frontend sort options to API sort options
        let apiSort: 'newest' | 'price_asc' | 'price_desc' | 'rating' | undefined;
        if (sortBy === 'trending') apiSort = 'newest';
        else if (sortBy === 'rating') apiSort = 'rating';
        else if (sortBy === 'price_asc') apiSort = 'price_asc';
        else if (sortBy === 'price_desc') apiSort = 'price_desc';

        const response = await api.getDataPods({
          page,
          limit,
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          sort_by: apiSort,
        });

        const data = response.data;
        console.log("Data:", data);

        if (data && Array.isArray(data.datapods)) {
          const mappedData = data.datapods.map((item: any) => ({
            ...item,
            image: item.image || '📦', // Default placeholder
            creator: item.seller_name || item.seller || 'Unknown',
            usability: item.usability || 'Standard',
          }));
          setDatapods(mappedData);
          setTotal(data.total_count || data.datapods.length);
        } else {
          setDatapods([]);
          setTotal(0);
        }

      } catch (error) {
        console.error('Failed to fetch datapods:', error);
        setDatapods([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, selectedCategory, sortBy]);


  const totalPages = Math.ceil(total / limit);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/?${params.toString()}`);
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        style={{
          fill: i < Math.floor(rating) ? '#DAA520' : '#919191',
          stroke: i < Math.floor(rating) ? '#DAA520' : '#919191',
        }}
      />
    ));
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b" style={{ borderColor: '#CECECE' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => updateParams({ category: cat, page: '1' })}
            style={{
              backgroundColor: selectedCategory === cat ? '#353535' : '#FFFFFF',
              color: selectedCategory === cat ? '#FFFFFF' : '#474747',
              border: `1px solid ${selectedCategory === cat ? '#353535' : '#CECECE'}`,
            }}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-80"
          >
            {cat === 'All' ? 'All datasets' : cat}
          </button>
        ))}
      </div>

      {/* Results & Sort */}
      <div className="flex justify-between items-center mb-6 pb-3 border-b" style={{ borderColor: '#CECECE' }}>
        <p style={{ color: '#474747' }} className="text-xs">
          <span style={{ color: '#353535' }} className="font-semibold">
            {total}
          </span>
          {' '}datasets
        </p>
        <div className="flex items-center gap-2">
          <span style={{ color: '#919191' }} className="text-xs">
            Sort
          </span>
          <select
            value={sortBy}
            onChange={(e) => updateParams({ sort: e.target.value, page: '1' })}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#353535',
              border: '1px solid #CECECE',
            }}
            className="px-2 py-1 rounded text-xs font-medium outline-none"
          >
            <option value="trending">Most Relevant</option>
            <option value="rating">Highest Rating</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-gray-500" size={32} />
        </div>
      ) : (
        <>
          {/* Data Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 lg:gap-6 py-2">
            {datapods.map((dataPod: any) => (
              <Link href={`/datapod/${dataPod.id}`} key={dataPod.id}>
                <div
                  className="group relative h-full overflow-hidden rounded-2xl border border-[#CECECE]/70 bg-white/65 backdrop-blur-2xl shadow-[0_28px_48px_-32px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_42px_70px_-36px_rgba(0,0,0,0.55)]"
                >
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(145,145,145,0.2) 45%, rgba(71,71,71,0.15) 100%)' }} />
                  <div className="pointer-events-none absolute inset-px rounded-[18px] border border-white/40 group-hover:border-white/70 transition-colors" />

                  <div className="relative z-10 flex h-full flex-col gap-3 p-4">
                    <div className="relative">
                      <div className="aspect-square w-full overflow-hidden rounded-xl bg-[#F2F2F2] flex items-center justify-center text-3xl transition-transform duration-400 group-hover:scale-[1.03]">
                        {dataPod.image && (dataPod.image.startsWith('http') || dataPod.image.startsWith('/')) ? (
                          <img src={dataPod.image} alt={dataPod.title} className="w-full h-full object-cover" />
                        ) : (
                          dataPod.image
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-full bg-[#474747] px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-[0_6px_18px_-12px_rgba(0,0,0,0.45)]">
                        {dataPod.category}
                      </span>
                      <button
                        className="rounded-full p-1.5 text-[#919191] transition-colors duration-200 hover:bg-white/70 hover:text-[#474747]"
                        aria-label="More options"
                      >
                        <MoreVertical size={12} />
                      </button>
                    </div>

                    <h3 style={{ color: '#353535' }} className="line-clamp-2 text-sm font-semibold leading-snug">
                      {dataPod.title}
                    </h3>

                    <p style={{ color: '#919191' }} className="text-[11px] font-medium tracking-wide line-clamp-1">
                      {dataPod.creator?.name || dataPod.creator || 'Unknown'}
                    </p>

                    <div style={{ color: '#919191' }} className="space-y-1 text-[11px]">
                      <div>
                        Usability{' '}
                        <span style={{ color: '#353535' }} className="font-semibold">
                          {dataPod.usability || 'N/A'}
                        </span>
                      </div>
                      <div className="line-clamp-1">
                        {(dataPod.total_sales || 0).toLocaleString()} downloads
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/50 pt-3">
                      <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">{getRatingStars(dataPod.average_rating || 0)}</div>
                        <span style={{ color: '#353535' }} className="text-[11px] font-semibold">
                          {(dataPod.average_rating || 0).toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <p style={{ color: '#353535' }} className="text-sm font-bold">
                          {dataPod.price_sui} SUI
                        </p>
                        <button
                          className="relative overflow-hidden rounded-full px-4 py-1.5 text-[11px] font-semibold text-white transition-transform duration-200 hover:scale-105"
                        >
                          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#353535] to-[#000000]" />
                          <span className="relative z-10">Buy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => updateParams({ page: String(Math.max(1, page - 1)) })}
                disabled={page === 1}
                style={{
                  backgroundColor: page === 1 ? '#F0F0F0' : '#FFFFFF',
                  color: '#353535',
                  border: `1px solid ${page === 1 ? '#CECECE' : '#919191'}`,
                }}
                className="px-4 py-2 rounded font-medium text-sm transition disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => updateParams({ page: String(pageNum) })}
                      style={{
                        backgroundColor: page === pageNum ? '#353535' : '#FFFFFF',
                        color: page === pageNum ? '#FFFFFF' : '#353535',
                        border: `1px solid ${page === pageNum ? '#353535' : '#CECECE'}`,
                      }}
                      className="w-9 h-9 rounded font-medium text-sm transition hover:opacity-80"
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => updateParams({ page: String(page + 1) })}
                disabled={page === totalPages}
                style={{
                  backgroundColor: page === totalPages ? '#F0F0F0' : '#FFFFFF',
                  color: '#353535',
                  border: `1px solid ${page === totalPages ? '#CECECE' : '#919191'}`,
                }}
                className="px-4 py-2 rounded font-medium text-sm transition disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && datapods.length === 0 && (
            <div className="text-center py-16">
              <Database size={48} style={{ color: '#CECECE' }} className="mx-auto mb-4" />
              <p style={{ color: '#353535' }} className="text-lg font-semibold mb-2">
                No datasets found
              </p>
              <p style={{ color: '#919191' }} className="text-sm">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}