'use client';

import { useEffect, useState } from 'react';
import { Loading } from '@/app/components/common/Loading';
import { ChevronDown, Database, Star, TrendingUp, ShoppingCart, Filter } from 'lucide-react';
import { useMarketplaceStore } from '@/app/store/marketplaceStore';

// Dummy data for when API is not available
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
  },
  {
    id: 'dp-004',
    datapod_id: 'dp-004',
    title: 'Healthcare Patient Records (Anonymized)',
    description: 'De-identified patient records for research and analysis.',
    category: 'Healthcare',
    tags: ['healthcare', 'records'],
    price_sui: 180,
    average_rating: 4.6,
    total_sales: 210,
    status: 'published',
    image: '🏥',
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
  },
];

export default function Home() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const { searchQuery } = useMarketplaceStore();
  const [category, setCategory] = useState<string>();
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'rating'>('newest');
  const [priceMin, setPriceMin] = useState<number>();
  const [priceMax, setPriceMax] = useState<number>();
  const [expandedFilters, setExpandedFilters] = useState<{ [key: string]: boolean }>({
    category: true,
    location: true,
    price: true,
    rating: true,
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Simulating useGetDataPods hook
  const data = { datapods: DUMMY_DATAPODS, total_count: DUMMY_DATAPODS.length };
  const isLoading = false;

  const displayData = data?.datapods && data.datapods.length > 0 ? data : { datapods: DUMMY_DATAPODS, total_count: DUMMY_DATAPODS.length };

  const categories = ['AI/ML', 'Finance', 'Healthcare', 'Social', 'E-commerce', 'Climate'];
  const locations = ['Global', 'Asia', 'Europe', 'Americas', 'Africa'];
  const ratings = [4, 3, 2, 1];

  const toggleFilter = (filterName: string) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const searchTerm = searchQuery.trim().toLowerCase();

  const sortedData = displayData.datapods
    .filter((item: any) => {
      const name = (item.name ?? item.title ?? '').toString().toLowerCase();
      const categoryValue = item.category ?? item.category_name ?? item.categoryName;
      const priceValue = item.price ?? item.price_sui ?? item.priceSui ?? 0;

      const matchesSearch = !searchTerm || name.includes(searchTerm);
      const matchesCategory = !category || categoryValue === category;
      const matchesPrice = (!priceMin || priceValue >= priceMin) && (!priceMax || priceValue <= priceMax);

      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a: any, b: any) => {
      const priceA = a.price ?? a.price_sui ?? a.priceSui ?? 0;
      const priceB = b.price ?? b.price_sui ?? b.priceSui ?? 0;
      const ratingA = a.rating ?? a.average_rating ?? a.averageRating ?? 0;
      const ratingB = b.rating ?? b.average_rating ?? b.averageRating ?? 0;

      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'rating') return ratingB - ratingA;
      return 0;
    });

  const paginatedData = sortedData.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(sortedData.length / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={5}
        className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 sm:px-6 lg:px-10 xl:px-16">
      

      {/* Main Content */}
      <div className="w-full px-0 pt-24 md:pt-28 pb-12">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <aside className={`${mobileFilterOpen ? 'block' : 'hidden'} md:block w-56 lg:w-60 flex-shrink-0`}>
            <div className="border border-gray-200 rounded-xl p-5 sticky top-28 space-y-6 bg-white shadow-sm">
              <div>
                <button
                  onClick={() => toggleFilter('category')}
                  className="flex items-center justify-between w-full font-semibold text-gray-900 mb-4 hover:text-black transition group"
                >
                  <span className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-600 group-hover:text-black" />
                    Category
                  </span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${expandedFilters.category ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedFilters.category && (
                  <div className="space-y-2 pl-2">
                    {categories.map((cat) => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={category === cat}
                          onChange={(e) => {
                            setCategory(e.target.checked ? cat : undefined);
                            setPage(1);
                          }}
                          className="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition">{cat}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => toggleFilter('location')}
                  className="flex items-center justify-between w-full font-semibold text-gray-900 mb-4 hover:text-black transition group"
                >
                  <span className="flex items-center gap-2">
                    <Database size={16} className="text-gray-600 group-hover:text-black" />
                    Region
                  </span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${expandedFilters.location ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedFilters.location && (
                  <div className="space-y-2 pl-2">
                    {locations.map((loc) => (
                      <label key={loc} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer" />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition">{loc}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => toggleFilter('price')}
                  className="flex items-center justify-between w-full font-semibold text-gray-900 mb-4 hover:text-black transition group"
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-gray-600 group-hover:text-black" />
                    Price (SUI)
                  </span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${expandedFilters.price ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedFilters.price && (
                  <div className="space-y-3 pl-2">
                    <div>
                      <label className="text-xs text-gray-600 font-medium block mb-2">Minimum Price</label>
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceMin || ''}
                        onChange={(e) => {
                          setPriceMin(e.target.value ? parseInt(e.target.value) : undefined);
                          setPage(1);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 font-medium block mb-2">Maximum Price</label>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceMax || ''}
                        onChange={(e) => {
                          setPriceMax(e.target.value ? parseInt(e.target.value) : undefined);
                          setPage(1);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => toggleFilter('rating')}
                  className="flex items-center justify-between w-full font-semibold text-gray-900 mb-4 hover:text-black transition group"
                >
                  <span className="flex items-center gap-2">
                    <Star size={16} className="text-gray-600 group-hover:text-black" />
                    Rating
                  </span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${expandedFilters.rating ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedFilters.rating && (
                  <div className="space-y-2 pl-2">
                    {ratings.map((rating) => (
                      <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer" />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition flex items-center gap-1">
                          <span className="flex gap-0.5">
                            {getRatingStars(rating)}
                          </span>
                          <span className="text-xs text-gray-500">and up</span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Right Content - Products */}
          <div className="flex-1">
            {/* Sort & Filter Controls */}
            <div className="flex justify-end mb-8">
              <div className="flex gap-3">
                <button
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                  className="md:hidden px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
                >
                  <Filter size={18} />
                  Filter
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any);
                    setPage(1);
                  }}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 bg-white transition"
                >
                  <option value="newest">Most Relevant</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rating</option>
                </select>
              </div>
            </div>

            {/* Results Info */}
            <div className="mb-8 text-sm text-gray-700 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
              Showing 1 - {Math.min(limit, paginatedData.length)} of {sortedData.length} results {searchQuery && `for "${searchQuery}"`}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-12">
                <Loading size="lg" />
              </div>
            )}

            {/* Data Pods Grid */}
            {paginatedData && paginatedData.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3.5 mb-10">
                  {paginatedData.map((dataPod: any) => {
                    const key = dataPod.id ?? dataPod.datapod_id ?? dataPod.datapodId;
                    const title = dataPod.title ?? dataPod.name ?? 'Untitled Dataset';
                    const categoryLabel = dataPod.category ?? dataPod.category_name ?? dataPod.categoryName ?? 'Uncategorized';
                    const priceRaw = dataPod.price ?? dataPod.price_sui ?? dataPod.priceSui;
                    const priceNumber = typeof priceRaw === 'number' ? priceRaw : Number(priceRaw ?? 0);
                    const priceDisplay = Number.isFinite(priceNumber) ? priceNumber.toLocaleString() : '0';
                    const ratingRaw = dataPod.rating ?? dataPod.average_rating ?? dataPod.averageRating;
                    const ratingValue = typeof ratingRaw === 'number' ? ratingRaw : Number(ratingRaw ?? 0);
                    const reviewsRaw = dataPod.reviews ?? dataPod.review_count ?? dataPod.total_sales ?? dataPod.totalSales;
                    const reviewsValue = typeof reviewsRaw === 'number' ? reviewsRaw : Number(reviewsRaw ?? 0);
                    const imageContent = dataPod.image ?? <Database className="text-gray-400" size={32} />;

                    return (
                      <div
                        key={key}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-gray-300 transition-all duration-300 cursor-pointer group flex flex-col"
                      >
                        <div className="aspect-[5/4] bg-gray-100 rounded-lg flex items-center justify-center text-4xl mb-2.5 group-hover:bg-gray-200 transition-colors">
                          {imageContent}
                        </div>
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[9px] font-semibold rounded-full group-hover:bg-black group-hover:text-white transition-colors">
                            {categoryLabel}
                          </span>
                          <div className="flex items-center gap-0.5 bg-yellow-50 px-1 py-0.5 rounded-full">
                            <div className="flex gap-0.5">{getRatingStars(ratingValue)}</div>
                            <span className="text-[10px] font-semibold text-gray-900">{ratingValue.toFixed(1)}</span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-2 group-hover:text-black">{title}</h3>
                        <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-100">
                          <div>
                            <p className="text-[10px] text-gray-500 mb-1">Price</p>
                            <p className="font-semibold text-sm text-gray-900">SUI {priceDisplay}</p>
                          </div>
                          <button className="p-1.5 bg-black text-white rounded-md hover:bg-gray-900 transition-colors group-hover:shadow">
                            <ShoppingCart size={14} />
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1.5 text-center">{reviewsValue ? `${reviewsValue.toLocaleString()} purchases` : 'New'}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-3 pt-8 border-t border-gray-200">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={!hasPrev}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-medium transition"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition ${
                            page === pageNum
                              ? 'bg-black text-white'
                              : 'border border-gray-300 text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!hasNext}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-medium transition"
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {/* Empty State */}
            {paginatedData && paginatedData.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <Database size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">No datasets found</p>
                <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}