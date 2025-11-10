# Frontend-Backend Integration Summary

## Overview

This document provides a complete integration guide for connecting the SourceNet frontend (Next.js) with the SourceNet backend (Express.js + Sui blockchain).

## Key Integration Points

### 1. API Communication
- **Frontend Base URL**: `http://localhost:3001/api`
- **Frontend WebSocket URL**: `ws://localhost:3001`
- **Authentication**: JWT tokens in Authorization header
- **Request Format**: JSON with Content-Type headers
- **Response Format**: Standardized API responses with success/data/error fields

### 2. Authentication Flow
```
User → Frontend (ZKLogin) → Backend (verify JWT) → Database
                              ↓
                        Generate JWT Token
                              ↓
                        Return to Frontend
                              ↓
                        Store in localStorage
```

### 3. Data Flow Architecture

#### Marketplace Flow
```
Frontend (Browse) → GET /marketplace/datapods → Backend (Query DB + Cache)
                                                    ↓
                                            Return Paginated Results
```

#### Purchase Flow
```
Frontend (Buy) → POST /buyer/purchase → Backend (Create Escrow)
                                            ↓
                                    Lock Payment on Blockchain
                                            ↓
                                    Fulfillment Job (BullMQ)
                                            ↓
                                    Download from S3
                                            ↓
                                    Encrypt with Buyer Key
                                            ↓
                                    Upload to Walrus
                                            ↓
                                    Update Blockchain
                                            ↓
                                    Release Payment
                                            ↓
                                    Return Download URL
```

#### Encryption Flow
```
Seller → Upload File → S3
                        ↓
                    Calculate Hash
                        ↓
                    Publish DataPod
                        ↓
Buyer → Create Purchase → Generate X25519 Keypair
                            ↓
                        Send Public Key to Backend
                            ↓
                        Backend Encrypts File:
                        - Generate Ephemeral Key
                        - Encrypt Ephemeral Key with Buyer Public Key (X25519)
                        - Encrypt File with Ephemeral Key (AES-256-GCM)
                            ↓
                        Upload to Walrus
                            ↓
Buyer → Download → Decrypt Ephemeral Key with Private Key
                    ↓
                Decrypt File with Ephemeral Key
```

## Environment Variables Required

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.devnet.sui.io:443
NEXT_PUBLIC_SUI_NETWORK=devnet
NEXT_PUBLIC_ZKLOGIN_CLIENT_ID=your_google_oauth_client_id
NEXT_PUBLIC_ZKLOGIN_REDIRECT_URL=http://localhost:3000/auth/callback
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
```

### Backend (.env.local)
```env
# Core
NODE_ENV=development
PORT=3001
LOG_LEVEL=debug

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sourcenet_db
REDIS_URL=redis://localhost:6379

# Blockchain
SUI_RPC_URL=https://fullnode.devnet.sui.io:443
SUI_NETWORK=devnet
SUI_PACKAGE_ID=your_deployed_package_id
SUI_ADMIN_ADDRESS=your_admin_address
SUI_ADMIN_SECRET_KEY=your_admin_secret_key

# Storage
WALRUS_RPC_URL=https://walrus-testnet-rpc.allthatnode.com:8545
WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.allthatnode.com
WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.allthatnode.com
AWS_S3_BUCKET=sourcenet-uploads
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_UPLOAD_EXPIRY_HOURS=24

# Security
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRY=7d
ZKLOGIN_CLIENT_ID=your_google_oauth_client_id
ZKLOGIN_CLIENT_SECRET=your_google_oauth_client_secret
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@sourcenet.com

# Indexer
INDEXER_POLL_INTERVAL_MS=3000
INDEXER_BATCH_SIZE=100
INDEXER_CHECKPOINT_SAVE_INTERVAL=10

# WebSocket
WS_PORT=3001
WS_PING_INTERVAL=30000
WS_PING_TIMEOUT=5000

# Monitoring
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
PAGERDUTY_API_KEY=your_pagerduty_key
ENABLE_ALERTS=true
```

## API Endpoints Summary

### Authentication
- `POST /api/auth/zklogin/callback` - ZKLogin verification
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout

### Marketplace
- `GET /api/marketplace/datapods` - List datapods (paginated, filtered)
- `GET /api/marketplace/datapods/:id` - Get datapod details
- `GET /api/marketplace/search` - Search datapods
- `GET /api/marketplace/top-rated` - Get top-rated datapods
- `GET /api/marketplace/categories` - Get categories

### Seller
- `POST /api/seller/upload-data` - Upload file
- `POST /api/seller/publish-datapod` - Publish datapod
- `GET /api/seller/datapods` - Get seller's datapods
- `GET /api/seller/stats` - Get seller statistics

### Buyer
- `POST /api/buyer/purchase` - Create purchase
- `GET /api/buyer/purchase/:id` - Get purchase status
- `GET /api/buyer/purchase/:id/details` - Get purchase details
- `GET /api/buyer/download/:id` - Get download URL
- `GET /api/buyer/purchases` - Get my purchases

### Reviews
- `POST /api/review` - Create review
- `GET /api/review/datapod/:id` - Get datapod reviews
- `GET /api/review/my-reviews` - Get my reviews
- `DELETE /api/review/:id` - Delete review

### Health
- `GET /health` - Health check
- `GET /health/websocket` - WebSocket status

## Frontend Hooks Updated

All hooks in `app/hooks/useApi.ts` have been updated to use correct backend endpoints:

- `useGetDataPods()` → `GET /marketplace/datapods`
- `useGetDataPod()` → `GET /marketplace/datapods/:id`
- `useSearchDataPods()` → `GET /marketplace/search`
- `usePublishDataPod()` → `POST /seller/publish-datapod`
- `useCreatePurchase()` → `POST /buyer/purchase`
- `useGetPurchaseStatus()` → `GET /buyer/purchase/:id`
- `useGetMyPurchases()` → `GET /buyer/purchases`
- `useGetMyDataPods()` → `GET /seller/datapods`
- `useUploadFile()` → `POST /seller/upload-data`
- `useGetUserStats()` → `GET /seller/stats`
- `useAddReview()` → `POST /review`

## Database Models

Frontend types should align with backend Prisma models:

- **User** - User profiles with reputation
- **DataPod** - Marketplace listings
- **PurchaseRequest** - Purchase transactions
- **Review** - Ratings and comments
- **UploadStaging** - Temporary file storage
- **EscrowTransaction** - Payment escrow
- **TransactionAudit** - Compliance logging
- **IndexerCheckpoint** - Event tracking

## WebSocket Events

Real-time updates via WebSocket:

- `datapod.published` - New datapod published
- `purchase.completed` - Purchase fulfilled
- `review.added` - New review submitted

## Security Considerations

1. **Authentication**: JWT tokens with expiration
2. **Authorization**: Verify user owns resources
3. **Encryption**: Hybrid encryption for data (X25519 + AES-256-GCM)
4. **Rate Limiting**: Prevent abuse
5. **Input Validation**: Zod schemas on backend
6. **CORS**: Configured for frontend origin
7. **HTTPS**: Required for production
8. **Secrets**: Never commit .env files

## Testing Strategy

1. **Unit Tests**: Test individual functions
2. **Integration Tests**: Test API flows
3. **E2E Tests**: Test complete user journeys
4. **Security Tests**: Test authentication/authorization
5. **Performance Tests**: Test under load

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] Smart contracts deployed
- [ ] SSL/TLS certificates installed
- [ ] CORS configured for production
- [ ] Rate limiting configured
- [ ] Monitoring and alerts setup
- [ ] Backup strategy implemented
- [ ] CI/CD pipeline configured
- [ ] Load testing completed

## Troubleshooting Guide

### CORS Errors
- Check `CORS_ORIGIN` includes frontend URL
- Verify backend is running
- Clear browser cache

### 401 Unauthorized
- Verify JWT token is stored
- Check token hasn't expired
- Verify Authorization header format

### WebSocket Connection Failed
- Check WebSocket URL is correct
- Verify WebSocket server is running
- Check firewall settings

### File Upload Fails
- Verify S3 credentials
- Check file size limits
- Verify CORS on S3 bucket

### Encryption Issues
- Verify X25519 keypair generation
- Check AES-256-GCM implementation
- Verify key encoding (base64)

## Next Steps

1. **Setup Environment**: Configure .env files
2. **Start Services**: PostgreSQL, Redis, Backend, Frontend
3. **Test Connectivity**: Verify API calls work
4. **Implement Features**: Follow integration checklist
5. **Test Flows**: Complete user journeys
6. **Deploy**: Move to production

## Documentation Files

- `INTEGRATION_GUIDE.md` - Detailed endpoint documentation
- `ENV_SETUP.md` - Environment setup instructions
- `INTEGRATION_CHECKLIST.md` - Phase-by-phase checklist
- `INTEGRATION_SUMMARY.md` - This file

## Support

For issues or questions:
1. Check troubleshooting guide
2. Review integration checklist
3. Check backend logs
4. Check frontend console
5. Verify environment variables

## Version Info

- Frontend: Next.js 16.0.1, React 19.2.0
- Backend: Express.js, Prisma ORM
- Database: PostgreSQL 15
- Cache: Redis 7
- Blockchain: Sui devnet
- Storage: Walrus testnet, AWS S3
