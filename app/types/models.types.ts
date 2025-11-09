// User types
export interface User {
  address: string;
  email?: string;
  username?: string;
  role: 'buyer' | 'seller' | 'both';
  balance: number;
  rating?: number;
  totalSales?: number;
  createdAt: string;
}

// DataPod types
export interface DataPod {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: 'SUI' | 'USD';
  fileHash: string;
  fileSize: number;
  blobId?: string;
  status: 'draft' | 'published' | 'delisted';
  rating: number;
  reviewCount: number;
  purchaseCount: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

// Purchase types
export interface Purchase {
  id: string;
  buyerId: string;
  dataPodId: string;
  sellerId: string;
  price: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  blobId?: string;
  encryptedEphemeralKey?: string;
  nonce?: string;
  tag?: string;
  dataHash?: string;
  transactionHash?: string;
  createdAt: string;
  completedAt?: string;
}

// Review types
export interface Review {
  id: string;
  purchaseId: string;
  buyerId: string;
  dataPodId: string;
  sellerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Encryption types
export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedBlob {
  encryptedData: string;
  encryptedEphemeralKey: string;
  nonce: string;
  tag: string;
  dataHash: string;
}

// Upload types
export interface UploadSession {
  id: string;
  sellerId: string;
  fileName: string;
  fileSize: number;
  fileHash: string;
  status: 'uploading' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
}

// Filter types
export interface MarketplaceFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'popular' | 'price-low' | 'price-high' | 'rating';
  search?: string;
  page?: number;
  limit?: number;
}
