# Quick Test Guide - Auth Persistence

## 🚀 Quick Start Testing

### Prerequisites
- App is running (`npm run dev`)
- Browser DevTools open (F12)
- Backend `/auth/me` endpoint working

---

## Test 1: Login and Refresh ⚡
**Time**: 1 minute

1. Go to `http://localhost:3000/login`
2. Click "Sign in with Google (ZKLogin)"
3. Complete Google login
4. Wait for redirect to marketplace
5. **Press F5 to refresh the page**
6. ✅ **Expected**: User should still be logged in
7. **Check Console**: Look for "Session restored from localStorage"

---

## Test 2: Close and Reopen Tab 🔄
**Time**: 2 minutes

1. Login with ZKLogin (if not already logged in)
2. **Close the browser tab** (Ctrl+W or Cmd+W)
3. **Reopen the website** (type URL or use history)
4. ✅ **Expected**: User should be logged in
5. **Check Console**: Look for "Session restored from localStorage"

---

## Test 3: Logout ❌
**Time**: 1 minute

1. Click **Logout** button (in navbar or sidebar)
2. ✅ **Expected**: Redirected to login page
3. **Press F5 to refresh**
4. ✅ **Expected**: Still on login page (user is logged out)
5. **Check Console**: Look for "User logged out, session cleared"

---

## Test 4: Inspect Stored Data 🔍
**Time**: 2 minutes

1. Login with ZKLogin
2. **Open DevTools** (F12)
3. Go to **Application** tab
4. Click **Local Storage** in left sidebar
5. Click on your domain (e.g., `http://localhost:3000`)
6. Look for these keys:
   - `authToken` - Should contain a JWT token
   - `user` - Should contain user profile JSON
   - `zklogin_user_salt` - Should contain a decimal number

**Example user data**:
```json
{
  "address": "0x1234567890abcdef...",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "buyer",
  "balance": 100,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## Test 5: Clear Data and Relogin 🔐
**Time**: 2 minutes

1. Login with ZKLogin
2. **Open DevTools** (F12)
3. Go to **Application** → **Local Storage**
4. **Right-click** on `authToken` and select **Delete**
5. **Right-click** on `user` and select **Delete**
6. **Refresh the page** (F5)
7. ✅ **Expected**: User should be logged out
8. Login again with ZKLogin
9. ✅ **Expected**: New session should be created

---

## Test 6: Check Console Logs 📋
**Time**: 1 minute

1. Open **DevTools** (F12)
2. Go to **Console** tab
3. Login with ZKLogin
4. Look for logs like:
   - `"Session restored from localStorage"` - On page load
   - `"Generated new user salt"` - First time login
   - `"ZKLogin: User authenticated"` - After successful login
   - `"User logged out, session cleared"` - After logout

---

## Test 7: Backend Fallback 🔄
**Time**: 3 minutes

1. Login with ZKLogin
2. **Open DevTools** (F12)
3. Go to **Application** → **Local Storage**
4. **Right-click** on `user` and select **Delete** (keep authToken)
5. **Refresh the page** (F5)
6. ✅ **Expected**: User should still be logged in
7. **Check Console**: Should show "Session restored from backend"
8. **Check Network tab**: Should see GET request to `/auth/me`

---

## Troubleshooting

### User Not Staying Logged In
- [ ] Check if `authToken` exists in localStorage
- [ ] Check if `user` exists in localStorage
- [ ] Check browser console for errors
- [ ] Check network tab for failed requests
- [ ] Verify backend `/auth/me` endpoint is working

### Console Shows Errors
- [ ] Check if backend URL is correct
- [ ] Check if CORS is configured
- [ ] Check if `/auth/me` endpoint exists
- [ ] Check if JWT token is valid

### Session Restored But User Data Missing
- [ ] Check if user JSON is valid
- [ ] Verify backend returns correct user data
- [ ] Check network response in DevTools

---

## Success Criteria ✅

All tests should pass:
- [x] User stays logged in after refresh
- [x] User stays logged in after closing tab
- [x] Logout clears all data
- [x] localStorage contains correct data
- [x] Console shows appropriate logs
- [x] Backend fallback works
- [x] No errors in console

---

## Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

---

## Important URLs

- **App**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Marketplace**: http://localhost:3000/marketplace
- **Backend API**: http://localhost:3001/api (default)

---

## Notes

- Session restoration is automatic on app load
- No user action required
- Works across browser restarts
- Works across tab closures
- Logout clears all session data
- Token expiration is handled by backend

---

**Last Updated**: 2024
**Status**: Ready for Testing ✅
