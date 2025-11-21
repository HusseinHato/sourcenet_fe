'use client';

import { useState, useEffect } from 'react';
import { Star, Trash2, Loader2, MessageSquare } from 'lucide-react';
import { api } from '../../../utils/api.client';

interface Review {
    id: string;
    datapodId: string;
    datapodTitle: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export default function MyReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const response = await api.getMyReviews();
            // Transform API response if needed
            const fetchedReviews = response.data.reviews || response.data.data || [];
            setReviews(fetchedReviews.map((r: any) => ({
                id: r.id || r._id,
                datapodId: r.datapodId || r.datapod?.id,
                datapodTitle: r.datapodTitle || r.datapod?.title || 'Unknown Data Pod',
                rating: r.rating,
                comment: r.comment,
                createdAt: r.createdAt,
            })));
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (reviewId: string) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        setIsDeleting(reviewId);
        try {
            await api.deleteReview(reviewId);
            setReviews(reviews.filter((r) => r.id !== reviewId));
        } catch (error) {
            console.error('Failed to delete review:', error);
            alert('Failed to delete review. Please try again.');
        } finally {
            setIsDeleting(null);
        }
    };

    const getRatingStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={16}
                className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}
            />
        ));
    };

    return (
        <main className="min-h-screen bg-[#FAFAFA] pb-12">
            <div className="bg-white border-b border-gray-200 pt-8 pb-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Reviews</h1>
                    <p className="text-gray-500 mt-1">Manage reviews you've written for data pods</p>
                </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-gray-400" size={32} />
                    </div>
                ) : reviews.length > 0 ? (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{review.datapodTitle}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex">{getRatingStars(review.rating)}</div>
                                            <span className="text-sm text-gray-500">
                                                • {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-gray-600">{review.comment}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        disabled={isDeleting === review.id}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                        title="Delete Review"
                                    >
                                        {isDeleting === review.id ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <Trash2 size={20} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                            <MessageSquare className="text-gray-400" size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
                        <p className="text-gray-500 mt-1">You haven't written any reviews yet.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
