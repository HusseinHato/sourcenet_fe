# Environment Setup Guide

## Frontend Environment Variables

Create a `.env.local` file in the root of the frontend project with the following variables:

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

## Backend Environment Variables

Create a `.env.local` file in the root of the backend project with the following variables:

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

## Setup Instructions

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd sourcenet-fe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` with the variables above

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access at `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd sourcenet-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` with the variables above

4. Setup database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Backend runs at `http://localhost:3001`

## Required Services

### PostgreSQL Database
```bash
# Using Docker
docker run --name sourcenet-db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=sourcenet_db \
  -p 5432:5432 \
  -d postgres:15
```

### Redis Cache
```bash
# Using Docker
docker run --name sourcenet-redis \
  -p 6379:6379 \
  -d redis:7-alpine
```

## Verification

### Frontend
- Visit `http://localhost:3000`
- Should see the homepage with "Browse Marketplace" button
- Check browser console for any errors

### Backend
- Visit `http://localhost:3001/health`
- Should return: `{ "status": "ok", "timestamp": "..." }`

### API Connectivity
- Frontend should connect to backend at `http://localhost:3001/api`
- Check Network tab in browser DevTools
- Verify JWT tokens are being sent in Authorization headers

## Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGIN` includes frontend URL
- Check backend is running on correct port
- Verify `NEXT_PUBLIC_API_URL` matches backend URL

### Database Connection Failed
- Verify PostgreSQL is running
- Check `DATABASE_URL` is correct
- Run `npx prisma db push` to sync schema

### Redis Connection Failed
- Verify Redis is running
- Check `REDIS_URL` is correct
- Default: `redis://localhost:6379`

### WebSocket Connection Failed
- Ensure `NEXT_PUBLIC_WS_URL` is correct
- Check WebSocket server is enabled on backend
- Verify firewall allows WebSocket connections

### JWT Token Issues
- Ensure `JWT_SECRET` is set (min 32 chars)
- Check token is being stored in localStorage
- Verify Authorization header format: `Bearer <token>`

## Next Steps

1. Implement ZKLogin flow with Sui SDK
2. Setup Walrus storage integration
3. Deploy smart contracts to Sui testnet
4. Configure AWS S3 for file uploads
5. Setup email notifications
6. Configure monitoring and alerts
