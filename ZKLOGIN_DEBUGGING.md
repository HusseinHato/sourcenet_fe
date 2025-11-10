# ZKLogin Debugging Guide

## "Failed to Fetch" Error - Causes & Solutions

### Root Causes

1. **Backend Not Running**
   - Error: `Failed to fetch` when trying to connect to backend
   - Solution: Ensure backend is running on port 3001
   ```bash
   cd sourcenet-backend
   npm run dev
   ```

2. **Wrong API URL**
   - Error: Endpoint not found
   - Solution: Check `NEXT_PUBLIC_API_URL` in `.env.local`
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

3. **CORS Error**
   - Error: `Failed to fetch` with CORS message in console
   - Solution: Check backend `CORS_ORIGIN` in `.env.local`
   ```env
   CORS_ORIGIN=http://localhost:3000,http://localhost:3001
   ```

4. **Network/Firewall**
   - Error: `Failed to fetch` with no response
   - Solution: Check if ports are accessible
   ```bash
   # Test connectivity
   curl http://localhost:3001/health
   ```

5. **Missing Required Fields**
   - Error: `Failed to fetch` or 400 Bad Request
   - Solution: Ensure all required fields are provided
   - Required: `address` (Sui wallet address)
   - Optional: `email`, `username`

---

## Step-by-Step Debugging

### Step 1: Check Backend Status
```bash
# Terminal 1: Start backend
cd sourcenet-backend
npm run dev

# Terminal 2: Test health endpoint
curl http://localhost:3001/health
# Expected response: { "status": "ok", "timestamp": "..." }
```

### Step 2: Check Frontend Environment
```bash
# Verify .env.local exists
cat .env.local | grep NEXT_PUBLIC_API_URL
# Expected: NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Step 3: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed requests

### Step 4: Test API Directly
```bash
# Test ZKLogin endpoint
curl -X POST http://localhost:3001/api/auth/zklogin/callback \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x1234567890abcdef",
    "email": "test@example.com",
    "username": "testuser"
  }'

# Expected response:
# {
#   "status": "success",
#   "data": {
#     "token": "...",
#     "user": { ... }
#   }
# }
```

---

## Common Error Messages & Solutions

### Error: "Failed to fetch"
**Causes**:
- Backend not running
- Wrong API URL
- Network connectivity issue
- CORS misconfiguration

**Solution**:
```bash
# 1. Check backend is running
curl http://localhost:3001/health

# 2. Check .env.local
cat .env.local

# 3. Check browser console for CORS errors
# If CORS error: Update backend CORS_ORIGIN
```

### Error: "Invalid response: missing token"
**Cause**: Backend response format doesn't match expected format

**Solution**:
```typescript
// Expected response format:
{
  "status": "success",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "...",
      "address": "0x...",
      "username": "...",
      "email": "..."
    }
  }
}
```

### Error: "MISSING_ADDRESS"
**Cause**: Address field is required but not provided

**Solution**:
- Enter your Sui wallet address in the "Sui Address" field
- Format: `0x...` (hex address)

### Error: "ZKLOGIN_ERROR"
**Cause**: Backend ZKLogin verification failed

**Solution**:
- Verify address format is correct
- Check backend logs for details
- Ensure backend is properly configured

---

## Login Page Form Fields

### Required Fields
- **Sui Address** - Your Sui wallet address (format: `0x...`)
  - This is required for authentication
  - Must be a valid Sui address

### Optional Fields
- **Email** - Your email address
  - Used for notifications and account recovery
  - Can be left blank

- **Username** - Your display name
  - Used for profile and marketplace listings
  - Can be left blank

---

## Testing Checklist

- [ ] Backend is running on port 3001
- [ ] Frontend `.env.local` has correct `NEXT_PUBLIC_API_URL`
- [ ] Backend `.env.local` has correct `CORS_ORIGIN`
- [ ] Sui Address field is filled with valid address
- [ ] No CORS errors in browser console
- [ ] Network tab shows successful POST to `/auth/zklogin/callback`
- [ ] Response has `status: 'success'` and `data.token`
- [ ] JWT token is stored in localStorage
- [ ] User is redirected to marketplace

---

## Browser DevTools Debugging

### Console Tab
```javascript
// Check if API URL is correct
console.log(process.env.NEXT_PUBLIC_API_URL);

// Check if token is stored
console.log(localStorage.getItem('authToken'));

// Check user data
console.log(localStorage.getItem('user'));
```

### Network Tab
1. Open DevTools → Network tab
2. Click login button
3. Look for POST request to `/auth/zklogin/callback`
4. Check:
   - Status: Should be 200
   - Request body: Has address, email?, username?
   - Response: Has status, data.token, data.user

### Storage Tab
1. Open DevTools → Storage/Application tab
2. Check localStorage:
   - `authToken` - Should have JWT token
   - `user` - Should have user data

---

## Backend Logs

Check backend console for error details:

```bash
# If using npm run dev, check terminal output
# Look for error messages like:
# - "MISSING_ADDRESS"
# - "User not found"
# - "Database error"
# - "JWT generation failed"
```

---

## Environment Variables Checklist

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.devnet.sui.io:443
NEXT_PUBLIC_SUI_NETWORK=devnet
```

### Backend (.env.local)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/sourcenet_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

---

## Quick Fixes

### "Failed to fetch" - Quick Fix
```bash
# 1. Kill all Node processes
pkill -f node

# 2. Start backend
cd sourcenet-backend
npm run dev

# 3. In another terminal, start frontend
cd sourcenet-fe
npm run dev

# 4. Try login again
```

### CORS Error - Quick Fix
```bash
# Update backend .env.local
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Restart backend
npm run dev
```

### Wrong API URL - Quick Fix
```bash
# Update frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Restart frontend
npm run dev
```

---

## Advanced Debugging

### Enable Debug Logging
```typescript
// In useZKLogin.ts, add console logs
console.log('Login attempt with:', { address, email, username });
console.log('API URL:', apiUrl);
console.log('Response:', data);
```

### Network Inspection
```bash
# Monitor network traffic
curl -v -X POST http://localhost:3001/api/auth/zklogin/callback \
  -H "Content-Type: application/json" \
  -d '{"address":"0x...","email":"test@example.com","username":"user"}'
```

### Database Check
```bash
# Check if user exists in database
psql $DATABASE_URL -c "SELECT * FROM users WHERE zklogin_address = '0x...';"
```

---

## Support Resources

- **Backend Logs**: Check terminal where backend is running
- **Browser Console**: F12 → Console tab
- **Network Tab**: F12 → Network tab
- **API Specification**: See `API_SPECIFICATION.md`
- **Integration Guide**: See `INTEGRATION_GUIDE.md`

---

## Success Indicators

✅ Login form shows 3 fields: Sui Address, Email, Username
✅ Clicking login sends POST to `/auth/zklogin/callback`
✅ Response has status 200 and contains token
✅ Token is stored in localStorage
✅ User is redirected to marketplace
✅ No errors in browser console

---

**Last Updated**: 2024
**Status**: Ready for debugging
