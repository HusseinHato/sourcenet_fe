# Frontend-Backend Integration Guide

## Overview
This guide maps the frontend API calls to the backend routes and provides all necessary environment variables.

---

## Environment Variables

### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Sui Configuration
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.devnet.sui.io:443
NEXT_PUBLIC_SUI_NETWORK=devnet

# ZKLogin Configuration
NEXT_PUBLIC_ZKLOGIN_CLIENT_ID=your_google_oauth_client_id
NEXT_PUBLIC_ZKLOGIN_REDIRECT_URL=http://localhost:3000/auth/callback

# Feature Flags
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
```

### Backend (.env.local)
```env
# Server Configuration
NODE_ENV=development
PORT=3001
LOG_LEVEL=debug

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sourcenet_db
REDIS_URL=redis://localhost:6379

# Sui Blockchain
SUI_RPC_URL=https://fullnode.devnet.sui.io:443
SUI_NETWORK=devnet
SUI_PACKAGE_ID=your_deployed_package_id
SUI_ADMIN_ADDRESS=your_admin_address
SUI_ADMIN_SECRET_KEY=your_admin_secret_key

# Walrus Storage
WALRUS_RPC_URL=https://walrus-testnet-rpc.allthatnode.com:8545
WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.allthatnode.com
WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.allthatnode.com

# S3 Storage (Temporary file storage)
AWS_S3_BUCKET=sourcenet-uploads
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_UPLOAD_EXPIRY_HOURS=24

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRY=7d

# ZKLogin Configuration
ZKLOGIN_CLIENT_ID=your_google_oauth_client_id
ZKLOGIN_CLIENT_SECRET=your_google_oauth_client_secret

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@sourcenet.com

# Indexer Configuration
INDEXER_POLL_INTERVAL_MS=3000
INDEXER_BATCH_SIZE=100
INDEXER_CHECKPOINT_SAVE_INTERVAL=10

# WebSocket Configuration
WS_PORT=3001
WS_PING_INTERVAL=30000
WS_PING_TIMEOUT=5000

# Monitoring & Alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
PAGERDUTY_API_KEY=your_pagerduty_key
ENABLE_ALERTS=true
```

---

## API Endpoint Mapping

### Authentication Routes

#### POST /auth/zklogin/callback
**Frontend Call:**
```typescript
// app/hooks/useZKLogin.ts
const response = await fetch('/api/auth/zklogin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ jwt: jwtToken }),
});
```

**Backend Route:** `POST /api/auth/zklogin/callback`
**Controller:** `auth.controller.ts::verifyZKLogin()`
**Request Body:**
```json
{
  "jwt": "zklogin_jwt_token"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_auth_token",
    "address": "0x...",
    "email": "user@example.com",
    "username": "username",
    "role": "buyer",
    "balance": 1000
  }
}
```

#### GET /auth/me
**Frontend Call:**
```typescript
// app/hooks/useZKLogin.ts
const response = await fetch('/api/auth/me', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
  },
});
```

**Backend Route:** `GET /api/auth/me`
**Controller:** `auth.controller.ts::getCurrentUser()`
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "zkloginAddress": "0x...",
    "email": "user@example.com",
    "username": "username",
    "bio": "...",
    "avatarUrl": "...",
    "totalSales": 10,
    "totalRevenue": 5000,
    "averageRating": 4.5,
    "reputationScore": 100,
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /auth/profile
**Frontend Call:**
```typescript
// Update user profile
await apiClient.put('/auth/profile', {
  username: 'newusername',
  bio: 'My bio',
  avatarUrl: 'https://...',
  websiteUrl: 'https://...'
});
```

**Backend Route:** `PUT /api/auth/profile`
**Controller:** `auth.controller.ts::updateProfile()`
**Request Body:**
```json
{
  "username": "string",
  "bio": "string",
  "avatarUrl": "string",
  "websiteUrl": "string"
}
```

#### POST /auth/logout
**Frontend Call:**
```typescript
// app/hooks/useZKLogin.ts
await fetch('/api/auth/logout', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
  },
});
```

**Backend Route:** `POST /api/auth/logout`
**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Marketplace Routes

#### GET /marketplace/datapods
**Frontend Call:**
```typescript
// app/hooks/useApi.ts::useGetDataPods()
const response = await apiClient.get('/datapods', {
  params: { page, limit, ...filters },
});
```

**Backend Route:** `GET /api/marketplace/datapods`
**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `category` (string, optional)
- `sortBy` (string, optional: 'price', 'rating', 'newest')
- `search` (string, optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "datapodId": "on-chain-id",
        "title": "Dataset Title",
        "description": "...",
        "category": "finance",
        "tags": ["tag1", "tag2"],
        "priceSui": "100.5",
        "totalSales": 50,
        "averageRating": 4.5,
        "status": "published",
        "seller": {
          "id": "uuid",
          "username": "seller_name",
          "avatarUrl": "...",
          "totalSales": 100,
          "averageRating": 4.8
        },
        "publishedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

#### GET /marketplace/datapods/:datapod_id
**Frontend Call:**
```typescript
// app/hooks/useApi.ts::useGetDataPod()
const response = await apiClient.get(`/datapods/${id}`);
```

**Backend Route:** `GET /api/marketplace/datapods/:datapod_id`
**Response:** Single DataPod object (same structure as above)

#### GET /marketplace/search
**Frontend Call:**
```typescript
// app/hooks/useApi.ts::useSearchDataPods()
const response = await apiClient.get('/datapods/search', {
  params: { q: query, page },
});
```

**Backend Route:** `GET /api/marketplace/search`
**Query Parameters:**
- `q` (string, required)
- `page` (number, default: 1)
- `limit` (number, default: 20)

#### GET /marketplace/top-rated
**Backend Route:** `GET /api/marketplace/top-rated`
**Query Parameters:**
- `limit` (number, default: 10)

**Response:** Array of top-rated DataPods

#### GET /marketplace/categories
**Backend Route:** `GET /api/marketplace/categories`
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "finance",
      "label": "Finance",
      "count": 150
    },
    {
      "name": "healthcare",
      "label": "Healthcare",
      "count": 200
    }
  ]
}
```

---

### Buyer Routes (Require Authentication)

#### POST /buyer/purchase
**Frontend Call:**
```typescript
// app/hooks/useApi.ts::useCreatePurchase()
const response = await apiClient.post('/purchases', {
  dataPodId: 'uuid',
  buyerPublicKey: 'x25519_public_key'
});
```

**Backend Route:** `POST /api/buyer/purchase`
**Controller:** `buyer.controller.ts::createPurchaseRequest()`
**Request Body:**
```json
{
  "datapodId": "uuid",
  "buyerPublicKey": "base64_encoded_x25519_public_key"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "purchaseRequestId": "uuid",
    "datapodId": "uuid",
    "buyerId": "uuid",
    "priceSui": "100.5",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /buyer/purchase/:purchase_id
**Frontend Call:**
```typescript
// app/hooks/useApi.ts::useGetPurchaseStatus()
const response = await apiClient.get(`/purchases/${purchaseId}`);
```

**Backend Route:** `GET /api/buyer/purchase/:purchase_id`
**Controller:** `buyer.controller.ts::getPurchaseStatus()`
**Response:**
```json
{
  "success": true,
  "data": {
    "purchaseRequestId": "uuid",
    "datapodId": "uuid",
    "status": "completed",
    "encryptedBlobId": "walrus_blob_id",
    "decryptionKey": "base64_encrypted_ephemeral_key",
    "txDigest": "0x...",
    "completedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /buyer/purchase/:purchase_id/details
**Backend Route:** `GET /api/buyer/purchase/:purchase_id/details`
**Response:** Full purchase details with datapod info

#### GET /buyer/download/:purchase_id
**Frontend Call:**
```typescript
// Download purchased data
const response = await apiClient.get(`/buyer/download/${purchaseId}`);
```

**Backend Route:** `GET /api/buyer/download/:purchase_id`
**Controller:** `download.controller.ts::getDownloadUrl()`
**Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://walrus-url/blob/...",
    "expiresAt": "2024-01-01T01:00:00Z",
    "encryptedKey": "base64_encrypted_ephemeral_key",
    "nonce": "base64_nonce",
    "tag": "base64_auth_tag"
  }
}
```

#### POST /buyer/purchase/:purchase_id/review
**Frontend Call:**
```typescript
// app/hooks/useApi.ts::useAddReview()
const response = await apiClient.post('/reviews', {
  purchaseId: 'uuid',
  rating: 5,
  comment: 'Great data!'
});
```

**Backend Route:** `POST /api/buyer/purchase/:purchase_id/review`
**Request Body:**
```json
{
  "rating": 1-5,
  "comment": "string"
}
```

#### GET /buyer/purchase
**Frontend Call:**
```typescript
// app/hooks/useApi.ts::useGetMyPurchases()
const response = await apiClient.get('/purchases/my');
```

**Backend Route:** `GET /api/buyer/purchases`
**Response:** Paginated array of user's purchases

---

### Seller Routes (Require Authentication)

#### POST /seller/upload
**Frontend Call:**
```typescript
// app/hooks/useApi.ts::useUploadFile()
const formData = new FormData();
formData.append('file', file);
const response = await apiClient.post('/uploads', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

**Backend Route:** `POST /api/seller/upload-data`
**Controller:** `seller.controller.ts::uploadData()`
**Request:** FormData with file
**Response:**
```json
{
  "success": true,
  "data": {
    "uploadId": "uuid",
    "dataHash": "sha256_hash",
    "fileSize": 1024000,
    "status": "pending"
  }
}
```

#### POST /seller/publish
**Frontend Call:**
```typescript
// app/hooks/useApi.ts::usePublishDataPod()
const response = await apiClient.post('/datapods/publish', {
  title: 'Dataset Title',
  description: 'Description',
  category: 'finance',
  price: 100.5,
  fileHash: 'sha256_hash',
  fileSize: 1024000
});
```

**Backend Route:** `POST /api/seller/publish-datapod`
**Controller:** `seller.controller.ts::publishDataPod()`
**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "tags": ["tag1", "tag2"],
  "priceSui": "100.5",
  "dataHash": "sha256_hash",
  "fileSize": 1024000
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "datapodId": "uuid",
    "datapodIdOnChain": "on-chain-id",
    "transactionHash": "0x...",
    "status": "published",
    "publishedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /seller/datapods
**Frontend Call:**
```typescript
// app/hooks/useApi.ts::useGetMyDataPods()
const response = await apiClient.get('/datapods/my');
```

**Backend Route:** `GET /api/seller/datapods`
**Response:** Paginated array of seller's datapods

#### GET /seller/stats
**Frontend Call:**
```typescript
// app/hooks/useApi.ts::useGetUserStats()
const response = await apiClient.get('/users/stats');
```

**Backend Route:** `GET /api/seller/stats`
**Controller:** `seller.controller.ts::getSellerStats()`
**Response:**
```json
{
  "success": true,
  "data": {
    "totalSales": 150,
    "totalRevenue": "15000.5",
    "averageRating": 4.7,
    "totalDataPods": 25,
    "totalPurchases": 150,
    "reputationScore": 850
  }
}
```

---

### Review Routes

#### POST /review
**Backend Route:** `POST /api/review`
**Request Body:**
```json
{
  "datapodId": "uuid",
  "purchaseRequestId": "uuid",
  "rating": 1-5,
  "comment": "string"
}
```

#### GET /review/datapod/:datapodId
**Backend Route:** `GET /api/review/datapod/:datapodId`
**Response:** Array of reviews for datapod

#### GET /review/my-reviews
**Backend Route:** `GET /api/review/my-reviews`
**Response:** Array of user's reviews

#### DELETE /review/:reviewId
**Backend Route:** `DELETE /api/review/:reviewId`

---

### Download Routes

#### GET /download/:purchaseRequestId
**Backend Route:** `GET /api/download/:purchaseRequestId`
**Controller:** `download.controller.ts::getDownloadUrl()`

#### GET /download/history
**Backend Route:** `GET /api/download/history`

---

### Health Routes

#### GET /health
**Backend Route:** `GET /health`
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### GET /health/websocket
**Backend Route:** `GET /health/websocket`
**Response:**
```json
{
  "status": "ok",
  "websocket": {
    "connected": true,
    "clients": 5
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## WebSocket Events

### Connection
```typescript
const ws = new WebSocket('ws://localhost:3001');
```

### Subscribe to Events
```typescript
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'marketplace'
}));
```

### Events Received

#### datapod.published
```json
{
  "type": "datapod.published",
  "data": {
    "datapodId": "uuid",
    "title": "Dataset Title",
    "seller": { ... }
  }
}
```

#### purchase.completed
```json
{
  "type": "purchase.completed",
  "data": {
    "purchaseRequestId": "uuid",
    "datapodId": "uuid",
    "buyerId": "uuid"
  }
}
```

#### review.added
```json
{
  "type": "review.added",
  "data": {
    "datapodId": "uuid",
    "rating": 5,
    "comment": "Great!"
  }
}
```

---

## Frontend Store Integration

### User Store
```typescript
// app/store/userStore.ts
interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}
```

### Encryption Store
```typescript
// app/store/encryptionStore.ts
interface EncryptionStore {
  buyerKeyPair: KeyPair | null;
  ephemeralSigner: string | null;
  setBuyerKeyPair: (keyPair: KeyPair) => void;
  setEphemeralSigner: (signer: string) => void;
  clearKeys: () => void;
}
```

### Marketplace Store
```typescript
// app/store/marketplaceStore.ts
interface MarketplaceStore {
  datapods: DataPod[];
  selectedDatapod: DataPod | null;
  filters: FilterOptions;
  setDatapods: (datapods: DataPod[]) => void;
  setSelectedDatapod: (datapod: DataPod) => void;
  setFilters: (filters: FilterOptions) => void;
}
```

### Purchase Store
```typescript
// app/store/purchaseStore.ts
interface PurchaseStore {
  purchases: Purchase[];
  currentPurchase: Purchase | null;
  setPurchases: (purchases: Purchase[]) => void;
  setCurrentPurchase: (purchase: Purchase) => void;
}
```

---

## API Client Configuration

### Request Interceptor
The frontend automatically adds JWT token to all requests:
```typescript
// app/utils/api.client.ts
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Response Interceptor
Handles 401 errors by redirecting to login:
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Database Schema Alignment

The frontend types should match the backend Prisma schema:

### User Model
```typescript
interface User {
  id: string;
  zkloginAddress: string;
  googleEmail?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  websiteUrl?: string;
  totalSales: number;
  totalRevenue: Decimal;
  averageRating?: Decimal;
  reputationScore: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### DataPod Model
```typescript
interface DataPod {
  id: string;
  datapodId: string; // On-chain ID
  sellerId: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  priceSui: Decimal;
  dataHash: string;
  totalSales: number;
  averageRating?: Decimal;
  status: 'draft' | 'published' | 'delisted';
  blobId: string; // Walrus blob ID
  kioskId?: string; // Sui Kiosk ID
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

### PurchaseRequest Model
```typescript
interface PurchaseRequest {
  id: string;
  purchaseRequestId: string; // On-chain ID
  datapodId: string;
  buyerId: string;
  buyerAddress: string;
  sellerAddress: string;
  buyerPublicKey: string; // X25519 public key
  priceSui: Decimal;
  status: 'pending' | 'completed' | 'refunded' | 'disputed';
  encryptedBlobId?: string;
  decryptionKey?: string; // Encrypted ephemeral key
  txDigest?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Testing Checklist

- [ ] Frontend connects to backend API
- [ ] Authentication flow works (ZKLogin)
- [ ] JWT tokens are properly stored and sent
- [ ] Marketplace datapods load correctly
- [ ] File upload works
- [ ] DataPod publishing works
- [ ] Purchase creation works
- [ ] Download URL generation works
- [ ] Reviews can be submitted
- [ ] WebSocket events are received
- [ ] Encryption/decryption works end-to-end
- [ ] Rate limiting is enforced
- [ ] Error handling works properly

---

## Troubleshooting

### CORS Errors
Ensure backend has correct CORS_ORIGIN in .env:
```env
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### 401 Unauthorized
- Check JWT token is stored in localStorage
- Verify token hasn't expired
- Check Authorization header format: `Bearer <token>`

### WebSocket Connection Failed
- Ensure WS_URL is correct
- Check WebSocket server is running on backend
- Verify firewall allows WebSocket connections

### File Upload Fails
- Check S3 credentials are correct
- Verify file size is within limits
- Check CORS headers on S3 bucket

### Encryption Issues
- Ensure buyer public key is base64 encoded
- Verify X25519 keypair generation
- Check AES-256-GCM implementation
