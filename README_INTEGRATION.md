# SourceNet Frontend-Backend Integration

## 📖 Start Here

Welcome! This document guides you through the complete frontend-backend integration for SourceNet.

### What is SourceNet?
A decentralized data marketplace powered by Sui blockchain where:
- **Sellers** can upload, encrypt, and sell datasets
- **Buyers** can purchase encrypted data with escrow protection
- **All transactions** are secured on-chain with smart contracts
- **Data** is encrypted end-to-end using X25519 + AES-256-GCM
- **Storage** uses Walrus for decentralized blob storage

---

## 🚀 Quick Start (Choose Your Path)

### ⚡ I want to get started NOW (5 minutes)
→ Go to **QUICK_REFERENCE.md**
- Setup commands
- Environment variables
- Common commands
- Quick debugging

### 📚 I want detailed documentation
→ Go to **INTEGRATION_GUIDE.md**
- Every endpoint with examples
- Request/response formats
- WebSocket events
- Complete troubleshooting

### 🛠️ I want to set up step-by-step
→ Go to **ENV_SETUP.md**
- Frontend setup
- Backend setup
- Database setup
- Service verification

### ✅ I want a checklist to follow
→ Go to **INTEGRATION_CHECKLIST.md**
- 15 phases of integration
- Specific tasks for each phase
- Testing requirements
- Progress tracking

### 🏗️ I want to understand the architecture
→ Go to **INTEGRATION_SUMMARY.md**
- Data flow diagrams
- API endpoints overview
- Database models
- Security considerations

### 🔐 I need all environment variables
→ Go to **ENV_VARIABLES_COMPLETE.md**
- All variables explained
- Generation guide
- Security best practices
- Validation checklist

---

## 📋 Documentation Index

| Document | Purpose | Best For |
|----------|---------|----------|
| **QUICK_REFERENCE.md** | Fast setup and commands | Getting started quickly |
| **ENV_SETUP.md** | Environment configuration | Setting up .env files |
| **INTEGRATION_GUIDE.md** | Detailed endpoint docs | Understanding APIs |
| **INTEGRATION_CHECKLIST.md** | Phase-by-phase guide | Tracking progress |
| **INTEGRATION_SUMMARY.md** | Architecture overview | Understanding design |
| **ENV_VARIABLES_COMPLETE.md** | All variables reference | Configuring environment |
| **INTEGRATION_COMPLETE.md** | Complete package summary | Overview of everything |
| **README_INTEGRATION.md** | This file | Navigation guide |

---

## 🎯 What's Been Done

### ✅ Code Updates
- Frontend API client configured
- All API hooks updated with correct endpoints
- Proper error handling and timeouts
- JWT token management

### ✅ Documentation
- 8 comprehensive guides created
- 25+ API endpoints documented
- 40+ environment variables documented
- 15-phase integration checklist
- Architecture diagrams and flows

### ✅ Environment Variables
- Frontend variables documented
- Backend variables documented
- Generation guide provided
- Security best practices included

### ✅ Integration Points
- Authentication flow mapped
- Marketplace flow mapped
- Purchase flow mapped
- Encryption flow mapped
- Review flow mapped
- WebSocket events documented

---

## 🔗 API Endpoints at a Glance

### Authentication
```
POST   /auth/zklogin/callback    - Login with ZKLogin
GET    /auth/me                  - Get current user
PUT    /auth/profile             - Update profile
POST   /auth/logout              - Logout
```

### Marketplace
```
GET    /marketplace/datapods     - List datapods
GET    /marketplace/datapods/:id - Get datapod details
GET    /marketplace/search       - Search datapods
GET    /marketplace/top-rated    - Top-rated datapods
GET    /marketplace/categories   - Get categories
```

### Seller
```
POST   /seller/upload-data       - Upload file
POST   /seller/publish-datapod   - Publish datapod
GET    /seller/datapods         - Get seller's datapods
GET    /seller/stats            - Get seller statistics
```

### Buyer
```
POST   /buyer/purchase           - Create purchase
GET    /buyer/purchase/:id       - Get purchase status
GET    /buyer/download/:id       - Get download URL
GET    /buyer/purchases         - Get my purchases
```

### Reviews
```
POST   /review                   - Submit review
GET    /review/datapod/:id      - Get datapod reviews
GET    /review/my-reviews       - Get my reviews
DELETE /review/:id              - Delete review
```

---

## 🌍 Environment Variables Quick Setup

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.devnet.sui.io:443
NEXT_PUBLIC_SUI_NETWORK=devnet
NEXT_PUBLIC_ZKLOGIN_CLIENT_ID=your_client_id
NEXT_PUBLIC_ZKLOGIN_REDIRECT_URL=http://localhost:3000/auth/callback
```

### Backend (.env.local)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/sourcenet_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
SUI_RPC_URL=https://fullnode.devnet.sui.io:443
SUI_NETWORK=devnet
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

**See ENV_VARIABLES_COMPLETE.md for all 40+ variables**

---

## 🚀 Setup Steps

### 1. Frontend Setup
```bash
cd sourcenet-fe
npm install
# Create .env.local with variables above
npm run dev
# Visit http://localhost:3000
```

### 2. Backend Setup
```bash
cd sourcenet-backend
npm install
# Create .env.local with variables above
npx prisma migrate dev
npm run dev
# Visit http://localhost:3001/health
```

### 3. Services Setup
```bash
# PostgreSQL
docker run --name sourcenet-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=sourcenet_db -p 5432:5432 -d postgres:15

# Redis
docker run --name sourcenet-redis -p 6379:6379 -d redis:7-alpine
```

---

## 🔄 Data Flow Overview

### Purchase Flow
```
Buyer Creates Purchase
    ↓
Backend Creates Escrow
    ↓
Fulfillment Job Starts
    ↓
Download File from S3
    ↓
Encrypt with Buyer's Public Key
    ↓
Upload to Walrus
    ↓
Update Blockchain
    ↓
Release Payment
    ↓
Return Download URL
    ↓
Buyer Downloads & Decrypts
```

### Encryption Flow
```
Seller Uploads File
    ↓
Calculate SHA-256 Hash
    ↓
Store in S3
    ↓
Buyer Purchases
    ↓
Generate X25519 Keypair
    ↓
Send Public Key to Backend
    ↓
Backend Encrypts:
  - Generate Ephemeral Key
  - Encrypt Ephemeral Key with Buyer Public Key
  - Encrypt File with Ephemeral Key (AES-256-GCM)
    ↓
Upload to Walrus
    ↓
Buyer Decrypts:
  - Decrypt Ephemeral Key with Private Key
  - Decrypt File with Ephemeral Key
```

---

## ✅ Verification Checklist

### Frontend
- [ ] Loads at http://localhost:3000
- [ ] No console errors
- [ ] API client configured
- [ ] JWT token management works

### Backend
- [ ] Responds at http://localhost:3001/health
- [ ] Database connected
- [ ] Redis connected
- [ ] All endpoints implemented

### Integration
- [ ] Frontend connects to backend
- [ ] API calls return 200 status
- [ ] JWT tokens sent in headers
- [ ] WebSocket connects
- [ ] Datapods load
- [ ] File upload works
- [ ] Purchase flow works
- [ ] Download works
- [ ] Reviews work

---

## 🐛 Troubleshooting Quick Links

| Problem | Solution |
|---------|----------|
| CORS Error | Check CORS_ORIGIN in .env |
| 401 Unauthorized | Verify JWT token in localStorage |
| API not found | Check endpoint URL in hook |
| Database error | Run `npx prisma migrate dev` |
| Redis error | Check Redis running on 6379 |
| WebSocket failed | Check NEXT_PUBLIC_WS_URL |

See **INTEGRATION_GUIDE.md** for detailed troubleshooting.

---

## 📚 Learning Path

### Day 1: Setup
1. Read QUICK_REFERENCE.md
2. Setup .env files
3. Start services
4. Verify connectivity

### Day 2-3: Authentication
1. Read INTEGRATION_GUIDE.md (Auth section)
2. Implement ZKLogin
3. Test login/logout
4. Verify JWT management

### Day 3-4: Marketplace
1. Read INTEGRATION_GUIDE.md (Marketplace section)
2. Implement datapod listing
3. Add filtering/search
4. Test caching

### Day 4-5: Seller Features
1. Read INTEGRATION_GUIDE.md (Seller section)
2. Implement file upload
3. Implement publishing
4. Create dashboard

### Day 5-6: Buyer Features
1. Read INTEGRATION_GUIDE.md (Buyer section)
2. Implement purchase
3. Implement fulfillment
4. Test encryption

### Day 6-7: Reviews & Testing
1. Implement reviews
2. Run all tests
3. Performance testing
4. Security testing

### Day 7+: Deployment
1. Configure production .env
2. Deploy backend
3. Deploy frontend
4. Monitor and maintain

---

## 🔐 Security Reminders

- ✅ JWT_SECRET is strong (32+ chars)
- ✅ CORS_ORIGIN is restricted
- ✅ HTTPS enabled in production
- ✅ Rate limiting configured
- ✅ Input validation on backend
- ✅ .env files in .gitignore
- ✅ Secrets never committed
- ✅ Sensitive data encrypted

See **ENV_VARIABLES_COMPLETE.md** for security best practices.

---

## 🎯 Success Criteria

Integration is successful when:

✅ Frontend loads without errors
✅ Backend health check passes
✅ API calls return 200 status
✅ JWT tokens work correctly
✅ Datapods display in marketplace
✅ File upload completes
✅ Purchase flow works end-to-end
✅ Download URL is generated
✅ Reviews can be submitted
✅ WebSocket events are received
✅ Real-time updates work
✅ Error handling works properly

---

## 📞 Need Help?

### For Setup Issues
→ Check **ENV_SETUP.md**

### For API Questions
→ Check **INTEGRATION_GUIDE.md**

### For Environment Variables
→ Check **ENV_VARIABLES_COMPLETE.md**

### For Architecture Questions
→ Check **INTEGRATION_SUMMARY.md**

### For Quick Commands
→ Check **QUICK_REFERENCE.md**

### For Progress Tracking
→ Check **INTEGRATION_CHECKLIST.md**

---

## 📊 Project Overview

| Aspect | Details |
|--------|---------|
| **Frontend** | Next.js 16, React 19, TailwindCSS |
| **Backend** | Express.js, Prisma ORM, TypeScript |
| **Database** | PostgreSQL 15 |
| **Cache** | Redis 7 |
| **Blockchain** | Sui devnet |
| **Storage** | Walrus testnet, AWS S3 |
| **Encryption** | X25519 + AES-256-GCM |
| **API Endpoints** | 25+ endpoints |
| **Environment Variables** | 40+ variables |
| **Documentation** | 8 comprehensive guides |

---

## 🎉 You're Ready!

All documentation and code updates are complete. Choose your starting point:

- **Want to start NOW?** → Go to **QUICK_REFERENCE.md**
- **Want detailed docs?** → Go to **INTEGRATION_GUIDE.md**
- **Want to understand architecture?** → Go to **INTEGRATION_SUMMARY.md**
- **Want a checklist?** → Go to **INTEGRATION_CHECKLIST.md**
- **Need environment help?** → Go to **ENV_VARIABLES_COMPLETE.md**

---

## 📝 Version Info

- **Status**: ✅ Complete and Ready
- **Version**: 1.0
- **Last Updated**: 2024
- **Documentation Files**: 8
- **API Endpoints**: 25+
- **Environment Variables**: 40+

---

## 🚀 Next Steps

1. Choose a documentation file above
2. Follow the setup instructions
3. Start the services
4. Verify connectivity
5. Follow the integration checklist
6. Implement features phase by phase
7. Test thoroughly
8. Deploy to production

**Happy coding! 🎉**
