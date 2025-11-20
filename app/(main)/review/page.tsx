'use client';

import { useState } from 'react';
import {
  Star,
  MessageSquare,
  User,
  Calendar,
  ThumbsUp,
  Search,
  Filter,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';

type ReviewRating = 1 | 2 | 3 | 4 | 5;

interface Review {
  id: string;
  buyer: string;
  rating: ReviewRating;
  title: string;
  comment: string;
  date: string;
  helpful: number;
  datapod: string;
}

interface RatingStats {
  average: number;
  total: number;
  distribution: Record<ReviewRating, number>;
}

const mockReviews: Review[] = [
  {
    id: 'r-001',
    buyer: 'John Doe',
    rating: 5,
    title: 'Excellent Data Quality',
    comment: 'The dataset provided was comprehensive and well-organized. Highly recommend this seller for quality data.',
    date: '2024-11-10',
    helpful: 24,
    datapod: 'Customer Behavior Analytics',
  },
  {
    id: 'r-002',
    buyer: 'Sarah Smith',
    rating: 5,
    title: 'Fast Delivery & Great Support',
    comment: 'Delivered on time with excellent documentation. The seller was very responsive to questions.',
    date: '2024-11-08',
    helpful: 18,
    datapod: 'E-commerce Transaction Data',
  },
  {
    id: 'r-003',
    buyer: 'Mike Johnson',
    rating: 4,
    title: 'Good Data, Minor Issues',
    comment: 'Overall good quality data. Had a small formatting issue but seller fixed it quickly.',
    date: '2024-11-05',
    helpful: 12,
    datapod: 'Social Media Sentiment Analysis',
  },
  {
    id: 'r-004',
    buyer: 'Emma Wilson',
    rating: 5,
    title: 'Perfect for Our Use Case',
    comment: 'Exactly what we needed. The data quality is outstanding and the seller provided great insights.',
    date: '2024-10-28',
    helpful: 31,
    datapod: 'Financial Market Data Feed',
  },
  {
    id: 'r-005',
    buyer: 'David Brown',
    rating: 4,
    title: 'Reliable Seller',
    comment: 'Consistent quality and reliable. Would purchase again.',
    date: '2024-10-20',
    helpful: 8,
    datapod: 'Healthcare Patient Records',
  },
];

const calculateRatingStats = (reviews: Review[]): RatingStats => {
  const distribution: Record<ReviewRating, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  reviews.forEach((review) => {
    distribution[review.rating]++;
    sum += review.rating;
  });

  return {
    average: reviews.length > 0 ? sum / reviews.length : 0,
    total: reviews.length,
    distribution,
  };
};

const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => (
  <div className="flex gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={size}
        className={i < Math.floor(rating) ? 'fill-gray-900 text-gray-900' : 'fill-gray-200 text-gray-200'}
      />
    ))}
  </div>
);

const RatingBar = ({ rating, count, total }: { rating: ReviewRating; count: number; total: number }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-600 w-8">{rating}</span>
      <Star size={12} className="fill-gray-400 text-gray-400 -ml-1" />
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gray-900 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-gray-400 w-8 text-right">{count}</span>
    </div>
  );
};

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<ReviewRating | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');

  const ratingStats = calculateRatingStats(mockReviews);

  let filteredReviews = mockReviews;
  if (filterRating !== 'all') {
    filteredReviews = filteredReviews.filter((r) => r.rating === filterRating);
  }
  if (searchQuery) {
    filteredReviews = filteredReviews.filter(
      (r) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.comment.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (sortBy === 'helpful') {
    filteredReviews = [...filteredReviews].sort((a, b) => b.helpful - a.helpful);
  } else {
    filteredReviews = [...filteredReviews].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-8 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Seller Reviews</h1>
          <p className="text-gray-500 mt-1">See what buyers think about our data quality and service</p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Rating Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Rating Summary</h2>

              <div className="flex items-end gap-3 mb-8">
                <span className="text-5xl font-bold text-gray-900 tracking-tight">
                  {ratingStats.average.toFixed(1)}
                </span>
                <div className="mb-1.5">
                  <StarRating rating={ratingStats.average} size={18} />
                  <p className="text-xs text-gray-500 mt-1">Based on {ratingStats.total} reviews</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <RatingBar
                    key={rating}
                    rating={rating as ReviewRating}
                    count={ratingStats.distribution[rating as ReviewRating]}
                    total={ratingStats.total}
                  />
                ))}
              </div>

              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-gray-900" />
                    <span className="text-sm font-medium text-gray-700">Positive Reviews</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {Math.round(((ratingStats.distribution[5] + ratingStats.distribution[4]) / ratingStats.total) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value as ReviewRating | 'all')}
                    className="appearance-none pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
                  >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'recent' | 'helpful')}
                    className="appearance-none pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="helpful">Most Helpful</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="space-y-4">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <User size={20} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{review.buyer}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar size={12} />
                            {new Date(review.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>

                    <div className="mb-4">
                      <h3 className="font-bold text-gray-900 mb-2">{review.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.comment}</p>
                      <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs text-gray-500">
                        Dataset: {review.datapod}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                        <ThumbsUp size={16} />
                        <span>Helpful ({review.helpful})</span>
                      </button>
                      <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                        <MessageSquare size={16} />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                    <MessageSquare className="text-gray-400" size={24} />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">No reviews found</p>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search query</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
