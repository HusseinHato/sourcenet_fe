# Quick Reference Guide

## Frontend Setup (5 minutes)

```bash
cd sourcenet-fe
npm install
# Create .env.local with variables from ENV_SETUP.md
npm run dev
# Visit http://localhost:3000
```

## Backend Setup (5 minutes)

```bash
cd sourcenet-backend
npm install
# Create .env.local with variables from ENV_SETUP.md
npx prisma migrate dev
npm run dev
# Visit http://localhost:3001/health
```

## Environment Variables Quick Copy

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.devnet.sui.io:443
NEXT_PUBLIC_SUI_NETWORK=devnet
NEXT_PUBLIC_ZKLOGIN_CLIENT_ID=your_client_id
NEXT_PUBLIC_ZKLOGIN_REDIRECT_URL=http://localhost:3000/auth/callback
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
```

### Backend (.env.local - Minimal)
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

## Docker Services (Optional)

```bash
# PostgreSQL
docker run --name sourcenet-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=sourcenet_db -p 5432:5432 -d postgres:15

# Redis
docker run --name sourcenet-redis -p 6379:6379 -d redis:7-alpine
```

## API Endpoint Quick Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/zklogin/callback` | Login with ZKLogin |
| GET | `/auth/me` | Get current user |
| GET | `/marketplace/datapods` | List datapods |
| GET | `/marketplace/datapods/:id` | Get datapod details |
| POST | `/seller/upload-data` | Upload file |
| POST | `/seller/publish-datapod` | Publish datapod |
| POST | `/buyer/purchase` | Create purchase |
| GET | `/buyer/purchase/:id` | Get purchase status |
| GET | `/buyer/download/:id` | Download data |
| POST | `/review` | Submit review |
| GET | `/health` | Health check |

## Frontend Hooks Quick Reference

```typescript
// Marketplace
useGetDataPods(page, limit, filters)
useGetDataPod(id)
useSearchDataPods(query, page)

// Seller
usePublishDataPod()
useUploadFile()
useGetMyDataPods()
useGetUserStats()

// Buyer
useCreatePurchase()
useGetPurchaseStatus(id)
useGetMyPurchases()

// Reviews
useAddReview()
```

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| CORS Error | Check `CORS_ORIGIN` in backend .env |
| 401 Unauthorized | Verify JWT token in localStorage |
| API not found | Check endpoint URL in hook |
| Database error | Run `npx prisma migrate dev` |
| Redis error | Verify Redis is running on 6379 |
| WebSocket failed | Check `NEXT_PUBLIC_WS_URL` |

## Testing Endpoints

```bash
# Health check
curl http://localhost:3001/health

# List datapods
curl http://localhost:3001/api/marketplace/datapods

# With auth token
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/auth/me
```

## File Structure

```
sourcenet-fe/
├── app/
│   ├── (auth)/          # Auth pages
│   ├── buyer/           # Buyer pages
│   ├── seller/          # Seller pages
│   ├── marketplace/     # Marketplace pages
│   ├── components/      # Reusable components
│   ├── hooks/           # React hooks (useApi, useZKLogin)
│   ├── store/           # Zustand stores
│   ├── types/           # TypeScript types
│   └── utils/           # Utilities (api.client)
├── INTEGRATION_GUIDE.md
├── ENV_SETUP.md
├── INTEGRATION_CHECKLIST.md
└── INTEGRATION_SUMMARY.md
```

## Key Files to Update

1. **app/utils/api.client.ts** - ✅ Updated
2. **app/hooks/useApi.ts** - ✅ Updated
3. **app/hooks/useZKLogin.ts** - Needs ZKLogin implementation
4. **app/store/userStore.ts** - Needs user management
5. **app/store/encryptionStore.ts** - Needs key management

## Verification Steps

1. Frontend loads at `http://localhost:3000` ✓
2. Backend responds at `http://localhost:3001/health` ✓
3. API calls work in browser DevTools Network tab
4. JWT token appears in Authorization header
5. WebSocket connects (check browser console)
6. Datapods load in marketplace
7. File upload works
8. Purchase flow completes
9. Download works
10. Reviews can be submitted

## Performance Tips

- Enable Redis caching on backend
- Use React Query for client-side caching
- Implement pagination (20 items per page)
- Add loading states to UI
- Implement error boundaries
- Use lazy loading for images
- Optimize database queries with indexes

## Security Checklist

- [ ] JWT_SECRET is strong (32+ chars)
- [ ] CORS_ORIGIN is restricted
- [ ] HTTPS enabled in production
- [ ] Rate limiting configured
- [ ] Input validation on backend
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Sensitive data encrypted
- [ ] Logs don't contain secrets

## Monitoring Commands

```bash
# Check backend logs
docker logs sourcenet-backend

# Check database
psql -U user -d sourcenet_db -c "SELECT COUNT(*) FROM users;"

# Check Redis
redis-cli PING

# Check API response time
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/health
```

## Useful Links

- [Sui Documentation](https://docs.sui.io)
- [Walrus Documentation](https://docs.walrus.network)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## Next Steps After Integration

1. Implement ZKLogin flow
2. Deploy smart contracts
3. Setup Walrus storage
4. Configure AWS S3
5. Setup email notifications
6. Implement monitoring
7. Setup CI/CD pipeline
8. Deploy to production

## Support Resources

- Check `INTEGRATION_GUIDE.md` for detailed endpoint docs
- Check `ENV_SETUP.md` for setup instructions
- Check `INTEGRATION_CHECKLIST.md` for phase-by-phase guide
- Check `INTEGRATION_SUMMARY.md` for architecture overview
- Check backend logs for errors
- Check browser console for frontend errors
- Check Network tab in DevTools for API calls

## Quick Debugging

```typescript
// Check API client
import { apiClient, getAuthToken } from '@/app/utils/api.client';
console.log('Token:', getAuthToken());
console.log('API URL:', apiClient.defaults.baseURL);

// Check store
import { useUserStore } from '@/app/store/userStore';
const { user } = useUserStore();
console.log('User:', user);

// Test API call
const response = await apiClient.get('/marketplace/datapods');
console.log('Response:', response.data);
```

## Common Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linter

# Backend
npm run dev          # Start dev server
npm run build        # Build for production
npm run test         # Run tests
npx prisma studio   # Open Prisma Studio

# Database
npx prisma migrate dev      # Run migrations
npx prisma db push          # Sync schema
npx prisma db seed          # Seed database
```

## Environment Variable Checklist

### Frontend Required
- [ ] NEXT_PUBLIC_API_URL
- [ ] NEXT_PUBLIC_WS_URL
- [ ] NEXT_PUBLIC_SUI_RPC_URL
- [ ] NEXT_PUBLIC_SUI_NETWORK

### Backend Required
- [ ] NODE_ENV
- [ ] PORT
- [ ] DATABASE_URL
- [ ] REDIS_URL
- [ ] JWT_SECRET
- [ ] SUI_RPC_URL
- [ ] SUI_NETWORK
- [ ] CORS_ORIGIN

## Success Indicators

✅ Frontend loads without errors
✅ Backend health check passes
✅ API calls return 200 status
✅ JWT tokens are stored
✅ Datapods display in marketplace
✅ File upload completes
✅ Purchase flow works
✅ Download URL is generated
✅ Reviews can be submitted
✅ WebSocket events are received

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Ready for Integration
