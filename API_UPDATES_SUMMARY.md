# API Updates Summary

## Changes Made to Match Backend Specification

### 1. ✅ useZKLogin.ts - Updated
**Changes**:
- Changed login function signature from `login(jwtToken)` to `login(address, email?, username?)`
- Updated request body to match backend spec: `{ address, email, username }`
- Updated response parsing to match backend format: `data.data.token` and `data.data.user`
- Added proper error handling with detailed messages
- Added `setAuthToken()` call to update API client headers
- Added response validation

**Before**:
```typescript
const login = useCallback(async (jwtToken: string): Promise<boolean> => {
  const response = await fetch('/api/auth/zklogin', {
    method: 'POST',
    body: JSON.stringify({ jwt: jwtToken }),
  });
  const data = await response.json();
  const user: User = {
    address: data.address,
    email: data.email,
    username: data.username,
  };
});
```

**After**:
```typescript
const login = useCallback(async (address: string, email?: string, username?: string): Promise<boolean> => {
  const response = await fetch(`${apiUrl}/auth/zklogin/callback`, {
    method: 'POST',
    body: JSON.stringify({ address, email, username }),
  });
  const data = await response.json();
  const user: User = {
    address: data.data.user.address,
    email: data.data.user.email,
    username: data.data.user.username,
  };
  setAuthToken(data.data.token);
});
```

---

### 2. ✅ useApi.ts - All Hooks Updated

#### useGetDataPods()
**Changes**:
- Added proper type definitions for filter parameters
- Parameters: `sort_by`, `price_min`, `price_max` (matching backend)

#### useGetDataPod()
**Changes**:
- Updated response parsing: `response.data.data` (matching backend format)

#### useSearchDataPods()
**Changes**:
- Added `limit` parameter
- Added validation: `query.length >= 2`

#### usePublishDataPod()
**Changes**:
- Updated endpoint: `/seller/publish-datapod` → `/seller/publish`
- Updated request body type: `{ upload_id: string }`

#### useCreatePurchase()
**Changes**:
- Added proper type definitions for request body
- Parameters: `datapod_id`, `buyer_address`, `buyer_public_key`

#### useGetPurchaseStatus()
**Changes**:
- Updated refetch interval: 2000ms → 3000ms

#### useGetMyPurchases()
**Changes**:
- Added pagination parameters: `page`, `limit`
- Updated endpoint: `/buyer/purchases` → `/buyer/purchase`

#### useGetMyDataPods()
**Changes**:
- Updated response parsing: `response.data.datapods`

#### useUploadFile()
**Changes**:
- Updated endpoint: `/seller/upload-data` → `/seller/upload`
- Added proper metadata structure
- Parameters now include: `title`, `category`, `price_sui`, `description`, `tags`

#### useGetUserStats()
**Changes**:
- Updated response parsing: `response.data.stats`

#### useAddReview()
**Changes**:
- Added proper type definitions for request body
- Parameters: `purchaseRequestId`, `datapodId`, `rating`, `comment`

---

## API Endpoint Mapping

### Authentication
| Endpoint | Method | Before | After | Status |
|----------|--------|--------|-------|--------|
| ZKLogin | POST | `/api/auth/zklogin` | `/api/auth/zklogin/callback` | ✅ Updated |
| Get User | GET | `/api/auth/me` | `/api/auth/me` | ✅ Verified |
| Update Profile | PUT | `/api/auth/profile` | `/api/auth/profile` | ✅ Verified |
| Logout | POST | `/api/auth/logout` | `/api/auth/logout` | ✅ Verified |

### Marketplace
| Endpoint | Method | Before | After | Status |
|----------|--------|--------|-------|--------|
| List Datapods | GET | `/marketplace/datapods` | `/marketplace/datapods` | ✅ Verified |
| Get Datapod | GET | `/marketplace/datapods/:id` | `/marketplace/datapods/:id` | ✅ Verified |
| Search | GET | `/marketplace/search` | `/marketplace/search` | ✅ Verified |
| Browse | GET | N/A | `/marketplace/browse` | ✅ Added |
| Top Rated | GET | `/marketplace/top-rated` | `/marketplace/top-rated` | ✅ Verified |
| Categories | GET | `/marketplace/categories` | `/marketplace/categories` | ✅ Verified |

### Seller
| Endpoint | Method | Before | After | Status |
|----------|--------|--------|-------|--------|
| Upload | POST | `/seller/upload-data` | `/seller/upload` | ✅ Updated |
| Publish | POST | `/seller/publish-datapod` | `/seller/publish` | ✅ Updated |
| Get Datapods | GET | `/seller/datapods` | `/seller/datapods` | ✅ Verified |
| Get Stats | GET | `/seller/stats` | `/seller/stats` | ✅ Verified |

### Buyer
| Endpoint | Method | Before | After | Status |
|----------|--------|--------|-------|--------|
| Create Purchase | POST | `/buyer/purchase` | `/buyer/purchase` | ✅ Verified |
| Get Purchase Status | GET | `/buyer/purchase/:id` | `/buyer/purchase/:id` | ✅ Verified |
| Get Purchases | GET | `/buyer/purchases` | `/buyer/purchase` | ✅ Updated |
| Download | GET | `/buyer/download/:id` | `/buyer/download/:id` | ✅ Verified |

### Reviews
| Endpoint | Method | Before | After | Status |
|----------|--------|--------|-------|--------|
| Create Review | POST | `/review` | `/review` | ✅ Verified |
| Get Reviews | GET | `/review/datapod/:id` | `/review/datapod/:id` | ✅ Verified |
| My Reviews | GET | `/review/my-reviews` | `/review/my-reviews` | ✅ Verified |
| Delete Review | DELETE | `/review/:id` | `/review/:id` | ✅ Verified |

---

## Request/Response Format Updates

### ZKLogin Request
**Before**:
```json
{ "jwt": "token" }
```

**After**:
```json
{
  "address": "0x...",
  "email": "user@example.com",
  "username": "username"
}
```

### ZKLogin Response
**Before**:
```json
{
  "data": {
    "token": "...",
    "address": "0x...",
    "email": "..."
  }
}
```

**After**:
```json
{
  "status": "success",
  "data": {
    "token": "...",
    "user": {
      "id": "...",
      "address": "0x...",
      "username": "...",
      "email": "..."
    }
  }
}
```

### File Upload Request
**Before**:
```
POST /seller/upload-data
FormData: { file, metadata }
```

**After**:
```
POST /seller/upload
FormData: { 
  file, 
  metadata: JSON.stringify({
    title, category, price_sui, description, tags
  })
}
```

### File Upload Response
**Before**:
```json
{
  "success": true,
  "data": { "uploadId": "..." }
}
```

**After**:
```json
{
  "status": "success",
  "upload_id": "...",
  "data_hash": "...",
  "preview_data": "...",
  "file_size": 1024,
  "message": "File uploaded successfully. Ready to publish."
}
```

---

## Query Parameters Updates

### Marketplace Datapods
**Before**:
```
page, limit, filters (category, sort_by, price_min, price_max, search)
```

**After**:
```
page, limit, category, sort_by, price_min, price_max, search
```

### Search
**Before**:
```
q, page
```

**After**:
```
q (min 2 chars), page, limit
```

---

## Type Definitions Updated

### useCreatePurchase()
```typescript
{
  datapod_id: string;
  buyer_address: string;
  buyer_public_key: string;
}
```

### useUploadFile()
```typescript
{
  file: File;
  title: string;
  category: string;
  price_sui: number;
  description?: string;
  tags?: string[];
}
```

### useAddReview()
```typescript
{
  purchaseRequestId: string;
  datapodId: string;
  rating: number;
  comment?: string;
}
```

---

## Error Handling Improvements

### Before
```typescript
if (!response.ok) {
  throw new Error('ZKLogin failed');
}
```

### After
```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  const errorMessage = errorData.error?.message || `ZKLogin failed with status ${response.status}`;
  throw new Error(errorMessage);
}
```

---

## Files Modified

1. ✅ `app/hooks/useZKLogin.ts` - Login function signature and response handling
2. ✅ `app/hooks/useApi.ts` - All 11 hooks updated with correct endpoints and types

## Files Created

1. ✅ `API_SPECIFICATION.md` - Complete API specification document
2. ✅ `API_UPDATES_SUMMARY.md` - This file

---

## Testing Checklist

- [ ] ZKLogin with address, email, username
- [ ] Get current user profile
- [ ] List datapods with filters
- [ ] Search datapods (min 2 chars)
- [ ] Get datapod details
- [ ] Upload file with metadata
- [ ] Publish datapod with upload_id
- [ ] Create purchase with buyer keys
- [ ] Get purchase status (polling)
- [ ] Download purchased data
- [ ] Submit review
- [ ] Get seller stats

---

## Migration Guide

### For Components Using Old API

**Before**:
```typescript
const { login } = useZKLogin();
await login(jwtToken);
```

**After**:
```typescript
const { login } = useZKLogin();
await login(address, email, username);
```

**Before**:
```typescript
const { mutate } = useUploadFile();
mutate(file);
```

**After**:
```typescript
const { mutate } = useUploadFile();
mutate({ file, title, category, price_sui, description, tags });
```

**Before**:
```typescript
const { mutate } = useCreatePurchase();
mutate(data);
```

**After**:
```typescript
const { mutate } = useCreatePurchase();
mutate({ datapod_id, buyer_address, buyer_public_key });
```

---

## Status

✅ **All API endpoints updated to match backend specification**
✅ **All request/response formats aligned**
✅ **All type definitions corrected**
✅ **Error handling improved**
✅ **Documentation created**

---

**Last Updated**: 2024
**Version**: 2.0
**Status**: Ready for testing
