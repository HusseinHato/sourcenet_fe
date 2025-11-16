'use client';

import { useState } from 'react';
import {
  Star,
  Download,
  Share2,
  Eye,
  Database,
  Calendar,
  User,
  FileText,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  ShoppingCart,
  Info,
  CheckCircle,
} from 'lucide-react';

type ReviewRating = 1 | 2 | 3 | 4 | 5;

interface DatasetDetail {
  id: string;
  title: string;
  description: string;
  seller: string;
  price: number;
  category: string;
  fileSize: string;
  records: number;
  updateFrequency: string;
  createdAt: string;
  downloads: number;
  rating: number;
  reviews: number;
  tags: string[];
  features: string[];
}

interface Review {
  id: string;
  buyer: string;
  rating: ReviewRating;
  title: string;
  comment: string;
  date: string;
  helpful: number;
}

const mockDataset: DatasetDetail = {
  id: 'd-001',
  title: 'Customer Behavior Analytics',
  description:
    'Comprehensive dataset containing detailed customer behavior patterns, purchase history, and engagement metrics. Perfect for machine learning models, business intelligence, and market analysis.',
  seller: 'DataVault Pro',
  price: 150,
  category: 'AI/ML',
  fileSize: '2.5 GB',
  records: 1000000,
  updateFrequency: 'Weekly',
  createdAt: '2024-01-15',
  downloads: 2450,
  rating: 4.8,
  reviews: 127,
  tags: ['customer-data', 'behavior', 'analytics', 'ecommerce', 'ml-ready'],
  features: [
    'Customer Demographics',
    'Purchase History',
    'Engagement Metrics',
    'Behavioral Patterns',
    'Geographic Data',
    'Temporal Analysis',
  ],
};

const mockReviews: Review[] = [
  {
    id: 'r-001',
    buyer: 'John Doe',
    rating: 5,
    title: 'Excellent Data Quality',
    comment: 'The dataset provided was comprehensive and well-organized. Highly recommend for ML projects.',
    date: '2024-11-10',
    helpful: 24,
  },
  {
    id: 'r-002',
    buyer: 'Sarah Smith',
    rating: 5,
    title: 'Fast Delivery & Great Support',
    comment: 'Delivered on time with excellent documentation. Very responsive seller.',
    date: '2024-11-08',
    helpful: 18,
  },
  {
    id: 'r-003',
    buyer: 'Mike Johnson',
    rating: 4,
    title: 'Good Data, Minor Issues',
    comment: 'Overall good quality. Had a small formatting issue but seller fixed it quickly.',
    date: '2024-11-05',
    helpful: 12,
  },
];

const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => (
  <div className="flex gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={size}
        className={i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
      />
    ))}
  </div>
);

export default function DataDetailPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');

  const sortedReviews = [...mockReviews].sort((a, b) =>
    sortBy === 'helpful' ? b.helpful - a.helpful : new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-white via-gray-50 to-white pt-28 sm:pt-32 lg:pt-36">
      <div className="relative z-10 px-4 sm:px-6 lg:px-10 xl:px-16 pb-12">
        <div className="mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-sm text-gray-600">
            <a href="/marketplace" className="hover:text-blue-600 transition">
              Marketplace
            </a>
            <span>/</span>
            <a href="/marketplace?category=ai-ml" className="hover:text-blue-600 transition">
              {mockDataset.category}
            </a>
            <span>/</span>
            <span className="text-gray-900 font-medium">{mockDataset.title}</span>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Dataset Info */}
            <div className="lg:col-span-2">
              {/* Header */}
              <div className="mb-8">
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                    {mockDataset.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <StarRating rating={mockDataset.rating} size={18} />
                    <span className="ml-2 text-sm font-semibold text-gray-900">
                      {mockDataset.rating} ({mockDataset.reviews} reviews)
                    </span>
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{mockDataset.title}</h1>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">{mockDataset.description}</p>

                {/* Seller Info */}
                <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <User size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Seller</p>
                    <p className="font-semibold text-gray-900">{mockDataset.seller}</p>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Dataset Features</h2>
                <div className="grid grid-cols-2 gap-3">
                  {mockDataset.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white/80 p-4 transition hover:border-blue-300 hover:bg-blue-50/50"
                    >
                      <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {mockDataset.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="mb-8">
                <div className="flex gap-4 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-4 font-semibold transition ${
                      activeTab === 'overview'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-4 font-semibold transition ${
                      activeTab === 'reviews'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Reviews ({mockDataset.reviews})
                  </button>
                </div>

                {/* Tab Content */}
                <div className="mt-8">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border border-gray-200 bg-white/80 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Database size={18} className="text-blue-600" />
                            <p className="text-sm text-gray-600">File Size</p>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{mockDataset.fileSize}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white/80 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText size={18} className="text-blue-600" />
                            <p className="text-sm text-gray-600">Records</p>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{mockDataset.records.toLocaleString()}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white/80 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar size={18} className="text-blue-600" />
                            <p className="text-sm text-gray-600">Update Frequency</p>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{mockDataset.updateFrequency}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white/80 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Download size={18} className="text-blue-600" />
                            <p className="text-sm text-gray-600">Downloads</p>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{mockDataset.downloads.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="space-y-4">
                      {/* Sort */}
                      <div className="flex justify-end mb-4">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as 'recent' | 'helpful')}
                          className="rounded-lg border border-gray-300 bg-white/80 py-2 px-3 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                        >
                          <option value="recent">Most Recent</option>
                          <option value="helpful">Most Helpful</option>
                        </select>
                      </div>

                      {/* Reviews List */}
                      {sortedReviews.map((review) => (
                        <div
                          key={review.id}
                          className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-6 shadow-sm transition-all duration-300 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                <User size={20} className="text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{review.buyer}</p>
                                <p className="text-xs text-gray-600">
                                  {new Date(review.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </p>
                              </div>
                            </div>
                            <StarRating rating={review.rating} />
                          </div>

                          <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                          <p className="text-gray-700 text-sm mb-4">{review.comment}</p>

                          <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                            <button className="flex items-center gap-2 text-sm text-gray-600 transition hover:text-blue-600">
                              <ThumbsUp size={16} />
                              <span>Helpful ({review.helpful})</span>
                            </button>
                            <button className="flex items-center gap-2 text-sm text-gray-600 transition hover:text-blue-600">
                              <MessageSquare size={16} />
                              <span>Reply</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Purchase Card */}
            <div className="lg:col-span-1">
              <div className="rounded-3xl border border-gray-200 bg-white/90 backdrop-blur p-8 shadow-sm sticky top-32 space-y-6">
                {/* Price */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">{mockDataset.price}</span>
                    <span className="text-lg text-gray-600">SUI</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3 py-6 border-y border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <TrendingUp size={18} />
                      <span className="text-sm">Downloads</span>
                    </div>
                    <span className="font-semibold text-gray-900">{mockDataset.downloads}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={18} />
                      <span className="text-sm">Created</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {new Date(mockDataset.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white transition hover:bg-blue-700 active:scale-95">
                    <ShoppingCart size={18} />
                    Purchase Dataset
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3.5 font-semibold text-gray-900 transition hover:bg-gray-50">
                    <Eye size={18} />
                    Preview
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3.5 font-semibold text-gray-900 transition hover:bg-gray-50">
                    <Share2 size={18} />
                    Share
                  </button>
                </div>

                {/* Info Box */}
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <div className="flex gap-3">
                    <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Secure Purchase</p>
                      <p className="text-xs text-blue-800">All transactions are secured by Sui blockchain technology</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
