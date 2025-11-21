'use client';

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../utils/api.client';
import { Star, Loader2, AlertCircle, Check } from 'lucide-react';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    purchaseId: string;
    purchaseTitle: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSuccess, purchaseId, purchaseTitle }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await api.submitReview(purchaseId, { rating, comment });
            onSuccess();
            onClose();
            resetForm();
        } catch (err: any) {
            console.error('Review submission failed:', err);
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setRating(0);
        setComment('');
        setHoverRating(0);
        setError('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Write a Review" size="md">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-gray-900">Reviewing: {purchaseTitle}</h3>
                </div>

                {/* Star Rating */}
                <div className="flex flex-col items-center space-y-2">
                    <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform hover:scale-110"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    size={32}
                                    className={`${star <= (hoverRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'fill-gray-200 text-gray-200'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500">
                        {rating > 0 ? `You rated this ${rating} star${rating > 1 ? 's' : ''}` : 'Select a rating'}
                    </p>
                </div>

                {/* Comment */}
                <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                        Comment (Optional)
                    </label>
                    <textarea
                        id="comment"
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#474747] focus:ring-[#474747] sm:text-sm p-2 border"
                        placeholder="Share your experience with this dataset..."
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#474747]"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-[#474747] border border-transparent rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#474747]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Review'
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
