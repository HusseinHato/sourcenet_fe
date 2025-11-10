'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/app/utils/api.client';
import { DataPod, Purchase, ApiResponse, PaginatedResponse } from '@/app/types';

/**
 * Fetch all data pods with pagination and filters
 * GET /api/marketplace/datapods
 */
export function useGetDataPods(
  page: number = 1,
  limit: number = 20,
  filters?: {
    category?: string;
    sort_by?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
    price_min?: number;
    price_max?: number;
    search?: string;
  }
) {
  return useQuery({
    queryKey: ['datapods', page, limit, filters],
    queryFn: async () => {
      const response = await apiClient.get<any>('/marketplace/datapods', {
        params: { page, limit, ...filters },
      });
      return response.data;
    },
  });
}

/**
 * Fetch single data pod details
 * GET /api/marketplace/datapods/:datapod_id
 */
export function useGetDataPod(id: string) {
  return useQuery({
    queryKey: ['datapod', id],
    queryFn: async () => {
      const response = await apiClient.get<any>(`/marketplace/datapods/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

/**
 * Search data pods
 * GET /api/marketplace/search
 */
export function useSearchDataPods(query: string, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['datapods-search', query, page, limit],
    queryFn: async () => {
      const response = await apiClient.get<any>('/marketplace/search', {
        params: { q: query, page, limit },
      });
      return response.data;
    },
    enabled: !!query && query.length >= 2,
  });
}

/**
 * Publish a new data pod
 * POST /api/seller/publish
 */
export function usePublishDataPod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { upload_id: string }) => {
      const response = await apiClient.post<any>('/seller/publish', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datapods'] });
      queryClient.invalidateQueries({ queryKey: ['my-datapods'] });
    },
  });
}

/**
 * Create a purchase request
 * POST /api/buyer/purchase
 */
export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      datapod_id: string;
      buyer_address: string;
      buyer_public_key: string;
    }) => {
      const response = await apiClient.post<any>('/buyer/purchase', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
  });
}

/**
 * Get purchase status
 * GET /api/buyer/purchase/:purchase_id
 */
export function useGetPurchaseStatus(purchaseId: string) {
  return useQuery({
    queryKey: ['purchase', purchaseId],
    queryFn: async () => {
      const response = await apiClient.get<any>(`/buyer/purchase/${purchaseId}`);
      return response.data;
    },
    enabled: !!purchaseId,
    refetchInterval: 3000, // Poll every 3 seconds
  });
}

/**
 * Get user's purchases
 * GET /api/buyer/purchase
 */
export function useGetMyPurchases(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['my-purchases', page, limit],
    queryFn: async () => {
      const response = await apiClient.get<any>('/buyer/purchase', {
        params: { page, limit },
      });
      return response.data;
    },
  });
}

/**
 * Get user's data pods (seller)
 * GET /api/seller/datapods
 */
export function useGetMyDataPods() {
  return useQuery({
    queryKey: ['my-datapods'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/seller/datapods');
      return response.data.datapods || [];
    },
  });
}

/**
 * Upload file to backend
 * POST /api/seller/upload
 */
export function useUploadFile() {
  return useMutation({
    mutationFn: async (params: {
      file: File;
      title: string;
      category: string;
      price_sui: number;
      description?: string;
      tags?: string[];
    }) => {
      const formData = new FormData();
      formData.append('file', params.file);
      formData.append(
        'metadata',
        JSON.stringify({
          title: params.title,
          category: params.category,
          price_sui: params.price_sui,
          description: params.description,
          tags: params.tags,
        })
      );

      const response = await apiClient.post<any>('/seller/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
  });
}

/**
 * Get user stats (seller)
 * GET /api/seller/stats
 */
export function useGetUserStats() {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/seller/stats');
      return response.data.stats;
    },
  });
}

/**
 * Add review to data pod
 * POST /api/review
 */
export function useAddReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      purchaseRequestId: string;
      datapodId: string;
      rating: number;
      comment?: string;
    }) => {
      const response = await apiClient.post<any>('/review', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datapods'] });
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
    },
  });
}
