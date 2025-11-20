'use client';

import { useState } from 'react';
import { Database, Star, MoreVertical } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

const DUMMY_DATAPODS = [
  {
    id: 'dp-001',
    datapod_id: 'dp-001',
    title: 'Customer Behavior Analytics',
    description: 'Aggregated customer journeys and purchase patterns.',
    category: 'AI/ML',
    tags: ['analytics', 'behavior'],
    price_sui: 150,
    average_rating: 4.8,
    total_sales: 245,
    status: 'published',
    image: '📊',
    usability: 9.2,
    creator: 'DataPro',
    updated: 'Updated 2 hours ago',
  },
  {
    id: 'dp-002',
    datapod_id: 'dp-002',
    title: 'E-commerce Transaction Data',
    description: 'Detailed transaction logs from leading e-commerce platforms.',
    category: 'E-commerce',
    tags: ['transactions', 'retail'],
    price_sui: 200,
    average_rating: 4.5,
    total_sales: 180,
    status: 'published',
    image: '📈',
    usability: 8.9,
    creator: 'RetailHub',
    updated: 'Updated 1 day ago',
  },
  {
    id: 'dp-003',
    datapod_id: 'dp-003',
    title: 'Social Media Sentiment Analysis',
    description: 'Daily sentiment breakdown across major social platforms.',
    category: 'Social',
    tags: ['sentiment', 'social'],
    price_sui: 120,
    average_rating: 4.9,
    total_sales: 320,
    status: 'published',
    image: '🔍',
    usability: 9.5,
    creator: 'SocialMetrics',
    updated: 'Updated 3 hours ago',
  },
  {
    id: 'dp-004',
    datapod_id: 'dp-004',
    title: 'Healthcare Patient Records',
    description: 'De-identified patient records for research and analysis.',
    category: 'Healthcare',
    tags: ['healthcare', 'records'],
    price_sui: 180,
    average_rating: 4.6,
    total_sales: 210,
    status: 'published',
    image: '🏥',
    usability: 8.7,
    creator: 'MedData',
    updated: 'Updated 5 hours ago',
  },
  {
    id: 'dp-005',
    datapod_id: 'dp-005',
    title: 'Financial Market Data Feed',
    description: 'Intraday pricing and volume data across multiple exchanges.',
    category: 'Finance',
    tags: ['finance', 'markets'],
    price_sui: 160,
    average_rating: 4.7,
    total_sales: 195,
    status: 'published',
    image: '💹',
    usability: 9.1,
    creator: 'FinanceAPI',
    updated: 'Updated 1 day ago',
  },
  {
    id: 'dp-006',
    datapod_id: 'dp-006',
    title: 'Climate & Weather Datasets',
    description: 'Historical and forecast climate metrics worldwide.',
    category: 'Climate',
    tags: ['climate', 'weather'],
    price_sui: 140,
    average_rating: 4.4,
    total_sales: 150,
    status: 'published',
    image: '🌍',
    usability: 8.3,
    creator: 'ClimateMetrics',
    updated: 'Updated 2 days ago',
  },
  {
    id: 'dp-007',
    datapod_id: 'dp-007',
    title: 'Blockchain Transaction Data',
    description: 'Comprehensive on-chain transaction snapshots.',
    category: 'Finance',
    tags: ['blockchain', 'transactions'],
    price_sui: 220,
    average_rating: 4.8,
    total_sales: 280,
    status: 'published',
    image: '⛓️',
    usability: 9.3,
    creator: 'BlockchainHub',
    updated: 'Updated 3 days ago',
  },
  {
    id: 'dp-008',
    datapod_id: 'dp-008',
    title: 'Industry Benchmarks Report',
    description: 'Key performance benchmarks across industries.',
    category: 'AI/ML',
    tags: ['benchmark', 'insights'],
    price_sui: 190,
    average_rating: 4.6,
    total_sales: 220,
    status: 'published',
    image: '📑',
    usability: 8.8,
    creator: 'BenchmarkPro',
    updated: 'Updated 4 days ago',
  },
  {
    id: 'dp-009',
    datapod_id: 'dp-009',
    title: 'Web3 DeFi Protocol Analytics',
    description: 'Real-time DeFi metrics and liquidity pools data.',
    category: 'Finance',
    tags: ['defi', 'web3'],
    price_sui: 250,
    average_rating: 4.9,
    total_sales: 340,
    status: 'published',
    image: '💎',
    usability: 9.4,
    creator: 'DeFiStats',
    updated: 'Updated 6 hours ago',
  },
  {
    id: 'dp-010',
    datapod_id: 'dp-010',
    title: 'NFT Trading Patterns',
    description: 'Comprehensive NFT marketplace transaction analysis.',
    category: 'Finance',
    tags: ['nft', 'trading'],
    price_sui: 180,
    average_rating: 4.7,
    total_sales: 210,
    status: 'published',
    image: '🎨',
    usability: 9.0,
    creator: 'NFTMetrics',
    updated: 'Updated 1 day ago',
  },
  {
    id: 'dp-011',
    datapod_id: 'dp-011',
    title: 'GPUs Specs From 1986 to 2026',
    description: 'Comprehensive GPU specifications through the decades.',
    category: 'AI/ML',
    tags: ['gpu', 'hardware'],
    price_sui: 160,
    average_rating: 4.8,
    total_sales: 320,
    status: 'published',
    image: '🖥️',
    usability: 9.1,
    creator: 'TechSpecs',
    updated: 'Updated 8 hours ago',
  },
  {
    id: 'dp-012',
    datapod_id: 'dp-012',
    title: 'Developer Salary Analytics 2024',
    description: 'Comprehensive salary data across tech sectors.',
    category: 'Social',
    tags: ['salary', 'careers'],
    price_sui: 175,
    average_rating: 4.6,
    total_sales: 265,
    status: 'published',
    image: '💰',
    usability: 8.9,
    creator: 'CareerMetrics',
    updated: 'Updated 12 hours ago',
  },
];

import { Suspense } from 'react';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get('page')) || 1;
  const selectedCategory = searchParams.get('category') || 'All';
  const sortBy = searchParams.get('sort') || 'trending';

  const limit = 12;
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'AI/ML', 'Finance', 'Healthcare', 'Social', 'E-commerce', 'Climate'];

  const searchTerm = searchQuery.trim().toLowerCase();

  const sortedData = DUMMY_DATAPODS
    .filter((item: any) => {
      const name = item.title.toLowerCase();
      const matchesSearch = !searchTerm || name.includes(searchTerm);
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'price_asc') return (a.price_sui ?? 0) - (b.price_sui ?? 0);
      if (sortBy === 'price_desc') return (b.price_sui ?? 0) - (a.price_sui ?? 0);
      if (sortBy === 'rating') return (b.average_rating ?? 0) - (a.average_rating ?? 0);
      if (sortBy === 'trending') return (b.total_sales ?? 0) - (a.total_sales ?? 0);
      return 0;
    });

  const paginatedData = sortedData.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(sortedData.length / limit);

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
            {sortedData.length}
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

      {/* Data Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 lg:gap-6 py-2">
        {paginatedData.map((dataPod: any) => (
          <div
            key={dataPod.id}
            className="group relative h-full overflow-hidden rounded-2xl border border-[#CECECE]/70 bg-white/65 backdrop-blur-2xl shadow-[0_28px_48px_-32px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_42px_70px_-36px_rgba(0,0,0,0.55)]"
          >
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(145,145,145,0.2) 45%, rgba(71,71,71,0.15) 100%)' }} />
            <div className="pointer-events-none absolute inset-px rounded-[18px] border border-white/40 group-hover:border-white/70 transition-colors" />

            <div className="relative z-10 flex h-full flex-col gap-3 p-4">
              <div className="relative">
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-[#F2F2F2] flex items-center justify-center text-3xl transition-transform duration-400 group-hover:scale-[1.03]">
                  {dataPod.image}
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
                {dataPod.creator}
              </p>

              <div style={{ color: '#919191' }} className="space-y-1 text-[11px]">
                <div>
                  Usability{' '}
                  <span style={{ color: '#353535' }} className="font-semibold">
                    {dataPod.usability}
                  </span>
                </div>
                <div className="line-clamp-1">
                  {dataPod.total_sales.toLocaleString()} downloads
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/50 pt-3">
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">{getRatingStars(dataPod.average_rating)}</div>
                  <span style={{ color: '#353535' }} className="text-[11px] font-semibold">
                    {dataPod.average_rating.toFixed(1)}
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
      {paginatedData.length === 0 && (
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