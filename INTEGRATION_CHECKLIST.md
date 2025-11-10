# Frontend-Backend Integration Checklist

## Phase 1: Environment Setup ✓

- [ ] Create `.env.local` in frontend with API_URL pointing to backend
- [ ] Create `.env.local` in backend with all required variables
- [ ] Setup PostgreSQL database
- [ ] Setup Redis cache
- [ ] Run `npx prisma migrate dev` on backend
- [ ] Verify backend starts without errors
- [ ] Verify frontend starts without errors

## Phase 2: Authentication Integration

### ZKLogin Flow
- [ ] Implement ZKLogin callback handler on backend (`POST /api/auth/zklogin/callback`)
- [ ] Generate JWT token on successful ZKLogin
- [ ] Store JWT in localStorage on frontend
- [ ] Implement `GET /api/auth/me` endpoint
- [ ] Update `useZKLogin` hook to use correct backend endpoint
- [ ] Test login flow end-to-end
- [ ] Verify JWT is sent in Authorization header
- [ ] Test logout functionality
- [ ] Test token expiration and refresh

### User Profile
- [ ] Implement `PUT /api/auth/profile` endpoint
- [ ] Add profile update form to frontend
- [ ] Test profile updates
- [ ] Verify profile data persists

## Phase 3: Marketplace Integration

### Browse Datapods
- [ ] Implement `GET /api/marketplace/datapods` endpoint
- [ ] Add pagination support (page, limit)
- [ ] Add filtering support (category, price range, etc.)
- [ ] Add sorting support (newest, price, rating)
- [ ] Implement caching on backend
- [ ] Update `useGetDataPods` hook
- [ ] Test datapod listing on frontend
- [ ] Verify pagination works
- [ ] Verify filters work

### Search Datapods
- [ ] Implement `GET /api/marketplace/search` endpoint
- [ ] Add full-text search capability
- [ ] Update `useSearchDataPods` hook
- [ ] Test search functionality
- [ ] Verify search results are relevant

### Datapod Details
- [ ] Implement `GET /api/marketplace/datapods/:datapod_id` endpoint
- [ ] Update `useGetDataPod` hook
- [ ] Create datapod detail page
- [ ] Display seller information
- [ ] Display reviews and ratings
- [ ] Test detail page loading

### Categories
- [ ] Implement `GET /api/marketplace/categories` endpoint
- [ ] Add category filter to marketplace
- [ ] Test category filtering

### Top Rated
- [ ] Implement `GET /api/marketplace/top-rated` endpoint
- [ ] Create top-rated section on homepage
- [ ] Test top-rated listing

## Phase 4: Seller Integration

### Upload Data
- [ ] Implement `POST /api/seller/upload-data` endpoint
- [ ] Handle file upload to S3
- [ ] Calculate file hash (SHA-256)
- [ ] Update `useUploadFile` hook
- [ ] Create upload form on frontend
- [ ] Test file upload
- [ ] Verify file is stored in S3
- [ ] Verify hash is calculated correctly

### Publish DataPod
- [ ] Implement `POST /api/seller/publish-datapod` endpoint
- [ ] Build Sui transaction (PTB) for publishing
- [ ] Execute transaction on blockchain
- [ ] Store datapod in database
- [ ] Update `usePublishDataPod` hook
- [ ] Create publish form on frontend
- [ ] Test publishing flow
- [ ] Verify datapod appears in marketplace
- [ ] Verify on-chain ID is stored

### Seller Dashboard
- [ ] Implement `GET /api/seller/datapods` endpoint
- [ ] Update `useGetMyDataPods` hook
- [ ] Create seller dashboard page
- [ ] Display seller's datapods
- [ ] Add edit/delete functionality
- [ ] Test dashboard

### Seller Stats
- [ ] Implement `GET /api/seller/stats` endpoint
- [ ] Calculate total sales
- [ ] Calculate total revenue
- [ ] Calculate average rating
- [ ] Update `useGetUserStats` hook
- [ ] Display stats on dashboard
- [ ] Test stats calculation

## Phase 5: Buyer Integration

### Create Purchase
- [ ] Implement `POST /api/buyer/purchase` endpoint
- [ ] Generate X25519 keypair on frontend
- [ ] Send buyer public key to backend
- [ ] Create escrow on blockchain
- [ ] Lock payment
- [ ] Update `useCreatePurchase` hook
- [ ] Create purchase flow on frontend
- [ ] Test purchase creation
- [ ] Verify escrow is created on-chain

### Purchase Status
- [ ] Implement `GET /api/buyer/purchase/:purchase_id` endpoint
- [ ] Implement fulfillment job on backend
- [ ] Download file from S3
- [ ] Encrypt file with buyer's public key (hybrid encryption)
- [ ] Upload encrypted file to Walrus
- [ ] Update blockchain with blob ID
- [ ] Release payment to seller
- [ ] Update `useGetPurchaseStatus` hook
- [ ] Create purchase status page
- [ ] Test status polling
- [ ] Verify fulfillment completes

### Download Data
- [ ] Implement `GET /api/buyer/download/:purchase_id` endpoint
- [ ] Verify buyer owns the purchase
- [ ] Generate download URL from Walrus
- [ ] Return encrypted key and nonce
- [ ] Implement decryption on frontend
- [ ] Test download functionality
- [ ] Verify decryption works

### My Purchases
- [ ] Implement `GET /api/buyer/purchases` endpoint
- [ ] Update `useGetMyPurchases` hook
- [ ] Create purchases page
- [ ] Display purchase history
- [ ] Test purchases listing

## Phase 6: Reviews Integration

### Submit Review
- [ ] Implement `POST /api/review` endpoint
- [ ] Build Sui transaction for review
- [ ] Execute transaction on blockchain
- [ ] Store review in database
- [ ] Update datapod rating
- [ ] Update `useAddReview` hook
- [ ] Create review form on frontend
- [ ] Test review submission
- [ ] Verify rating is updated

### View Reviews
- [ ] Implement `GET /api/review/datapod/:datapodId` endpoint
- [ ] Display reviews on datapod detail page
- [ ] Show average rating
- [ ] Test review display

### My Reviews
- [ ] Implement `GET /api/review/my-reviews` endpoint
- [ ] Create my reviews page
- [ ] Test reviews listing

### Delete Review
- [ ] Implement `DELETE /api/review/:reviewId` endpoint
- [ ] Add delete button to review
- [ ] Test review deletion

## Phase 7: Encryption Integration

### Key Generation
- [ ] Implement X25519 keypair generation on frontend
- [ ] Store keypair securely (IndexedDB or encrypted localStorage)
- [ ] Implement keypair recovery from seed
- [ ] Test keypair generation

### Hybrid Encryption
- [ ] Implement ephemeral key generation
- [ ] Implement X25519 encryption (buyer pubkey)
- [ ] Implement AES-256-GCM encryption (file)
- [ ] Test encryption on backend
- [ ] Verify encrypted data is correct

### Decryption
- [ ] Implement ephemeral key decryption on frontend
- [ ] Implement AES-256-GCM decryption
- [ ] Test decryption flow
- [ ] Verify decrypted data matches original

## Phase 8: Blockchain Integration

### Sui Network
- [ ] Configure Sui RPC endpoint
- [ ] Setup Sui client on backend
- [ ] Implement signature verification
- [ ] Test Sui transactions

### Smart Contracts
- [ ] Deploy DataPod contract to testnet
- [ ] Deploy Kiosk contract to testnet
- [ ] Deploy Escrow contract to testnet
- [ ] Update contract addresses in .env
- [ ] Test contract interactions

### Transaction Building
- [ ] Implement PTB for publish
- [ ] Implement PTB for purchase
- [ ] Implement PTB for review
- [ ] Implement PTB for payment release
- [ ] Test transaction execution

### Indexer
- [ ] Implement event listener
- [ ] Implement event parsers
- [ ] Implement data transformers
- [ ] Implement database writers
- [ ] Test indexer synchronization
- [ ] Verify events are indexed correctly

## Phase 9: WebSocket Integration

### Connection
- [ ] Setup WebSocket server on backend
- [ ] Implement WebSocket handlers
- [ ] Test connection from frontend
- [ ] Verify connection is stable

### Events
- [ ] Implement datapod.published event
- [ ] Implement purchase.completed event
- [ ] Implement review.added event
- [ ] Test event broadcasting
- [ ] Verify events are received on frontend

### Real-time Updates
- [ ] Update marketplace on datapod.published
- [ ] Update purchase status on purchase.completed
- [ ] Update reviews on review.added
- [ ] Test real-time updates

## Phase 10: Error Handling & Validation

### Frontend Validation
- [ ] Validate form inputs
- [ ] Show error messages
- [ ] Handle API errors gracefully
- [ ] Implement retry logic
- [ ] Test error scenarios

### Backend Validation
- [ ] Validate request bodies with Zod
- [ ] Return proper error responses
- [ ] Implement error logging
- [ ] Test validation

### Error Recovery
- [ ] Implement automatic token refresh
- [ ] Implement connection retry logic
- [ ] Implement transaction retry logic
- [ ] Test error recovery

## Phase 11: Performance & Caching

### Frontend Caching
- [ ] Implement React Query caching
- [ ] Configure cache invalidation
- [ ] Test cache behavior
- [ ] Optimize queries

### Backend Caching
- [ ] Implement Redis caching for datapods
- [ ] Implement Redis caching for user stats
- [ ] Implement cache invalidation on updates
- [ ] Test cache performance

### Database Optimization
- [ ] Add indexes to frequently queried fields
- [ ] Test query performance
- [ ] Optimize slow queries

## Phase 12: Security

### Authentication
- [ ] Implement JWT verification on backend
- [ ] Implement token expiration
- [ ] Implement token refresh
- [ ] Test authentication security

### Authorization
- [ ] Verify user owns resources
- [ ] Verify buyer owns purchase
- [ ] Implement role-based access control
- [ ] Test authorization

### Data Protection
- [ ] Encrypt sensitive data in transit (HTTPS)
- [ ] Encrypt sensitive data at rest
- [ ] Implement rate limiting
- [ ] Test security measures

### Input Sanitization
- [ ] Sanitize user inputs
- [ ] Prevent SQL injection
- [ ] Prevent XSS attacks
- [ ] Test security

## Phase 13: Testing

### Unit Tests
- [ ] Write tests for API endpoints
- [ ] Write tests for services
- [ ] Write tests for hooks
- [ ] Run tests

### Integration Tests
- [ ] Test authentication flow
- [ ] Test marketplace flow
- [ ] Test purchase flow
- [ ] Test review flow
- [ ] Run integration tests

### E2E Tests
- [ ] Test complete user journey (seller)
- [ ] Test complete user journey (buyer)
- [ ] Test error scenarios
- [ ] Run E2E tests

## Phase 14: Monitoring & Logging

### Logging
- [ ] Implement structured logging on backend
- [ ] Implement error logging
- [ ] Implement request logging
- [ ] Test logging

### Monitoring
- [ ] Setup health check endpoint
- [ ] Implement metrics collection
- [ ] Setup alerts
- [ ] Test monitoring

### Debugging
- [ ] Implement debug logging
- [ ] Setup error tracking (Sentry)
- [ ] Test debugging

## Phase 15: Deployment Preparation

### Documentation
- [ ] Document API endpoints
- [ ] Document environment variables
- [ ] Document deployment process
- [ ] Document troubleshooting

### Configuration
- [ ] Setup production environment variables
- [ ] Configure CORS for production
- [ ] Configure rate limiting
- [ ] Setup SSL/TLS

### Deployment
- [ ] Deploy backend to production
- [ ] Deploy frontend to production
- [ ] Setup CI/CD pipeline
- [ ] Test production deployment

## Verification Checklist

### Frontend
- [ ] All pages load without errors
- [ ] All forms work correctly
- [ ] All API calls succeed
- [ ] JWT tokens are managed correctly
- [ ] Encryption/decryption works
- [ ] WebSocket events are received
- [ ] Error messages are displayed
- [ ] Loading states are shown

### Backend
- [ ] All endpoints respond correctly
- [ ] Database operations work
- [ ] Blockchain transactions execute
- [ ] Indexer synchronizes events
- [ ] WebSocket broadcasts events
- [ ] Error handling works
- [ ] Logging works
- [ ] Health check passes

### Integration
- [ ] Frontend connects to backend
- [ ] Authentication flow works end-to-end
- [ ] Marketplace flow works end-to-end
- [ ] Purchase flow works end-to-end
- [ ] Review flow works end-to-end
- [ ] Encryption flow works end-to-end
- [ ] Real-time updates work
- [ ] Error recovery works

## Notes

- Keep this checklist updated as you progress
- Mark items as complete when verified
- Add any additional items specific to your implementation
- Use this as a reference for testing
