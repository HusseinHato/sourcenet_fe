'use client';

import { useState } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { ReviewCard } from './ReviewCard';
import { ReviewWithBuyer, ReviewWithDataPod } from '@/app/utils/review.client';

interface ReviewListProps {
    reviews: (ReviewWithBuyer | ReviewWithDataPod)[];
    isLoading?: boolean;
    canDelete?: boolean;
    onDelete?: (reviewId: string) => Promise<void>;
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoadingMore?: boolean;
}

export function ReviewList({
    reviews,
    isLoading = false,
    canDelete = false,
    onDelete,
    onLoadMore,
    hasMore = false,
    isLoadingMore = false,
}: ReviewListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (reviewId: string) => {
        if (!onDelete) return;

        setDeletingId(reviewId);
        try {
            await onDelete(reviewId);
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                    <MessageSquare className="text-gray-400" size={24} />
                </div>
                <p className="text-lg font-semibold text-gray-900">No reviews yet</p>
                <p className="text-sm text-gray-500 mt-1">Be the first to leave a review!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <ReviewCard
                    key={review.id}
                    review={review}
                    canDelete={canDelete}
                    onDelete={onDelete ? handleDelete : undefined}
                    isDeleting={deletingId === review.id}
                />
            ))}

            {hasMore && onLoadMore && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={onLoadMore}
                        disabled={isLoadingMore}
                        className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoadingMore ? (
                            <>
                                <Loader2 className="animate-spin" size={16} />
                                Loading...
                            </>
                        ) : (
                            'Load More'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
