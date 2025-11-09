'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/app/utils/api.client';
import { DataPod, Purchase, ApiResponse, PaginatedResponse } from '@/app/types';

/**
 * Fetch all data pods with pagination and filters
 */
export function useGetDataPods(page: number = 1, limit: number = 20, filters?: any) {
  return useQuery({
    queryKey: ['datapods', page, limit, filters],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<DataPod>>('/datapods', {
        params: { page, limit, ...filters },
      });
      return response.data;
    },
  });
}

/**
 * Fetch single data pod details
 */
export function useGetDataPod(id: string) {
  return useQuery({
    queryKey: ['datapod', id],
    queryFn: async () => {
      const response = await apiClient.get<DataPod>(`/datapods/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Search data pods
 */
export function useSearchDataPods(query: string, page: number = 1) {
  return useQuery({
    queryKey: ['datapods-search', query, page],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<DataPod>>('/datapods/search', {
        params: { q: query, page },
      });
      return response.data;
    },
    enabled: !!query,
  });
}

/**
 * Publish a new data pod
 */
export function usePublishDataPod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<ApiResponse<DataPod>>('/datapods/publish', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datapods'] });
    },
  });
}

/**
 * Create a purchase request
 */
export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<ApiResponse<Purchase>>('/purchases', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
  });
}

/**
 * Get purchase status
 */
export function useGetPurchaseStatus(purchaseId: string) {
  return useQuery({
    queryKey: ['purchase', purchaseId],
    queryFn: async () => {
      const response = await apiClient.get<Purchase>(`/purchases/${purchaseId}`);
      return response.data;
    },
    enabled: !!purchaseId,
    refetchInterval: 2000, // Poll every 2 seconds
  });
}

/**
 * Get user's purchases
 */
export function useGetMyPurchases() {
  return useQuery({
    queryKey: ['my-purchases'],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Purchase>>('/purchases/my');
      return response.data;
    },
  });
}

/**
 * Get user's data pods (seller)
 */
export function useGetMyDataPods() {
  return useQuery({
    queryKey: ['my-datapods'],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<DataPod>>('/datapods/my');
      return response.data;
    },
  });
}

/**
 * Upload file to backend
 */
export function useUploadFile() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<ApiResponse<any>>('/uploads', formData, {
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
 */
export function useGetUserStats() {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/users/stats');
      return response.data;
    },
  });
}

/**
 * Add review to data pod
 */
export function useAddReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<ApiResponse<any>>('/reviews', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datapods'] });
    },
  });
}
