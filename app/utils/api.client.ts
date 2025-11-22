import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Only handle redirect on client side
      if (typeof window !== 'undefined') {
        // Clear auth and redirect to login
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Set authorization token
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

/**
 * Clear authorization token
 */
export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

/**
 * Get authorization token
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

/**
 * Get API base URL
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

// --- API Methods ---

export const api = {
  // Marketplace
  async getDataPods(params: {
    page?: number;
    limit?: number;
    category?: string;
    sort_by?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
    price_min?: number;
    price_max?: number;
    search?: string;
  }) {
    return apiClient.get('/marketplace/datapods', { params });
  },
  async getDataPodDetails(datapodId: string) {
    return apiClient.get(`/marketplace/datapods/${datapodId}`);
  },
  async getTopRated() {
    return apiClient.get('/marketplace/top-rated');
  },
  async getCategories() {
    return apiClient.get('/marketplace/categories');
  },

  // Seller
  async uploadData(file: File, metadata: any) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    return apiClient.post('/seller/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  async publishDataPod(uploadId: string) {
    return apiClient.post('/seller/publish', { upload_id: uploadId });
  },
  async getSellerStats() {
    return apiClient.get('/seller/stats');
  },
  async getSellerDataPods() {
    return apiClient.get('/seller/datapods');
  },
  async deleteDataPod(datapodId: string) {
    return apiClient.delete(`/seller/datapods/${datapodId}`);
  },
  async updateDataPod(datapodId: string, data: any) {
    return apiClient.put(`/seller/datapods/${datapodId}`, data);
  },

  // Buyer
  async createPurchase(data: {
    datapod_id: string;
    buyer_address: string;
    buyer_public_key: string;
  }) {
    return apiClient.post('/buyer/purchase', data);
  },
  async getBuyerPurchases(params?: { page?: number; limit?: number; status?: string }) {
    return apiClient.get('/buyer/purchases', { params });
  },
  async getPurchaseDetails(purchaseId: string) {
    return apiClient.get(`/buyer/purchase/${purchaseId}`);
  },
  async getDownloadUrl(purchaseId: string) {
    return apiClient.get(`/buyer/download/${purchaseId}`);
  },
  async submitReview(purchaseId: string, data: {
    rating: number;
    comment: string;
  }) {
    return apiClient.post(`/buyer/purchase/${purchaseId}/review`, data);
  },

  // Review
  async getMyReviews() {
    return apiClient.get('/review/my-reviews');
  },
  async deleteReview(reviewId: string) {
    return apiClient.delete(`/review/${reviewId}`);
  },
  async getDataPodReviews(datapodId: string) {
    return apiClient.get(`/review/datapod/${datapodId}`);
  },

  // Auth
  async getMe() {
    return apiClient.get('/auth/me');
  },
  async updateProfile(data: any) {
    return apiClient.put('/auth/profile', data);
  },
};
