'use client';

import { Star, User, Calendar, Trash2, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { ReviewWithBuyer, ReviewWithDataPod } from '@/app/utils/review.client';
import { formatDateRelative } from '@/app/utils/format.utils';

interface ReviewCardProps {
    review: ReviewWithBuyer | ReviewWithDataPod;
    onDelete?: (reviewId: string) => void;
    canDelete?: boolean;
    isDeleting?: boolean;
}

export function ReviewCard({ review, onDelete, canDelete = false, isDeleting = false }: ReviewCardProps) {
    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                size={14}
                className={i < rating ? 'fill-[#353535] text-[#353535]' : 'fill-gray-200 text-gray-200'}
            />
        ));
    };

    const isMyReview = 'datapod' in review;
    const displayName = isMyReview ? review.datapod.title : (review as ReviewWithBuyer).buyer?.username || 'Anonymous';
    const displaySubtext = isMyReview ? review.datapod.category : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#F5F5F5] flex items-center justify-center border border-gray-200">
                        {isMyReview ? (
                            <Database size={20} className="text-[#474747]" />
                        ) : (
                            <User size={20} className="text-[#474747]" />
                        )}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">
                            {displayName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                            <span className="text-xs text-gray-500">
                                <Calendar size={12} className="inline mr-1" />
                                {formatDateRelative(review.createdAt)}
                            </span>
                            {displaySubtext && (
                                <span className="text-xs text-gray-400 border-l border-gray-300 pl-2 ml-1">
                                    {displaySubtext}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {canDelete && onDelete && (
                    <motion.button
                        onClick={() => onDelete(review.id)}
                        disabled={isDeleting}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                        <Trash2 size={16} />
                    </motion.button>
                )}
            </div>

            {review.comment && (
                <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
            )}
        </motion.div>
    );
}
