# Frontend API Specification - Updated

## Overview
This document specifies all API endpoints and their exact request/response formats for the frontend.

---

## Authentication Routes

### 1. POST /api/auth/zklogin/callback
**Purpose**: ZKLogin authentication

**Request Body**:
```typescript
{
  address: string;        // Required - ZKLogin address
  email?: string;         // Optional - User's email
  username?: string;      // Optional - User's username
}
```

**Success Response (200)**:
```typescript
{
  status: 'success';
  data: {
    token: string;
    user: {
      id: string;
      address: string;
      username: string;
      email: string | null;
    };
  };
}
```

**Error Response (400/500)**:
```typescript
{
  error: {
    code: 'MISSING_ADDRESS' | 'ZKLOGIN_ERROR';
    message: string;
  };
}
```

**Frontend Hook**:
```typescript
const { login } = useZKLogin();
await login(address, email, username);
```

---

### 2. GET /api/auth/me
**Purpose**: Get current user profile

**Authentication**: Required (JWT token in Authorization header)

**Success Response (200)**:
```typescript
{
  status: 'success';
  data: {
    user: {
      id: string;
      zkloginAddress: string;
      username: string;
      googleEmail: string | null;
      bio: string | null;
      avatarUrl: string | null;
      websiteUrl: string | null;
      totalSales: number;
      totalRevenue: Decimal;
      averageRating: Decimal | null;
      reputationScore: number;
      isVerified: boolean;
      createdAt: Date;
    };
  };
}
```

**Frontend Hook**:
```typescript
const { getCurrentUser } = useZKLogin();
const user = await getCurrentUser();
```

---

### 3. PUT /api/auth/profile
**Purpose**: Update user profile

**Authentication**: Required

**Request Body**:
```typescript
{
  username?: string;      // Optional
  bio?: string;           // Optional
  avatarUrl?: string;     // Optional
  websiteUrl?: string;    // Optional
}
```

**Success Response (200)**:
```typescript
{
  status: 'success';
  data: {
    user: {
      id: string;
      zkloginAddress: string;
      username: string;
      bio: string | null;
      avatarUrl: string | null;
      websiteUrl: string | null;
    };
  };
}
```

---

### 4. POST /api/auth/logout
**Purpose**: Logout user

**Authentication**: Required

**Success Response (200)**:
```typescript
{
  status: 'success';
  message: 'Logged out successfully';
}
```

---

## Marketplace Routes

### 1. GET /api/marketplace/datapods
**Purpose**: List all datapods with pagination and filters

**Query Parameters**:
```typescript
{
  page?: number;              // Default: 1
  limit?: number;             // Default: 20, Max: 100
  category?: string;          // Optional
  sort_by?: 'newest' | 'price_asc' | 'price_desc' | 'rating';  // Default: 'newest'
  price_min?: number;         // Optional
  price_max?: number;         // Optional
  search?: string;            // Optional
}
```

**Success Response (200)**:
```typescript
{
  status: 'success';
  datapods: Array<{
    id: string;
    title: string;
    category: string;
    price_sui: number;
    seller: string;
    seller_name: string;
    seller_rating: number | null;
    seller_total_sales: number;
    total_sales: number;
    average_rating: number | null;
    preview_data: string;
    size_bytes: number;
    published_at: string;
  }>;
  total_count: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
  query_time_ms: number;
}
```

**Frontend Hook**:
```typescript
const { data } = useGetDataPods(page, limit, { category, sort_by, price_min, price_max, search });
```

---

### 2. GET /api/marketplace/datapods/:datapod_id
**Purpose**: Get single datapod details

**URL Parameters**: `datapod_id: string` (Required)

**Success Response (200)**:
```typescript
{
  status: 'success';
  data: DataPod;
}
```

**Frontend Hook**:
```typescript
const { data } = useGetDataPod(id);
```

---

### 3. GET /api/marketplace/search
**Purpose**: Search datapods

**Query Parameters**:
```typescript
{
  q: string;                  // Required, min 2 characters
  category?: string;          // Optional
  page?: number;              // Default: 1
  limit?: number;             // Default: 20, Max: 100
}
```

**Success Response (200)**:
```typescript
{
  status: 'success';
  query: string;
  data: DataPod[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

**Frontend Hook**:
```typescript
const { data } = useSearchDataPods(query, page, limit);
```

---

### 4. GET /api/marketplace/browse
**Purpose**: Browse marketplace with filters

**Query Parameters**:
```typescript
{
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'price' | 'rating' | 'recent' | 'popular';  // Default: 'recent'
  page?: number;              // Default: 1
  limit?: number;             // Default: 20, Max: 100
}
```

**Success Response (200)**:
```typescript
{
  status: 'success';
  data: DataPod[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

---

### 5. GET /api/marketplace/top-rated
**Purpose**: Get top-rated datapods

**Success Response (200)**:
```typescript
{
  status: 'success';
  data: DataPod[];
}
```

---

### 6. GET /api/marketplace/categories
**Purpose**: Get available categories

**Success Response (200)**:
```typescript
{
  status: 'success';
  categories: string[];
}
```

---

## Buyer Routes (All require authentication)

### 1. POST /api/buyer/purchase
**Purpose**: Create purchase request

**Request Body**:
```typescript
{
  datapod_id: string;         // Required
  buyer_address: string;      // Required - Sui address
  buyer_public_key: string;   // Required - base64-encoded 32-byte X25519 public key
}
```

**Success Response (200)**:
```typescript
{
  status: 'success';
  purchase_request_id: string;
  escrow_id: string;
  price_sui: number;
  created_at: string;
}
```

**Error Response (402)**:
```typescript
{
  error: {
    code: 'INSUFFICIENT_BALANCE';
    message: string;
    statusCode: 402;
    requestId: string;
    details: {
      required: string;
      available: string;
    };
  };
}
```

**Frontend Hook**:
```typescript
const { mutate } = useCreatePurchase();
mutate({ datapod_id, buyer_address, buyer_public_key });
```

---

### 2. GET /api/buyer/purchase/:purchase_id
**Purpose**: Get purchase status

**URL Parameters**: `purchase_id: string` (Required)

**Success Response (200)**:
```typescript
{
  status: 'success';
  purchase_request_id: string;
  purchase_status: 'pending' | 'completed' | 'failed';
  blob_id: string | null;
  datapod_id: string;
  datapod_title: string;
  price_sui: number;
  created_at: string;
  completed_at: string | null;
}
```

**Frontend Hook**:
```typescript
const { data } = useGetPurchaseStatus(purchaseId);
```

---

### 3. GET /api/buyer/purchase/:purchase_id/details
**Purpose**: Get full purchase details

**URL Parameters**: `purchase_id: string` (Required)

**Success Response (200)**:
```typescript
{
  status: 'success';
  purchase: PurchaseRequest;
}
```

---

### 4. GET /api/buyer/download/:purchase_id
**Purpose**: Get download URL

**URL Parameters**: `purchase_id: string` (Required)

**Rate Limiting**: Applied

**Success Response (200)**: Download URL or signed URL

---

### 5. POST /api/buyer/download/:purchase_id
**Purpose**: Download purchased data

**URL Parameters**: `purchase_id: string` (Required)

**Request Body**:
```typescript
{
  buyer_private_key: string;  // Required - for decryption
}
```

**Success Response (200)**: Binary data
```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="data.bin"
X-Data-Hash: string
```

---

### 6. POST /api/buyer/purchase/:purchase_id/review
**Purpose**: Submit review for purchase

**URL Parameters**: `purchase_id: string` (Required)

**Request Body**: See Review Routes

---

### 7. GET /api/buyer/purchase
**Purpose**: Get user's purchases

**Query Parameters**:
```typescript
{
  page?: number;              // Default: 1
  limit?: number;             // Default: 20
}
```

**Success Response (200)**:
```typescript
{
  status: 'success';
  data: Purchase[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

**Frontend Hook**:
```typescript
const { data } = useGetMyPurchases(page, limit);
```

---

## Seller Routes (All require authentication)

### 1. POST /api/seller/upload
**Purpose**: Upload file

**Request Body** (multipart/form-data):
```typescript
{
  file: File;                 // Required - Max 100MB
  metadata: string;           // Required - JSON string with:
  {
    title: string;            // Required
    category: string;         // Required
    price_sui: number;        // Required
    description?: string;     // Optional
    tags?: string[];          // Optional
  };
  message?: string;           // Optional
  signature?: string;         // Optional
}
```

**Success Response (200)**:
```typescript
{
  status: 'success';
  upload_id: string;
  data_hash: string;
  preview_data: string;
  file_size: number;
  message: 'File uploaded successfully. Ready to publish.';
}
```

**Frontend Hook**:
```typescript
const { mutate } = useUploadFile();
mutate({ file, title, category, price_sui, description, tags });
```

---

### 2. POST /api/seller/publish
**Purpose**: Publish datapod

**Request Body**:
```typescript
{
  upload_id: string;          // Required
}
```

**Success Response (200)**:
```typescript
{
  status: 'success';
  datapod_id: string;
  kiosk_id: string;
  tx_digest: string;
  message: 'DataPod published successfully';
}
```

**Frontend Hook**:
```typescript
const { mutate } = usePublishDataPod();
mutate({ upload_id });
```

---

### 3. GET /api/seller/datapods
**Purpose**: Get seller's datapods

**Success Response (200)**:
```typescript
{
  status: 'success';
  count: number;
  datapods: DataPod[];
}
```

**Frontend Hook**:
```typescript
const { data } = useGetMyDataPods();
```

---

### 4. GET /api/seller/stats
**Purpose**: Get seller statistics

**Success Response (200)**:
```typescript
{
  status: 'success';
  stats: {
    totalDataPods: number;
    totalSales: number;
    totalRevenue: string;
    averageRating: string;
    reputationScore: number;
  };
}
```

**Frontend Hook**:
```typescript
const { data } = useGetUserStats();
```

---

## Review Routes

### 1. POST /api/review
**Purpose**: Submit review

**Authentication**: Required

**Request Body**:
```typescript
{
  purchaseRequestId: string;  // Required
  datapodId: string;          // Required
  rating: number;             // Required - 1-5
  comment?: string;           // Optional
}
```

**Success Response (201)**:
```typescript
{
  status: 'success';
  data: {
    review: Review;
  };
}
```

**Frontend Hook**:
```typescript
const { mutate } = useAddReview();
mutate({ purchaseRequestId, datapodId, rating, comment });
```

---

### 2. GET /api/review/datapod/:datapodId
**Purpose**: Get reviews for datapod

**URL Parameters**: `datapodId: string` (Required)

**Query Parameters**:
```typescript
{
  limit?: number;             // Default: 10
  offset?: number;            // Default: 0
}
```

**Success Response (200)**:
```typescript
{
  status: 'success';
  data: {
    reviews: Review[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
    };
  };
}
```

---

### 3. GET /api/review/my-reviews
**Purpose**: Get user's reviews

**Authentication**: Required

**Query Parameters**:
```typescript
{
  limit?: number;             // Default: 10
  offset?: number;            // Default: 0
}
```

**Success Response (200)**:
```typescript
{
  status: 'success';
  data: {
    reviews: Review[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
    };
  };
}
```

---

### 4. DELETE /api/review/:reviewId
**Purpose**: Delete review

**Authentication**: Required

**URL Parameters**: `reviewId: string` (Required)

**Success Response (200)**:
```typescript
{
  status: 'success';
  message: 'Review deleted successfully';
}
```

---

## Download Routes (All require authentication)

### 1. GET /api/download/:purchaseRequestId
**Purpose**: Download purchased data

**URL Parameters**: `purchaseRequestId: string` (Required)

**Success Response (200)**: Binary data
```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="data-{purchaseRequestId}.bin"
```

---

### 2. GET /api/download/history
**Purpose**: Get download history

**Query Parameters**:
```typescript
{
  limit?: number;             // Default: 10
  offset?: number;            // Default: 0
}
```

**Success Response (200)**:
```typescript
{
  status: 'success';
  data: {
    downloads: TransactionAudit[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
    };
  };
}
```

---

## Health Routes

### 1. GET /health
**Purpose**: Health check

**Success Response (200)**:
```typescript
{
  status: 'ok';
  timestamp: string;  // ISO8601
}
```

---

### 2. GET /health/websocket
**Purpose**: WebSocket status

**Success Response (200)**:
```typescript
{
  status: 'ok' | 'unavailable';
  websocket: {
    connected: boolean;
    clients: number;
  };
  timestamp: string;  // ISO8601
}
```

---

## Error Handling

All error responses follow this format:

```typescript
{
  error: {
    code: string;           // Error code (e.g., 'MISSING_ADDRESS')
    message: string;        // Human-readable message
    statusCode?: number;    // HTTP status code
    requestId?: string;     // Request ID for tracking
    details?: any;          // Additional error details
  };
}
```

**Common HTTP Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `402` - Payment Required (insufficient balance)
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication

All authenticated endpoints require the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

The token is automatically added by the API client interceptor.

---

## Rate Limiting

Rate limiting is applied to:
- `/api/buyer/download/:purchase_id` - Limited per user/IP
- All endpoints - General rate limit (100 requests per 15 minutes)

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
```

---

## Summary of Frontend Hooks

| Hook | Method | Endpoint |
|------|--------|----------|
| `useZKLogin().login()` | POST | `/auth/zklogin/callback` |
| `useZKLogin().getCurrentUser()` | GET | `/auth/me` |
| `useGetDataPods()` | GET | `/marketplace/datapods` |
| `useGetDataPod()` | GET | `/marketplace/datapods/:id` |
| `useSearchDataPods()` | GET | `/marketplace/search` |
| `useGetMyPurchases()` | GET | `/buyer/purchase` |
| `useCreatePurchase()` | POST | `/buyer/purchase` |
| `useGetPurchaseStatus()` | GET | `/buyer/purchase/:id` |
| `useUploadFile()` | POST | `/seller/upload` |
| `usePublishDataPod()` | POST | `/seller/publish` |
| `useGetMyDataPods()` | GET | `/seller/datapods` |
| `useGetUserStats()` | GET | `/seller/stats` |
| `useAddReview()` | POST | `/review` |

---

**Last Updated**: 2024
**Status**: ✅ Updated to match backend specification
