# ZKLogin Implementation Guide

## What is ZKLogin?

ZKLogin is a **zero-knowledge proof authentication** method from Sui that allows users to:
- Login with their **Google account** in **one click**
- Maintain **privacy** - their identity is NOT revealed to the blockchain
- Get a **Sui address** automatically derived from their Google account
- No need to manage separate wallet addresses

## How ZKLogin Works

```
┌─────────────────────────────────────────────────────────────────┐
│                      ZKLogin Flow                               │
└─────────────────────────────────────────────────────────────────┘

1. User clicks "Sign in with Google (ZKLogin)"
   ↓
2. Frontend redirects to Google OAuth
   URL: https://accounts.google.com/o/oauth2/v2/auth?
        client_id=YOUR_CLIENT_ID&
        redirect_uri=http://localhost:3000/auth/callback&
        response_type=code&
        scope=openid email profile
   ↓
3. User logs in with Google (or selects existing account)
   ↓
4. Google redirects back to: http://localhost:3000/auth/callback?code=...&state=...
   ↓
5. Frontend extracts authorization code from URL
   ↓
6. Frontend sends code to backend: POST /api/auth/zklogin/callback
   Body: { "code": "..." }
   ↓
7. Backend:
   - Exchanges code for JWT with Google
   - Verifies JWT signature
   - Derives Sui address from JWT (using ZKLogin SDK)
   - Creates/updates user in database
   - Returns JWT token + user data
   ↓
8. Frontend stores JWT token in localStorage
   ↓
9. User is logged in! Redirect to /marketplace
```

## Implementation Files

### 1. Login Page (`app/(auth)/login/page.tsx`)
- Shows "Sign in with Google (ZKLogin)" button
- Redirects to Google OAuth when clicked
- No manual address input needed

### 2. Callback Page (`app/(auth)/callback/page.tsx`)
- Handles OAuth redirect from Google
- Extracts authorization code from URL
- Sends code to backend for verification
- Stores JWT token and redirects to marketplace

### 3. ZKLogin Hook (`app/hooks/useZKLogin.ts`)
- `login(jwtToken)` - Sends JWT to backend for verification
- Handles response and stores user data
- Returns success/failure status

## Environment Variables Required

```env
# Frontend (.env.local)
NEXT_PUBLIC_ZKLOGIN_CLIENT_ID=your_google_oauth_client_id
NEXT_PUBLIC_ZKLOGIN_REDIRECT_URL=http://localhost:3000/auth/callback
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Setup Instructions

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Type: Web application
   - Authorized redirect URIs: `http://localhost:3000/auth/callback`
5. Copy Client ID

### Step 2: Update Environment Variables

```bash
# .env.local
NEXT_PUBLIC_ZKLOGIN_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_ZKLOGIN_REDIRECT_URL=http://localhost:3000/auth/callback
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Step 3: Backend Implementation

Backend needs to:
1. Receive authorization code at `POST /api/auth/zklogin/callback`
2. Exchange code for JWT with Google
3. Verify JWT signature
4. Derive Sui address from JWT
5. Create/update user
6. Return JWT token + user data

**Expected Request**:
```json
{
  "code": "4/0AY0e-g..."
}
```

**Expected Response**:
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user_id",
      "address": "0x...",
      "username": "user@gmail.com",
      "email": "user@gmail.com"
    }
  }
}
```

### Step 4: Test the Flow

1. Start frontend: `npm run dev`
2. Start backend: `npm run dev`
3. Go to http://localhost:3000/login
4. Click "Sign in with Google (ZKLogin)"
5. Login with Google account
6. Should redirect to marketplace

## Troubleshooting

### "Endpoint not found" Error

**Problem**: Backend returns 404 when receiving callback

**Solution**:
- Check backend has `POST /api/auth/zklogin/callback` endpoint
- Verify request body format: `{ "code": "..." }`
- Check backend logs for details

### "Invalid redirect URI" Error

**Problem**: Google OAuth rejects redirect

**Solution**:
- Verify `NEXT_PUBLIC_ZKLOGIN_REDIRECT_URL` matches Google Console settings
- Must be exactly: `http://localhost:3000/auth/callback`
- For production, update to your domain

### "No JWT token found" Error

**Problem**: Callback page can't extract token

**Solution**:
- Check URL parameters in browser: `http://localhost:3000/auth/callback?code=...`
- Verify backend is returning JWT in response
- Check browser console for errors

### "Login failed" Error

**Problem**: Backend verification failed

**Solution**:
- Check backend logs for JWT verification errors
- Verify Google Client ID is correct
- Verify JWT signature validation
- Check database connection

## API Endpoints

### POST /api/auth/zklogin/callback

**Purpose**: Verify OAuth code and create/update user

**Request**:
```json
{
  "code": "4/0AY0e-g..."
}
```

**Response (200)**:
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user_id",
      "address": "0x...",
      "username": "user@gmail.com",
      "email": "user@gmail.com"
    }
  }
}
```

**Error (400/500)**:
```json
{
  "error": {
    "code": "INVALID_CODE",
    "message": "Invalid authorization code"
  }
}
```

## Frontend Flow Diagram

```
Login Page
    ↓
User clicks button
    ↓
handleZKLogin()
    ↓
Redirect to Google OAuth
    ↓
User logs in with Google
    ↓
Google redirects to /auth/callback?code=...
    ↓
Callback Page
    ↓
Extract code from URL
    ↓
Call login(code)
    ↓
Send to backend: POST /api/auth/zklogin/callback
    ↓
Backend verifies and returns JWT
    ↓
Store JWT in localStorage
    ↓
Redirect to /marketplace
    ↓
User is logged in!
```

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **State Parameter**: Prevents CSRF attacks (already implemented)
3. **JWT Verification**: Backend must verify JWT signature
4. **Token Storage**: JWT stored in localStorage (consider httpOnly cookies for production)
5. **Scope Limitation**: Only request necessary scopes (openid, email, profile)

## Key Differences from Manual Login

| Aspect | ZKLogin | Manual Login |
|--------|---------|--------------|
| User Input | None - one click | Address, email, username |
| Identity | Google account | Manual entry |
| Sui Address | Auto-derived | Manual entry |
| Privacy | High - ZK proofs | Lower |
| User Experience | Seamless | More steps |
| Setup | Google OAuth | Manual |

## Next Steps

1. ✅ Frontend ZKLogin flow implemented
2. ⏳ Backend OAuth code verification (needs implementation)
3. ⏳ Backend JWT verification (needs implementation)
4. ⏳ Backend Sui address derivation (needs implementation)
5. ⏳ Test end-to-end flow
6. ⏳ Deploy to production with HTTPS

## Resources

- [Sui ZKLogin Documentation](https://docs.sui.io/concepts/cryptography/zklogin)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [JWT Verification](https://jwt.io/)

---

**Status**: Frontend implementation complete, awaiting backend implementation
**Last Updated**: 2024
