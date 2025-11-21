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
  ChevronRight,
  ShieldCheck,
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
    'Comprehensive dataset containing detailed customer behavior patterns, purchase history, and engagement metrics. Perfect for machine learning models, business intelligence, and market analysis. This dataset includes over 1 million records of anonymized user interactions across multiple touchpoints.',
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
        className={i < Math.floor(rating) ? 'fill-[#474747] text-[#474747]' : 'fill-gray-200 text-gray-200'}
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
    <main className="min-h-screen bg-[#FAFAFA] pb-12">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <a href="/" className="hover:text-gray-900 transition-colors">
              Marketplace
            </a>
            <ChevronRight size={14} />
            <a href={`/?category=${mockDataset.category}`} className="hover:text-gray-900 transition-colors">
              {mockDataset.category}
            </a>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium truncate">{mockDataset.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {mockDataset.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-sm">
                      <StarRating rating={mockDataset.rating} size={14} />
                      <span className="font-medium text-gray-900">{mockDataset.rating}</span>
                      <span className="text-gray-500">({mockDataset.reviews} reviews)</span>
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{mockDataset.title}</h1>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User size={16} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Seller</p>
                      <p className="text-sm font-semibold text-gray-900">{mockDataset.seller}</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-8">{mockDataset.description}</p>

              {/* Key Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">File Size</p>
                  <div className="flex items-center gap-2">
                    <Database size={16} className="text-gray-400" />
                    <span className="font-semibold text-gray-900">{mockDataset.fileSize}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Records</p>
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-400" />
                    <span className="font-semibold text-gray-900">{mockDataset.records.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Updates</p>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="font-semibold text-gray-900">{mockDataset.updateFrequency}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Downloads</p>
                  <div className="flex items-center gap-2">
                    <Download size={16} className="text-gray-400" />
                    <span className="font-semibold text-gray-900">{mockDataset.downloads.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-6 flex flex-wrap gap-2">
                {mockDataset.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-3 py-1 rounded-lg bg-gray-50 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Features Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Dataset Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockDataset.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <CheckCircle size={18} className="text-[#474747] flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recent' | 'helpful')}
                  className="text-sm border-none bg-gray-50 rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer text-gray-600 font-medium"
                >
                  <option value="recent">Most Recent</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              </div>

              <div className="space-y-6">
                {sortedReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{review.buyer}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {new Date(review.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <StarRating rating={review.rating} size={14} />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">{review.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{review.comment}</p>
                    <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors">
                      <ThumbsUp size={14} />
                      Helpful ({review.helpful})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg shadow-gray-100/50">
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Total Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">{mockDataset.price}</span>
                    <span className="text-xl font-medium text-gray-500">SUI</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <button className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-semibold text-white transition active:scale-95 shadow-sm hover:opacity-90" style={{ backgroundColor: '#474747' }}>
                    <ShoppingCart size={18} />
                    Purchase Dataset
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 hover:border-gray-300">
                      <Eye size={18} />
                      Preview
                    </button>
                    <button className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 hover:border-gray-300">
                      <Share2 size={18} />
                      Share
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex gap-3">
                    <ShieldCheck size={20} className="text-[#474747] flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-0.5">Secure Transaction</p>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Protected by smart contract escrow. Funds released only upon verification.
                      </p>
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