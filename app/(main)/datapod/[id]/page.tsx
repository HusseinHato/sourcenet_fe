'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import {
  Star,
  Share2,
  Eye,
  User,
  ThumbsUp,
  ShoppingCart,
  ChevronRight,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { api } from '../../../utils/api.client';
import { PurchaseModal } from '../../../components/marketplace/PurchaseModal';

type ReviewRating = 1 | 2 | 3 | 4 | 5;

interface DatasetDetail {
  id: string;
  datapodId: string;
  title: string;
  description: string;
  seller: string;
  price: number;
  category: string;
  createdAt: string;
  downloads: number;
  rating: number;
  reviewsCount: number;
  tags: string[];
  status: string;
  blobId: string;
  kioskId: string;
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
  const params = useParams();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');
  const [dataset, setDataset] = useState<DatasetDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await api.getDataPodDetails(id);
      const data = response.data.data;

      console.log("data", data);

      if (data) {
        setDataset({
          id: data.id,
          datapodId: data.datapodId,
          title: data.title,
          description: data.description,
          seller: data.seller?.username || 'Unknown Seller',
          price: Number(data.priceSui),
          category: data.category,
          createdAt: data.publishedAt,
          downloads: data.totalSales,
          rating: Number(data.averageRating) || 0,
          reviewsCount: data.reviews?.length || 0,
          tags: data.tags || [],
          status: data.status,
          blobId: data.blobId,
          kioskId: data.kioskId,
        });

        setReviews(data.reviews?.map((r: any) => ({
          id: r.id,
          buyer: 'Anonymous',
          rating: r.rating,
          title: 'Review',
          comment: r.comment,
          date: r.createdAt,
          helpful: 0,
        })) || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const sortedReviews = [...reviews].sort((a, b) =>
    sortBy === 'helpful' ? b.helpful - a.helpful : new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={48} />
      </main>
    );
  }

  if (!dataset) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <p className="text-gray-500">Dataset not found.</p>
      </main>
    );
  }

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
            <a href={`/?category=${dataset.category}`} className="hover:text-gray-900 transition-colors">
              {dataset.category}
            </a>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium truncate">{dataset.title}</span>
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
                      {dataset.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-sm">
                      <StarRating rating={dataset.rating} size={14} />
                      <span className="font-medium text-gray-900">{dataset.rating}</span>
                      <span className="text-gray-500">({dataset.reviewsCount} reviews)</span>
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{dataset.title}</h1>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User size={16} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Seller</p>
                      <p className="text-sm font-semibold text-gray-900">{dataset.seller}</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-8">{dataset.description}</p>

              {/* Tags */}
              <div className="mt-6 flex flex-wrap gap-2">
                {dataset.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-3 py-1 rounded-lg bg-gray-50 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
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
                {sortedReviews.length > 0 ? (
                  sortedReviews.map((review) => (
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
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No reviews yet.</p>
                )}
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
                    <span className="text-4xl font-bold text-gray-900">{dataset.price}</span>
                    <span className="text-xl font-medium text-gray-500">SUI</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => setIsPurchaseModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-semibold text-white transition active:scale-95 shadow-sm hover:opacity-90"
                    style={{ backgroundColor: '#474747' }}
                  >
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

      {/* Purchase Modal */}
      {dataset && (
        <PurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          onSuccess={() => {
            alert('Purchase successful! You can now download the dataset from your dashboard.');
          }}
          datapod={{
            id: dataset.id,
            title: dataset.title,
            price_sui: dataset.price,
            seller_name: dataset.seller,
          }}
        />
      )}
    </main>
  );
}