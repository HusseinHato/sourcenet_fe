# Complete Environment Variables Reference

## Frontend Environment Variables (.env.local)

### API Configuration
```env
# Backend API URL (no trailing slash)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# WebSocket URL for real-time updates
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### Sui Blockchain Configuration
```env
# Sui RPC endpoint
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.devnet.sui.io:443

# Sui network (devnet, testnet, mainnet)
NEXT_PUBLIC_SUI_NETWORK=devnet
```

### ZKLogin Configuration
```env
# Google OAuth Client ID (from Google Cloud Console)
NEXT_PUBLIC_ZKLOGIN_CLIENT_ID=your_google_oauth_client_id

# Redirect URL after ZKLogin (must match Google OAuth settings)
NEXT_PUBLIC_ZKLOGIN_REDIRECT_URL=http://localhost:3000/auth/callback
```

### Feature Flags
```env
# Enable WebSocket for real-time updates
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
```

---

## Backend Environment Variables (.env.local)

### Server Configuration
```env
# Environment (development, staging, production)
NODE_ENV=development

# Server port
PORT=3001

# Log level (debug, info, warn, error)
LOG_LEVEL=debug
```

### Database Configuration
```env
# PostgreSQL connection string
# Format: postgresql://username:password@host:port/database
DATABASE_URL=postgresql://user:password@localhost:5432/sourcenet_db

# Redis connection string
REDIS_URL=redis://localhost:6379
```

### Sui Blockchain Configuration
```env
# Sui RPC endpoint
SUI_RPC_URL=https://fullnode.devnet.sui.io:443

# Sui network (devnet, testnet, mainnet)
SUI_NETWORK=devnet

# Deployed package ID (from your smart contract deployment)
SUI_PACKAGE_ID=0x...

# Admin wallet address (for contract interactions)
SUI_ADMIN_ADDRESS=0x...

# Admin wallet secret key (keep this secret!)
SUI_ADMIN_SECRET_KEY=your_admin_secret_key
```

### Walrus Storage Configuration
```env
# Walrus RPC endpoint
WALRUS_RPC_URL=https://walrus-testnet-rpc.allthatnode.com:8545

# Walrus aggregator URL
WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.allthatnode.com

# Walrus publisher URL
WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.allthatnode.com
```

### AWS S3 Configuration (Temporary File Storage)
```env
# S3 bucket name
AWS_S3_BUCKET=sourcenet-uploads

# AWS region
AWS_S3_REGION=us-east-1

# AWS access key ID
AWS_ACCESS_KEY_ID=your_aws_key

# AWS secret access key
AWS_SECRET_ACCESS_KEY=your_aws_secret

# S3 upload expiry in hours (files auto-deleted after this time)
S3_UPLOAD_EXPIRY_HOURS=24
```

### JWT Configuration
```env
# JWT secret key (minimum 32 characters, use strong random string)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_here

# JWT expiry time (e.g., 7d, 24h, 1w)
JWT_EXPIRY=7d
```

### ZKLogin Configuration
```env
# Google OAuth Client ID (from Google Cloud Console)
ZKLOGIN_CLIENT_ID=your_google_oauth_client_id

# Google OAuth Client Secret (keep this secret!)
ZKLOGIN_CLIENT_SECRET=your_google_oauth_client_secret
```

### CORS Configuration
```env
# Allowed origins (comma-separated)
# Include frontend URL and any other allowed domains
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### Rate Limiting Configuration
```env
# Rate limit window in milliseconds (15 minutes)
RATE_LIMIT_WINDOW_MS=900000

# Maximum requests per window per user/IP
RATE_LIMIT_MAX_REQUESTS=100
```

### Email Configuration (for Notifications)
```env
# SMTP host
SMTP_HOST=smtp.gmail.com

# SMTP port
SMTP_PORT=587

# SMTP username/email
SMTP_USER=your_email@gmail.com

# SMTP password (use app-specific password for Gmail)
SMTP_PASSWORD=your_app_password

# From email address
SMTP_FROM=noreply@sourcenet.com
```

### Indexer Configuration
```env
# Poll interval for blockchain events in milliseconds
INDEXER_POLL_INTERVAL_MS=3000

# Batch size for processing events
INDEXER_BATCH_SIZE=100

# Interval to save checkpoint in seconds
INDEXER_CHECKPOINT_SAVE_INTERVAL=10
```

### WebSocket Configuration
```env
# WebSocket port (usually same as server port)
WS_PORT=3001

# WebSocket ping interval in milliseconds
WS_PING_INTERVAL=30000

# WebSocket ping timeout in milliseconds
WS_PING_TIMEOUT=5000
```

### Monitoring & Alerts Configuration
```env
# Slack webhook URL (for alerts)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# PagerDuty API key (for incident management)
PAGERDUTY_API_KEY=your_pagerduty_key

# Enable alerts
ENABLE_ALERTS=true
```

---

## Environment Variable Categories

### 🔐 Security Variables (Keep Secret!)
- `JWT_SECRET`
- `SUI_ADMIN_SECRET_KEY`
- `ZKLOGIN_CLIENT_SECRET`
- `AWS_SECRET_ACCESS_KEY`
- `SMTP_PASSWORD`
- `PAGERDUTY_API_KEY`

### 🌐 Public Variables (Safe to Share)
- `NEXT_PUBLIC_*` (all frontend variables)
- `SUI_RPC_URL`
- `WALRUS_RPC_URL`
- `SMTP_HOST`
- `CORS_ORIGIN`

### 📊 Configuration Variables
- `NODE_ENV`
- `PORT`
- `LOG_LEVEL`
- `RATE_LIMIT_*`
- `INDEXER_*`
- `WS_*`

### 🔗 Connection Variables
- `DATABASE_URL`
- `REDIS_URL`
- `SUI_NETWORK`

---

## Variable Generation Guide

### JWT_SECRET
Generate a strong random string (minimum 32 characters):
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY
1. Go to AWS IAM Console
2. Create new user with S3 access
3. Generate access keys
4. Copy Key ID and Secret Key

### ZKLOGIN_CLIENT_ID & ZKLOGIN_CLIENT_SECRET
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Set redirect URI to `http://localhost:3000/auth/callback`
4. Copy Client ID and Client Secret

### SUI_ADMIN_SECRET_KEY
1. Generate Sui keypair using Sui CLI
2. Export private key in base64 format
3. Use as `SUI_ADMIN_SECRET_KEY`

### SLACK_WEBHOOK_URL
1. Go to Slack App Directory
2. Create Incoming Webhook
3. Copy webhook URL

---

## Development vs Production

### Development (.env.local)
```env
NODE_ENV=development
LOG_LEVEL=debug
RATE_LIMIT_MAX_REQUESTS=1000  # Higher limit for testing
INDEXER_POLL_INTERVAL_MS=3000  # Faster polling
```

### Production (.env.production)
```env
NODE_ENV=production
LOG_LEVEL=warn
RATE_LIMIT_MAX_REQUESTS=100  # Strict limit
INDEXER_POLL_INTERVAL_MS=5000  # Slower polling
CORS_ORIGIN=https://sourcenet.com  # Only production domain
```

---

## Validation Checklist

Before starting the application, verify:

- [ ] `DATABASE_URL` is accessible
- [ ] `REDIS_URL` is accessible
- [ ] `JWT_SECRET` is at least 32 characters
- [ ] `SUI_RPC_URL` is reachable
- [ ] `WALRUS_*` URLs are reachable
- [ ] AWS credentials are valid
- [ ] Google OAuth credentials are valid
- [ ] SMTP credentials are valid
- [ ] `CORS_ORIGIN` includes frontend URL
- [ ] All required variables are set
- [ ] No variables contain typos

---

## Common Issues

### "DATABASE_URL is not set"
- Ensure `.env.local` file exists in backend root
- Verify `DATABASE_URL` is spelled correctly
- Check PostgreSQL is running

### "Redis connection failed"
- Verify Redis is running on port 6379
- Check `REDIS_URL` format
- Ensure Redis is accessible from backend

### "CORS error"
- Add frontend URL to `CORS_ORIGIN`
- Include protocol (http/https)
- Separate multiple origins with commas

### "JWT verification failed"
- Ensure `JWT_SECRET` is same on all instances
- Check token hasn't expired
- Verify token format in Authorization header

### "Sui transaction failed"
- Verify `SUI_ADMIN_SECRET_KEY` is valid
- Check `SUI_PACKAGE_ID` is deployed
- Ensure sufficient gas budget
- Check Sui network is accessible

---

## Security Best Practices

1. **Never commit .env files** - Add to .gitignore
2. **Use strong secrets** - Minimum 32 characters for JWT_SECRET
3. **Rotate secrets regularly** - Especially in production
4. **Use environment-specific values** - Different for dev/prod
5. **Restrict access** - Only share secrets with authorized personnel
6. **Use secrets manager** - Consider using AWS Secrets Manager, HashiCorp Vault, etc.
7. **Log securely** - Never log sensitive values
8. **Monitor access** - Track who accesses secrets

---

## Quick Setup Commands

### Generate JWT Secret
```bash
# Linux/Mac
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env.local

# Windows PowerShell
Add-Content .env.local "JWT_SECRET=$([System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)))"
```

### Test Database Connection
```bash
psql $DATABASE_URL -c "SELECT 1;"
```

### Test Redis Connection
```bash
redis-cli -u $REDIS_URL PING
```

### Test Sui RPC
```bash
curl -s $SUI_RPC_URL -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"sui_getChainIdentifier","params":[]}' | jq .
```

---

## Reference Links

- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html)
- [Redis Connection Strings](https://redis.io/docs/clients/redis-cli/)
- [Sui Documentation](https://docs.sui.io)
- [Walrus Documentation](https://docs.walrus.network)
- [AWS S3 Setup](https://docs.aws.amazon.com/s3/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Complete
