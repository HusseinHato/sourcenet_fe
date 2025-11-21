'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Download,
  Star,
  Package,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  Loader2,
  ShoppingBag,
  Clock,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { api, getAuthToken } from '../../utils/api.client';
import { DownloadModal } from '../../components/buyer/DownloadModal';
import { ReviewModal } from '../../components/review/ReviewModal';
import { useUserStore } from '../store/userStore';

interface Purchase {
  id: string;
  title: string;
  seller: string;
  price_sui: number;
  purchased_at: string;
  status: 'completed' | 'pending' | 'processing';
  rating?: number;
  category: string;
}

export default function BuyerDashboard() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'pending'>('all');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const fetchPurchases = async () => {
    setIsLoading(true);
    try {
      const response = await api.getBuyerPurchases();
      // Transform API response if needed
      // Assuming API returns { purchases: [...] } or similar
      const rawData = response.data?.purchases || response.data?.data;
      const fetchedPurchases = Array.isArray(rawData) ? rawData : [];

      setPurchases(fetchedPurchases.map((p: any) => ({
        id: p.id || p.purchaseId,
        title: p.dataPod?.title || p.title || 'Unknown Title',
        seller: p.seller?.username || p.sellerName || 'Unknown Seller',
        price_sui: p.priceSui || p.price_sui,
        purchased_at: p.createdAt || p.purchased_at,
        status: p.status,
        rating: p.review?.rating,
        category: p.dataPod?.category || p.category || 'Uncategorized',
      })));
    } catch (error: any) {
      console.error('Failed to fetch purchases:', error);

      // TEMPORARY: Use mock data if API endpoint doesn't exist (401/404)
      // TODO: Remove this when backend implements GET /api/buyer/purchases
      if (error.response?.status === 401 || error.response?.status === 404) {
        console.warn('⚠️ Buyer purchases endpoint not available, using mock data');
        setPurchases([
          {
            id: 'p-001',
            title: 'E-commerce Transaction Data 2024',
            seller: 'DataCorp Inc.',
            price_sui: 50,
            purchased_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            status: 'completed',
            rating: 5,
            category: 'E-commerce',
          },
          {
            id: 'p-002',
            title: 'Social Media Analytics Dataset',
            seller: 'Analytics Pro',
            price_sui: 35,
            purchased_at: new Date(Date.now() - 86400000 * 5).toISOString(),
            status: 'completed',
            rating: 4,
            category: 'Social Media',
          },
          {
            id: 'p-003',
            title: 'Financial Market Data Q1 2024',
            seller: 'FinData Solutions',
            price_sui: 75,
            purchased_at: new Date(Date.now() - 86400000 * 1).toISOString(),
            status: 'pending',
            category: 'Finance',
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Wait for auth persistence to finish loading
    if (isAuthLoading) {
      console.log('Buyer: Auth still loading, waiting...');
      return;
    }

    // Check if user is authenticated after loading is complete
    const token = getAuthToken();
    console.log('Buyer: Auth loaded. Token exists:', !!token, 'User exists:', !!user);

    if (!token || !user) {
      console.warn('No auth token or user found, redirecting to login');
      router.push('/login');
      return;
    }

    console.log('Buyer: Fetching purchases with token');
    fetchPurchases();
  }, [router, isAuthLoading, user]);

  const filteredPurchases = purchases.filter((p) => {
    if (activeTab === 'all') return true;
    return p.status === activeTab;
  });

  const totalPurchases = purchases.length;
  const completedPurchases = purchases.filter((p) => p.status === 'completed').length;
  const pendingPurchases = purchases.filter((p) => p.status === 'pending' || p.status === 'processing').length;
  const totalSpent = purchases.reduce((sum, p) => sum + p.price_sui, 0);

  const handleDownloadClick = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsDownloadModalOpen(true);
  };

  const handleReviewClick = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsReviewModalOpen(true);
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < Math.floor(rating) ? 'fill-gray-900 text-gray-900' : 'fill-gray-200 text-gray-200'}
      />
    ));
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-gray-100 text-gray-800 border border-gray-200',
      pending: 'bg-gray-50 text-gray-600 border border-gray-200',
      processing: 'bg-gray-50 text-gray-600 border border-gray-200',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-8 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Buyer Dashboard</h1>
              <p className="text-gray-500 mt-1">Manage your purchases and track your spending</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#474747] text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium shadow-sm">
                <ShoppingBag size={16} />
                Browse Marketplace
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Package className="text-[#474747]" size={20} />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">Total Purchases</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{isLoading ? '-' : totalPurchases}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Download className="text-[#474747]" size={20} />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">Completed</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{isLoading ? '-' : completedPurchases}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Clock className="text-[#474747]" size={20} />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">Pending</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{isLoading ? '-' : pendingPurchases}</p>
          </div>

          <div className="p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: '#474747', borderColor: '#474747' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <TrendingUp className="text-white" size={20} />
              </div>
            </div>
            <p className="text-gray-400 text-sm font-medium">Total Spent</p>
            <p className="text-3xl font-bold text-white mt-1">{isLoading ? '-' : totalSpent} <span className="text-lg font-normal text-gray-400">SUI</span></p>
          </div>
        </div>

        {/* Recent Purchases Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Purchases</h2>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-lg self-start sm:self-auto">
              {(['all', 'completed', 'pending'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Purchases List */}
          <div className="divide-y divide-gray-100">
            {isLoading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="animate-spin text-gray-400" size={32} />
              </div>
            ) : filteredPurchases.length > 0 ? (
              filteredPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="p-6 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {purchase.title}
                        </h3>
                        {getStatusBadge(purchase.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Eye size={14} />
                          {purchase.seller}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {new Date(purchase.purchased_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-xs font-medium text-gray-600">
                          {purchase.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      {purchase.rating && (
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">{getRatingStars(purchase.rating)}</div>
                        </div>
                      )}
                      <div className="text-right min-w-[80px]">
                        <p className="text-lg font-bold text-gray-900">{purchase.price_sui} SUI</p>
                      </div>

                      <div className="flex gap-2">
                        {purchase.status === 'completed' && !purchase.rating && (
                          <button
                            onClick={() => handleReviewClick(purchase)}
                            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all"
                            title="Write a review"
                          >
                            <MessageSquare size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadClick(purchase)}
                          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-[#474747] hover:text-white hover:border-[#474747] transition-all"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                  <Package className="text-gray-400" size={24} />
                </div>
                <p className="text-base font-semibold text-gray-900 mb-1">No purchases found</p>
                <p className="text-sm text-gray-500">Try adjusting your filter or browse the marketplace</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedPurchase && (
        <>
          <DownloadModal
            isOpen={isDownloadModalOpen}
            onClose={() => setIsDownloadModalOpen(false)}
            purchaseId={selectedPurchase.id}
            purchaseTitle={selectedPurchase.title}
          />
          <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            onSuccess={() => {
              fetchPurchases(); // Refresh to show updated rating
            }}
            purchaseId={selectedPurchase.id}
            purchaseTitle={selectedPurchase.title}
          />
        </>
      )}
    </main>
  );
}