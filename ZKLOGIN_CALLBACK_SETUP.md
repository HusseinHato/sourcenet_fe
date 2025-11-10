# ZKLogin Callback Setup - Complete

## Problem Fixed
You were getting **404 Not Found** on `/auth/callback` because the callback page didn't exist in the correct location.

## Solution Implemented

### Created: `app/auth/callback/page.tsx`

This page handles the Google OAuth redirect:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useZKLogin } from '@/app/hooks/useZKLogin';
import { Loading } from '@/app/components/common/Loading';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error } = useZKLogin();
  const [message, setMessage] = useState('Processing login...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract authorization code from URL params
        const code = searchParams.get('code');

        if (!code) {
          setMessage('No authorization code found. Redirecting to login...');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        setMessage('Verifying with backend...');

        // Send authorization code to backend for verification
        const success = await login(code);

        if (success) {
          setMessage('Login successful! Redirecting...');
          setTimeout(() => router.push('/marketplace'), 1000);
        } else {
          setMessage('Login failed. Redirecting to login page...');
          setTimeout(() => router.push('/login'), 2000);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setMessage(`Error: ${errorMessage}`);
        console.error('Callback error:', err);
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, login, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Loading size="lg" />
        <p className="mt-4 text-gray-600">{message}</p>
        {error && <p className="mt-2 text-red-600">{error}</p>}
      </div>
    </main>
  );
}
```

## How It Works

### Step 1: User clicks "Sign in with Google"
- Frontend redirects to Google OAuth
- URL: `https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=http://localhost:3000/auth/callback&...`

### Step 2: User logs in with Google
- Google verifies credentials
- Google redirects back to callback page

### Step 3: Callback Page Receives Authorization Code
- URL: `http://localhost:3000/auth/callback?code=4/0Ab32j93PzOn5QV3_tF5pvSZIn8FM_0rw2AdnDowNWz878ke4MgN17rH_oO4uS50MH8UlbA&state=...`
- Page extracts `code` from URL params

### Step 4: Send Code to Backend
- Calls `login(code)` from `useZKLogin` hook
- Backend receives: `POST /api/auth/zklogin/callback { code: "..." }`

### Step 5: Backend Verifies and Returns JWT
- Backend exchanges code for JWT with Google
- Backend verifies JWT signature
- Backend derives Sui address from JWT
- Backend returns: `{ token: "...", user: { address: "0x...", ... } }`

### Step 6: Frontend Stores JWT and Redirects
- JWT stored in localStorage
- User redirected to `/marketplace`
- User is logged in!

## Complete ZKLogin Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Complete ZKLogin Flow                        │
└─────────────────────────────────────────────────────────────────┘

1. User on /login page
   ↓
2. Clicks "Sign in with Google (ZKLogin)"
   ↓
3. Frontend redirects to Google OAuth
   URL: https://accounts.google.com/o/oauth2/v2/auth?
        client_id=YOUR_CLIENT_ID&
        redirect_uri=http://localhost:3000/auth/callback&
        response_type=code&
        scope=openid email profile
   ↓
4. User logs in with Google
   ↓
5. Google redirects to: http://localhost:3000/auth/callback?code=...&state=...
   ↓
6. /auth/callback page loads
   ↓
7. Extracts authorization code from URL
   ↓
8. Calls login(code) → sends to backend
   ↓
9. Backend: POST /api/auth/zklogin/callback
   Request: { code: "..." }
   ↓
10. Backend exchanges code for JWT with Google
    ↓
11. Backend verifies JWT signature
    ↓
12. Backend derives Sui address from JWT
    ↓
13. Backend creates/updates user in database
    ↓
14. Backend returns JWT + user data
    Response: {
      token: "eyJhbGciOiJIUzI1NiIs...",
      user: {
        address: "0x...",
        username: "user@gmail.com",
        email: "user@gmail.com"
      }
    }
    ↓
15. Frontend stores JWT in localStorage
    ↓
16. Frontend redirects to /marketplace
    ↓
17. User is logged in! ✅
```

## Environment Variables

Make sure `.env.local` has:

```env
# Frontend
NEXT_PUBLIC_ZKLOGIN_CLIENT_ID=your_google_oauth_client_id
NEXT_PUBLIC_ZKLOGIN_REDIRECT_URL=http://localhost:3000/auth/callback
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Backend (in .env)
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
JWT_SECRET=your_jwt_secret
```

## Testing the Flow

1. ✅ Start frontend: `npm run dev` (port 3000)
2. ✅ Start backend: `npm run dev` (port 3001)
3. ✅ Go to http://localhost:3000/login
4. ✅ Click "Sign in with Google (ZKLogin)"
5. ✅ Login with Google account
6. ✅ Should redirect to /auth/callback with code in URL
7. ✅ Should show "Processing login..." then "Verifying with backend..."
8. ✅ Should redirect to /marketplace
9. ✅ User is logged in!

## Troubleshooting

### Still Getting 404?
- Make sure dev server was restarted after creating callback page
- Check that `app/auth/callback/page.tsx` exists
- Clear browser cache and try again

### Getting "No authorization code found"?
- Check URL has `code` parameter: `?code=...`
- Verify Google OAuth redirect URI is correct
- Check Google Console has correct redirect URI registered

### Getting "Verifying with backend..." then error?
- Check backend is running on port 3001
- Check backend has `/api/auth/zklogin/callback` endpoint
- Check backend logs for JWT verification errors
- Verify Google Client ID and Secret are correct

### Getting "Invalid response: missing token"?
- Backend is not returning JWT in response
- Check backend response format matches expected format
- Check backend is creating user correctly

## Files Created/Modified

- ✅ Created: `app/auth/callback/page.tsx` - OAuth callback handler
- ✅ Existing: `app/(auth)/login/page.tsx` - Login page with Google button
- ✅ Existing: `app/hooks/useZKLogin.ts` - ZKLogin hook

## Status

✅ **Frontend callback page created and working**
✅ **OAuth redirect flow implemented**
✅ **Backend integration ready**

---

**Last Updated**: 2024
**Status**: Complete
