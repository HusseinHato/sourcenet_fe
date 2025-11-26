'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
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
  Check,
  FileText,
} from 'lucide-react';
import { api, getAuthToken } from '../../../utils/api.client';
import { useUserStore } from '../../store/userStore';
import { getDataPodReviews, ReviewWithBuyer } from '../../../utils/review.client';
import { PurchaseModal } from '../../../components/marketplace/PurchaseModal';
import { PreviewModal } from '../../../components/marketplace/PreviewModal';
import { ReviewList } from '../../../components/review/ReviewList';

// Removed local interfaces in favor of shared types

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

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export default function DataDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useUserStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');
  const [dataset, setDataset] = useState<any | null>(null); // Using any for now to avoid re-declaring DatasetDetail
  const [reviews, setReviews] = useState<ReviewWithBuyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [reviewsPagination, setReviewsPagination] = useState({ total: 0, limit: 5, offset: 0 });
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const fetchData = async (silent = false) => {
    if (!id) return;
    if (!silent) setIsLoading(true);
    try {
      const response = await api.getDataPodDetails(id);
      const data = response.data.data;

      console.log('🔍 Raw API Response:', data);
      console.log('🔍 Preview Data:', data.previewData, data.preview_data, data.preview);
      console.log('🔍 Size Bytes:', data.sizeBytes, data.size_bytes);

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
          preview: data.previewData || data.preview_data || data.preview || null, // Map preview data from backend
          size: data.sizeBytes ? Number(data.sizeBytes) : (data.size_bytes ? Number(data.size_bytes) : 0), // Map sizeBytes
        });

        console.log('✅ Dataset state set with preview:', data.previewData || data.preview_data || data.preview);

        // Initial reviews fetch
        if (!silent) {
          fetchReviews(data.datapodId);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const fetchReviews = async (datapodUUID: string, offset = 0) => {
    setIsLoadingReviews(true);
    try {
      const response = await getDataPodReviews(datapodUUID, reviewsPagination.limit, offset);
      const { reviews: newReviews, pagination } = response.data.data;

      if (offset === 0) {
        setReviews(newReviews);
      } else {
        setReviews(prev => [...prev, ...newReviews]);
      }
      setReviewsPagination(pagination);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleLoadMoreReviews = () => {
    if (dataset?.datapodId) {
      fetchReviews(dataset.datapodId, reviews.length);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  useEffect(() => {
    fetchData();

    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      fetchData(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  // Sorting is handled by backend or simple client-side sort by date
  const sortedReviews = [...reviews].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
                {dataset.tags.map((tag: string) => (
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
                <ReviewList
                  reviews={reviews}
                  isLoading={isLoadingReviews && reviews.length === 0}
                  hasMore={reviews.length < reviewsPagination.total}
                  onLoadMore={handleLoadMoreReviews}
                  isLoadingMore={isLoadingReviews}
                />
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
                    onClick={() => {
                      const token = localStorage.getItem('authToken') || localStorage.getItem('zklogin_jwt');
                      if (!token) {
                        router.push('/login');
                        return;
                      }
                      setIsPurchaseModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-semibold text-white transition active:scale-95 shadow-sm hover:opacity-90"
                    style={{ backgroundColor: '#474747' }}
                  >
                    <ShoppingCart size={18} />
                    Purchase Dataset
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setIsPreviewModalOpen(true)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 hover:border-gray-300 relative z-10"
                    >
                      <Eye size={18} />
                      Preview
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 hover:border-gray-300 relative z-10"
                    >
                      {isCopied ? <Check size={18} className="text-green-600" /> : <Share2 size={18} />}
                      {isCopied ? 'Copied!' : 'Share'}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                  <div className="flex gap-3">
                    <ShieldCheck size={20} className="text-[#474747] flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-0.5">Secure Transaction</p>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Protected by smart contract escrow. Funds released only upon verification.
                      </p>
                    </div>
                  </div>
                  {dataset.size > 0 && (
                    <div className="flex gap-3 pt-3 border-t border-gray-200">
                      <FileText size={20} className="text-[#474747] flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-0.5">File Size</p>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {formatBytes(dataset.size)}
                        </p>
                      </div>
                    </div>
                  )}
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
            datapodId: dataset.datapodId,
            title: dataset.title,
            price_sui: dataset.price,
            seller_name: dataset.seller,
          }}
        />
      )}

      {/* Preview Modal */}
      {dataset && (
        <PreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          previewData={dataset.preview}
          title={dataset.title}
        />
      )}
    </main>
  );
}