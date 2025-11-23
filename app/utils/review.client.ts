import { apiClient } from './api.client';

export interface Review {
    id: string;
    datapodId: string;
    purchaseRequestId: string;
    buyerId: string;
    buyerAddress: string;
    rating: number;
    comment: string | null;
    createdAt: string;
}

export interface ReviewWithBuyer extends Review {
    buyer: {
        id: string;
        username: string | null;
        avatarUrl: string | null;
    };
}

export interface ReviewWithDataPod extends Review {
    datapod: {
        id: string;
        datapodId: string;
        title: string;
        category: string;
    };
}

export interface Pagination {
    total: number;
    limit: number;
    offset: number;
}

/**
 * Create or update a review for a DataPod
 */
export async function createReview(data: {
    purchaseRequestId: string;
    datapodId: string;
    rating: number;
    comment?: string;
}) {
    return apiClient.post('/review', data);
}

/**
 * Get all reviews for a specific DataPod
 */
export async function getDataPodReviews(
    datapodId: string,
    limit: number = 10,
    offset: number = 0
) {
    return apiClient.get(`/review/datapod/${datapodId}`, {
        params: { limit, offset },
    });
}

/**
 * Get all reviews created by the current user
 */
export async function getMyReviews(limit: number = 10, offset: number = 0) {
    return apiClient.get('/review/my-reviews', {
        params: { limit, offset },
    });
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string) {
    return apiClient.delete(`/review/${reviewId}`);
}
