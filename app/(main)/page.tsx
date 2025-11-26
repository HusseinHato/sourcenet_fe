'use client';

import { useState, useEffect, Suspense } from 'react';
import { Database, Star, Loader2, Filter, ChevronDown, Box, Brain, DollarSign, Heart, Users, ShoppingCart, Leaf } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '../utils/api.client';
import Link from 'next/link';

// Get category-specific icon
const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'ai/ml':
      return Brain;
    case 'finance':
      return DollarSign;
    case 'healthcare':
      return Heart;
    case 'social':
      return Users;
    case 'e-commerce':
      return ShoppingCart;
    case 'climate':
      return Leaf;
    default:
      return Box;
  }
};

// Placeholder pattern
const PlaceholderPattern = ({ category }: { category?: string }) => {
  const IconComponent = getCategoryIcon(category || '');

  return (
    <div className="w-full h-full bg-[#F3F3F3] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.08]"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #353535 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <IconComponent size={32} className="text-[#CECECE]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#F3F3F3] via-transparent to-transparent" />
    </div>
  );
};

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get('page')) || 1;
  const selectedCategory = searchParams.get('category') || 'All';
  const sortBy = searchParams.get('sort') || 'trending';
  const searchQuery = searchParams.get('search') || '';
  const limit = 15;

  const [datapods, setDatapods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async (silent = false) => {
      if (!silent) setLoading(true);
      try {
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
          search: searchQuery,
        });

        const data = response.data;

        if (data && Array.isArray(data.datapods)) {
          const mappedData = data.datapods.map((item: any) => ({
            ...item,
            image: item.image || null,
            creator: item.seller_name || item.seller || { name: 'Unknown Seller' },
            usability: item.usability || 'Standard',
          }));
          setDatapods(mappedData);
          setTotal(data.total_count || data.datapods.length);

          // Debug logging
          console.log('=== PAGINATION DEBUG ===');
          console.log('Page:', page);
          console.log('Limit:', limit);
          console.log('Items received:', mappedData.length);
          console.log('Total count from backend:', data.total_count);
          console.log('Calculated total pages:', Math.ceil((data.total_count || 0) / limit));
        } else {
          setDatapods([]);
          setTotal(0);
        }
      } catch (error) {
        console.error('Failed to fetch datapods:', error);
        setDatapods([]);
      } finally {
        if (!silent) setLoading(false);
      }
    };

    fetchData();

    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      fetchData(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [page, selectedCategory, sortBy, searchQuery]);

  const totalPages = Math.ceil(total / limit);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`/?${params.toString()}`);
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={11}
        className={`${i < Math.floor(rating) ? 'fill-[#353535] text-[#353535]' : 'fill-[#E5E5E5] text-[#E5E5E5]'}`}
      />
    ));
  };

  const getSellerName = (creator: any) => {
    if (typeof creator === 'string') return creator;
    if (creator && creator.name) return creator.name;
    return 'Unknown Seller';
  };

  return (
    // HOMEPAGE SPECIFIC FIX: Override layout.tsx wrapper padding
    // Using negative margin to cancel md:ml-52 from layout.tsx
    // pt-16 reduces gap below navbar, md:pl-[16.5rem] eliminates side gap
    <main className="min-h-screen bg-[#FAFAFA] pt-1 pb-12 px-4 md:px-6 md:-ml-52 md:pl-[17.5rem] transition-all duration-300">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#353535] tracking-tight mb-1">Explore Data</h1>
          <p className="text-sm text-[#919191] font-medium">
            Access <span className="text-[#353535] font-bold">{total}</span> premium datasets.
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="relative group z-20">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-[#E5E5E5] shadow-sm hover:border-[#CECECE] transition-all cursor-pointer">
            <Filter size={13} className="text-[#919191]" />
            <span className="text-[11px] font-bold text-[#919191] uppercase tracking-wider">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => updateParams({ sort: e.target.value, page: '1' })}
              className="bg-transparent text-sm font-bold text-[#353535] outline-none cursor-pointer appearance-none pr-6"
            >
              <option value="trending">Most Relevant</option>
              <option value="rating">Highest Rating</option>
              <option value="price_asc">Lowest Price</option>
              <option value="price_desc">Highest Price</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 text-[#353535] pointer-events-none opacity-70" />
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-32 gap-3 min-h-[50vh]">
          <Loader2 className="animate-spin text-[#353535]" size={32} />
          <p className="text-xs font-medium text-[#919191]">Loading datasets...</p>
        </div>
      ) : (
        <>
          {/* Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {datapods.map((dataPod: any) => {
              const sellerName = getSellerName(dataPod.creator);
              return (
                <Link href={`/datapod/${dataPod.id}`} key={dataPod.id} className="group block h-full outline-none">
                  <article className="relative h-full flex flex-col rounded-2xl bg-white border border-[#EAEAEA] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)] group-hover:border-[#CECECE]/60 overflow-hidden">

                    {/* Image Area */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#F8F8F8] border-b border-[#F0F0F0]">
                      {dataPod.image && (dataPod.image.startsWith('http') || dataPod.image.startsWith('/')) ? (
                        <img
                          src={dataPod.image}
                          alt={dataPod.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <PlaceholderPattern category={dataPod.category} />
                      )}

                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md border border-white/40 text-[10px] font-black text-[#353535] shadow-sm uppercase tracking-wider">
                          {dataPod.category}
                        </span>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex flex-col flex-1 p-5 gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="text-[10px] font-bold text-[#919191]/90 uppercase tracking-wider truncate">
                          {sellerName}
                        </div>
                        <h3 className="text-[15px] font-bold text-[#222222] leading-snug line-clamp-2 group-hover:text-black transition-colors">
                          {dataPod.title}
                        </h3>
                      </div>

                      <div className="mt-auto pt-4 border-t border-[#F5F5F5] flex items-end justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#919191] font-semibold mb-0.5">Price</span>
                          <span className="text-base font-black text-[#353535]">{dataPod.price_sui} <span className="text-xs font-bold">SUI</span></span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-[#FAFAFA] px-2.5 py-1.5 rounded-lg border border-[#F0F0F0]">
                          <div className="flex gap-0.5">{getRatingStars(dataPod.average_rating || 0)}</div>
                          <span className="text-[11px] font-bold text-[#353535] ml-0.5">
                            {(dataPod.average_rating || 0).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12 pb-8">
              <button
                onClick={() => updateParams({ page: String(Math.max(1, page - 1)) })}
                disabled={page === 1}
                className="px-5 py-2.5 rounded-xl border border-[#E5E5E5] bg-white text-xs font-bold text-[#353535] disabled:opacity-40 hover:bg-[#F9F9F9] transition-all"
              >
                Previous
              </button>

              <div className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-xl border border-[#E5E5E5]">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => updateParams({ page: String(pageNum) })}
                      className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${page === pageNum
                        ? 'bg-[#353535] text-white shadow-md'
                        : 'text-[#919191] hover:bg-[#F5F5F5] hover:text-[#353535]'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => updateParams({ page: String(page + 1) })}
                disabled={page === totalPages}
                className="px-5 py-2.5 rounded-xl border border-[#E5E5E5] bg-white text-xs font-bold text-[#353535] disabled:opacity-40 hover:bg-[#F9F9F9] transition-all"
              >
                Next
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && datapods.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-[#E5E5E5] rounded-3xl bg-white/50 mt-4">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <Database size={32} className="text-[#919191]" />
              </div>
              <h3 className="text-lg font-bold text-[#353535] mb-1">No datasets found</h3>
              <p className="text-sm text-[#919191] max-w-md">
                Try adjusting your search filters.
              </p>
              <button
                onClick={() => updateParams({ category: 'All' })}
                className="mt-5 px-6 py-2 bg-[#353535] text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Reset Filters
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      // Padding loader matches main content with negative margin
      <div className="flex justify-center items-center min-h-screen bg-[#FAFAFA] pt-1 md:-ml-52 md:pl-[17.5rem]">
        <Loader2 className="animate-spin text-[#353535]" size={32} />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}