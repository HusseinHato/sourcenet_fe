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
        className={i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
      />
    ))}
  </div>
);

const RatingBar = ({ rating, count, total }: { rating: ReviewRating; count: number; total: number }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700 w-12">{rating} star</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
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
    <main className="relative min-h-screen bg-gradient-to-b from-white via-gray-50 to-white pt-28 sm:pt-32 lg:pt-36">
      <div className="relative z-10 px-4 sm:px-6 lg:px-10 xl:px-16 pb-12">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Seller Reviews</h1>
            <p className="text-lg text-gray-600">See what buyers think about our data quality and service</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rating Summary */}
            <div className="lg:col-span-1">
              <div className="rounded-3xl border border-gray-200 bg-white/90 backdrop-blur p-8 shadow-sm sticky top-32">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Rating Summary</h2>

                {/* Average Rating */}
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl font-bold text-gray-900">
                      {ratingStats.average.toFixed(1)}
                    </div>
                    <div>
                      <StarRating rating={ratingStats.average} size={20} />
                      <p className="mt-2 text-sm text-gray-600">
                        Based on {ratingStats.total} review{ratingStats.total !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <RatingBar
                      key={rating}
                      rating={rating as ReviewRating}
                      count={ratingStats.distribution[rating as ReviewRating]}
                      total={ratingStats.total}
                    />
                  ))}
                </div>

                {/* Stats Cards */}
                <div className="mt-8 pt-8 border-t border-gray-200 space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={18} className="text-emerald-600" />
                      <span className="text-sm font-medium text-gray-700">Positive Reviews</span>
                    </div>
                    <span className="text-lg font-bold text-emerald-600">
                      {ratingStats.distribution[5] + ratingStats.distribution[4]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2">
              {/* Filters */}
              <div className="mb-6 space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search reviews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white/80 py-3 pl-11 pr-4 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filter and Sort */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      value={filterRating}
                      onChange={(e) => setFilterRating(e.target.value as ReviewRating | 'all')}
                      className="w-full rounded-xl border border-gray-300 bg-white/80 py-3 pl-11 pr-4 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    >
                      <option value="all">All Ratings</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'recent' | 'helpful')}
                    className="flex-1 rounded-xl border border-gray-300 bg-white/80 py-3 px-4 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="helpful">Most Helpful</option>
                  </select>
                </div>
              </div>

              {/* Reviews */}
              <div className="space-y-4">
                {filteredReviews.length > 0 ? (
                  filteredReviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300"
                    >
                      {/* Review Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <User size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{review.buyer}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
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

                      {/* Review Content */}
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{review.title}</h3>
                        <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                        <p className="mt-2 text-xs text-gray-500">Dataset: {review.datapod}</p>
                      </div>

                      {/* Review Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
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
                  ))
                ) : (
                  <div className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-12 text-center shadow-sm">
                    <MessageSquare size={40} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium text-gray-900">No reviews found</p>
                    <p className="text-sm text-gray-600 mt-1">Try adjusting your filters or search query</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
