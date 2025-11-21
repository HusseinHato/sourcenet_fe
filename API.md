SourceNet API Documentation Review
📋 Executive Summary
Dokumentasi Swagger API sudah cukup lengkap dan siap untuk digunakan di frontend. Namun, ada beberapa kekurangan detail response schema dan missing pages/modals di frontend yang perlu ditambahkan.

✅ API Endpoints Status
🔐 Authentication Endpoints
Endpoint	Method	Status	Notes
/api/auth/zklogin/callback	POST	✅ Complete	Request & response documented
/api/auth/wallet/callback	POST	✅ Complete	Request & response documented
/api/auth/me	GET	⚠️ Partial	Response schema missing
/api/auth/profile	PUT	⚠️ Partial	Response schema missing
/api/auth/logout	POST	⚠️ Partial	Response schema missing
🏪 Marketplace Endpoints
Endpoint	Method	Status	Notes
/api/marketplace/datapods	GET	✅ Complete	Supports pagination, filtering, sorting
/api/marketplace/browse	GET	✅ Complete	Advanced filtering available
/api/marketplace/search	GET	✅ Complete	Full-text search
/api/marketplace/datapods/:datapod_id	GET	⚠️ Partial	Response schema missing
/api/marketplace/top-rated	GET	⚠️ Partial	Response schema missing
/api/marketplace/categories	GET	⚠️ Partial	Response schema missing
💰 Seller Endpoints
Endpoint	Method	Status	Notes
/api/seller/upload	POST	✅ Complete	Multipart form-data
/api/seller/publish	POST	✅ Complete	Requires upload_id
/api/seller/datapods	GET	⚠️ Partial	Response schema missing
/api/seller/stats	GET	⚠️ Partial	Response schema missing
🛒 Buyer Endpoints
Endpoint	Method	Status	Notes
/api/buyer/purchase	POST	✅ Complete	Creates purchase transaction
/api/buyer/purchase/:purchase_id	GET	⚠️ Partial	Response schema missing
/api/buyer/purchase/:purchase_id/details	GET	⚠️ Partial	Response schema missing
/api/buyer/download/:purchase_id	GET	⚠️ Partial	Response schema missing
/api/buyer/purchase/:purchase_id/review	POST	✅ Complete	Submit review
⭐ Review Endpoints
Endpoint	Method	Status	Notes
/api/review	POST	✅ Complete	Create review
/api/review/datapod/:datapodId	GET	⚠️ Partial	Response schema missing
/api/review/my-reviews	GET	⚠️ Partial	Response schema missing
/api/review/:reviewId	DELETE	⚠️ Partial	Response schema missing
🔍 Detailed Response Structures
Marketplace DataPods Response
{
  status: "success",
  datapods: [
    {
      id: string,              // datapod_id
      title: string,
      category: string,
      price_sui: number,
      seller: string,          // seller ID
      seller_name: string,
      seller_rating: number | null,
      seller_total_sales: number,
      total_sales: number,
      average_rating: number | null,
      preview_data: string,    // First 100 chars of description
      size_bytes: number,      // Currently 0, TODO in backend
      published_at: string     // ISO timestamp
    }
  ],
  total_count: number,
  page: number,
  limit: number,
  has_next: boolean,
  has_prev: boolean,
  query_time_ms: number
}
DataPod Details Response
{
  status: "success",
  data: {
    datapodId: string,
    title: string,
    description: string,
    category: string,
    priceSui: Decimal,
    status: "published" | "draft" | "delisted",
    totalSales: number,
    averageRating: Decimal | null,
    publishedAt: Date,
    seller: {
      id: string,
      username: string,
      bio: string,
      avatarUrl: string,
      averageRating: Decimal,
      totalSales: number,
      reputationScore: number,
      isVerified: boolean
    },
    reviews: [
      {
        id: string,
        rating: number,
        comment: string,
        createdAt: Date
      }
    ]
  }
}
Seller Stats Response
{
  status: "success",
  data: {
    totalDataPods: number,
    totalSales: number,
    totalRevenue: Decimal,
    averageRating: Decimal,
    recentSales: Purchase[]
  }
}
🚨 Issues Found
1. Missing Response Schemas in Swagger
Banyak endpoint yang hanya mencantumkan { description: 'Success' } tanpa detail schema response. Ini akan menyulitkan frontend developer.

Affected Endpoints:

/api/auth/me
/api/auth/profile
/api/seller/datapods
/api/seller/stats
/api/buyer/purchase/:purchase_id
/api/buyer/purchase/:purchase_id/details
/api/buyer/download/:purchase_id
/api/review/datapod/:datapodId
/api/review/my-reviews
2. Inconsistent Response Format
Beberapa endpoint menggunakan data wrapper
Beberapa menggunakan datapods langsung
Perlu standardisasi format response
3. Missing Error Response Documentation
Tidak ada dokumentasi untuk error responses (400, 401, 404, 500, dll)

📱 Missing Frontend Pages/Modals
Berdasarkan struktur frontend yang ada, berikut adalah halaman/modal yang KURANG:

🔴 Critical Missing Pages
1. Upload/Publish DataPod Page (Seller Flow)
Path: app/(main)/seller/upload/page.tsx atau modal

Required Features:

File upload form
Metadata input (title, description, category, price)
Preview uploaded data
Publish button
Progress indicator
API Integration:

// Step 1: Upload file
POST /api/seller/upload
Content-Type: multipart/form-data
Body: { file: File, metadata: JSON }
// Step 2: Publish
POST /api/seller/publish
Body: { upload_id: string }
2. Purchase History Page (Buyer)
Path: app/(main)/buyer/purchases/page.tsx

Required Features:

List of all purchases
Purchase status (pending, completed, failed)
Download button for completed purchases
Review button
API Integration:

GET /api/buyer/purchases  // ⚠️ ENDPOINT MISSING!
// Need to add this endpoint to backend
3. Seller Dashboard/Stats Page
Path: app/(main)/seller/dashboard/page.tsx

Required Features:

Total sales
Total revenue
Average rating
Recent sales list
DataPods performance
API Integration:

GET /api/seller/stats
GET /api/seller/datapods
4. My Reviews Page
Path: app/(main)/profile/reviews/page.tsx

Required Features:

List of reviews user has written
Edit/delete review functionality
API Integration:

GET /api/review/my-reviews
DELETE /api/review/:reviewId
🟡 Important Missing Modals
1. Purchase Confirmation Modal
Component: app/components/marketplace/PurchaseModal.tsx

Required Features:

DataPod details summary
Price confirmation
Wallet connection check
Transaction signing
Loading state during blockchain transaction
API Integration:

POST /api/buyer/purchase
Body: {
  datapod_id: string,
  buyer_address: string,
  buyer_public_key: string
}
2. Download Modal
Component: app/components/buyer/DownloadModal.tsx

Required Features:

Download progress
Decryption status
File verification
Save location
API Integration:

GET /api/buyer/download/:purchase_id
3. Review Modal
Component: app/components/review/ReviewModal.tsx

Required Features:

Star rating (1-5)
Comment textarea
Submit button
Validation
API Integration:

POST /api/buyer/purchase/:purchase_id/review
Body: { rating: number, comment: string }
4. Upload Progress Modal
Component: app/components/seller/UploadProgressModal.tsx

Required Features:

File upload progress
Encryption progress
Blockchain publishing progress
Success/error state
🔧 Recommended Swagger Improvements
1. Add Complete Response Schemas
// Example for /api/seller/datapods
'/seller/datapods': {
  get: {
    tags: ['Seller'],
    summary: 'Get seller DataPods',
    security: [{ bearerAuth: [] }],
    responses: {
      '200': {
        description: 'List of seller DataPods',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'success' },
                data: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      datapodId: { type: 'string' },
                      title: { type: 'string' },
                      category: { type: 'string' },
                      priceSui: { type: 'number' },
                      status: { type: 'string', enum: ['draft', 'published', 'delisted'] },
                      totalSales: { type: 'integer' },
                      averageRating: { type: 'number', nullable: true },
                      publishedAt: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '401': {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      }
    }
  }
}
2. Add Error Response Schemas
components: {
  schemas: {
    ErrorResponse: {
      type: 'object',
      properties: {
        error: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
            statusCode: { type: 'integer' },
            requestId: { type: 'string' }
          }
        }
      }
    }
  }
}
3. Add WebSocket Documentation
WebSocket events sudah didokumentasikan di websocketEvents, tapi tidak terintegrasi dengan Swagger UI. Pertimbangkan untuk menambahkan AsyncAPI documentation.

📦 Missing Backend Endpoints
Berdasarkan kebutuhan frontend, endpoint berikut BELUM ADA di backend:

1. Get Buyer Purchases
GET /api/buyer/purchases
Query: ?page=1&limit=20&status=completed
Response: {
  status: "success",
  purchases: Purchase[],
  pagination: { page, limit, total, pages }
}
2. Update DataPod (Seller)
PUT /api/seller/datapods/:datapod_id
Body: { title?, description?, price_sui? }
3. Delist DataPod (Seller)
DELETE /api/seller/datapods/:datapod_id
// Soft delete, set status to 'delisted'
4. Get User Profile by Address
GET /api/users/:address
// For viewing other users' profiles
🎯 Action Items
For Backend Team:
✅ Add complete response schemas to all Swagger endpoints
✅ Add error response documentation
✅ Standardize response format across all endpoints
✅ Add missing endpoints:
GET /api/buyer/purchases
PUT /api/seller/datapods/:datapod_id
DELETE /api/seller/datapods/:datapod_id
GET /api/users/:address
For Frontend Team:
✅ Create missing pages:
Seller upload/publish page
Buyer purchase history page
Seller dashboard/stats page
My reviews page
✅ Create missing modals:
Purchase confirmation modal
Download modal
Review modal
Upload progress modal
✅ Implement API client functions in app/utils/api.client.ts
✅ Add proper error handling for all API calls
📚 API Client Example
// app/utils/api.client.ts
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
    const query = new URLSearchParams(params as any).toString();
    return fetch(`${API_URL}/marketplace/datapods?${query}`);
  },
  async getDataPodDetails(datapodId: string) {
    return fetch(`${API_URL}/marketplace/datapods/${datapodId}`);
  },
  // Seller
  async uploadData(file: File, metadata: any) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    return fetch(`${API_URL}/seller/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
  },
  async publishDataPod(uploadId: string) {
    return fetch(`${API_URL}/seller/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ upload_id: uploadId })
    });
  },
  // Buyer
  async createPurchase(data: {
    datapod_id: string;
    buyer_address: string;
    buyer_public_key: string;
  }) {
    return fetch(`${API_URL}/buyer/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
  },
  async getDownloadUrl(purchaseId: string) {
    return fetch(`${API_URL}/buyer/download/${purchaseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  // Review
  async submitReview(purchaseId: string, data: {
    rating: number;
    comment: string;
  }) {
    return fetch(`${API_URL}/buyer/purchase/${purchaseId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
  }
};
🔗 Swagger UI Access
Swagger UI dapat diakses di: http://localhost:3001/api-docs/

Untuk copy ke frontend, export Swagger JSON:

curl http://localhost:3001/api-docs/swagger.json > swagger.json
✨ Conclusion
Status: Dokumentasi API sudah 80% siap, namun perlu:

Melengkapi response schemas
Menambahkan missing endpoints
Membuat halaman/modal frontend yang kurang
Priority:

🔴 High: Purchase flow (modal + API)
🔴 High: Upload/Publish flow (page + API)
🟡 Medium: Purchase history page
🟡 Medium: Seller dashboard
🟢 Low: Profile pages