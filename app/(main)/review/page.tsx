'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../store/userStore';
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

import { deleteReview, ReviewWithDataPod } from '../../utils/review.client';
import { api, getAuthToken } from '../../utils/api.client';
import { ReviewList } from '../../components/review/ReviewList';
import { Loader2 } from 'lucide-react';

interface RatingStats {
  average: number;
  total: number;
  distribution: Record<number, number>;
}

// Removed mockReviews

const calculateRatingStats = (reviews: ReviewWithDataPod[]): RatingStats => {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  reviews.forEach((review) => {
    distribution[review.rating] = (distribution[review.rating] || 0) + 1;
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

const RatingBar = ({ rating, count, total }: { rating: number; count: number; total: number }) => {
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

export default function ReviewPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useUserStore();
  const [reviews, setReviews] = useState<ReviewWithDataPod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, limit: 10, offset: 0 });
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchReviews = async (offset = 0, silent = false) => {
    if (!silent) {
      if (offset === 0) setIsLoading(true);
      else setIsLoadingMore(true);
    }

    try {
      const token = getAuthToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

      console.log('Fetching reviews with token:', token ? 'Present' : 'Missing');

      // TEST: Check if token works for buyer purchases
      try {
        console.log('TEST: Attempting to fetch buyer purchases...');
        const testResponse = await api.getBuyerPurchases({ limit: 1 });
        console.log('TEST: Buyer purchases fetch SUCCESS', testResponse.status);
      } catch (testError: any) {
        console.error('TEST: Buyer purchases fetch FAILED', testError.response?.status || testError.message);
      }

      const response = await fetch(`${apiUrl}/review/my-reviews?limit=${pagination.limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Review fetch failed:', response.status, errorText);
        if (response.status === 401) {
          // Don't redirect immediately, just show error
          console.error('Auth failed for reviews endpoint');
          // You might want to set a UI error state here
        }
        throw new Error(`Failed to fetch reviews: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const { reviews: newReviews, pagination: newPagination } = data.data;

      if (offset === 0) {
        setReviews(newReviews);
      } else {
        setReviews(prev => [...prev, ...newReviews]);
      }
      setPagination(newPagination);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      if (!silent) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    // Wait for auth persistence to finish loading
    if (isAuthLoading) {
      return;
    }

    // Check if user is authenticated after loading is complete
    const token = getAuthToken();

    if (!token || !user) {
      router.push('/login');
      return;
    }

    fetchReviews();

    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      // Only poll if we are on the first page to keep list fresh
      // Pagination polling is complex, so we just refresh the first page or current view
      // For simplicity, let's just refresh the first page (offset 0) silently
      fetchReviews(0, true);
    }, 5000);

    return () => clearInterval(interval);
  }, [router, isAuthLoading, user]);

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      // Refresh list
      fetchReviews(0);
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  const handleLoadMore = () => {
    fetchReviews(reviews.length);
  };

  const ratingStats = calculateRatingStats(reviews);

  if (isAuthLoading) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-8 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Reviews</h1>
          <p className="text-gray-500 mt-1"></p>
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
                    rating={rating}
                    count={ratingStats.distribution[rating]}
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
                  value={''}
                  onChange={() => { }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <select
                    value={''}
                    onChange={() => { }}
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
                    value={''}
                    onChange={() => { }}
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
              {/* Reviews List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Recent Reviews</h2>
                  </div>

                  <ReviewList
                    reviews={reviews}
                    isLoading={isLoading}
                    canDelete={true}
                    onDelete={handleDeleteReview}
                    hasMore={reviews.length < pagination.total}
                    onLoadMore={handleLoadMore}
                    isLoadingMore={isLoadingMore}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
