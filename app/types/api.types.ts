import { DataPod, Purchase, Review } from './models.types';

// API Request types
export interface PublishDataPodRequest {
  title: string;
  description: string;
  category: string;
  price: number;
  currency: 'SUI' | 'USD';
  fileHash: string;
  fileSize: number;
}

export interface CreatePurchaseRequest {
  dataPodId: string;
  buyerPublicKey: string;
}

export interface CreateReviewRequest {
  purchaseId: string;
  rating: number;
  comment: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface DataPodListResponse extends PaginatedResponse<DataPod> {}

export interface PurchaseStatusResponse {
  purchase: Purchase;
  blobId?: string;
  encryptedEphemeralKey?: string;
  nonce?: string;
  tag?: string;
  dataHash?: string;
}

export interface UploadInitResponse {
  uploadId: string;
  uploadUrl: string;
}

export interface PublishResponse {
  dataPodId: string;
  transactionHash: string;
  status: 'published';
}

export interface UserStatsResponse {
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  totalDataPods: number;
  totalPurchases: number;
}
