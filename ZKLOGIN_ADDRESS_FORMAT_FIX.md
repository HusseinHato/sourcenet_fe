# ZKLogin Address Format Fix - Implementation Summary

## Problem
The address sent to the backend was in base64 format instead of the required hex format (`0x...`).

## Solution
Implemented proper Sui ZKLogin SDK integration following the official documentation:
https://docs.sui.io/guides/developer/cryptography/zklogin-integration

## Changes Made

### 1. Login Page (`/app/(auth)/login/page.tsx`)
**Purpose**: Initiate ZKLogin flow with proper ephemeral key setup

**Key Changes**:
- Generate ephemeral key pair using `Ed25519Keypair` from `@mysten/sui/keypairs/ed25519`
- Query Sui network for current epoch using `SuiClient`
- Generate nonce and randomness using `generateNonce()` and `generateRandomness()` from `@mysten/sui/zklogin`
- Store ephemeral keypair, randomness, and max epoch in `sessionStorage` for callback page
- Construct Google OAuth URL with:
  - `response_type=id_token` (instead of `code`)
  - `nonce` parameter (computed from ephemeral key)
  - `scope=openid email profile`

**Flow**:
```
User clicks "Sign in with Google"
  ↓
Generate ephemeral key pair
  ↓
Get current epoch from Sui network
  ↓
Generate nonce (from ephemeral key + max epoch + randomness)
  ↓
Store session data
  ↓
Redirect to Google OAuth with nonce
```

### 2. Callback Page (`/app/(auth)/callback/page.tsx` and `/app/auth/callback/page.tsx`)
**Purpose**: Handle OAuth redirect and derive Sui address

**Key Changes**:
- Extract JWT from URL fragment (`window.location.hash`)
- Get persistent user salt from localStorage using `getUserSalt()`
- Derive Sui address using `jwtToAddress(jwt, userSalt)` - **returns hex format (0x...)**
- Send JWT and address to backend for verification
- Clear session storage after successful login

**Flow**:
```
Google redirects with JWT in fragment (#id_token=...)
  ↓
Extract JWT from fragment
  ↓
Get user salt (persistent across sessions)
  ↓
Derive address from JWT + salt (hex format)
  ↓
Send JWT + address to backend
  ↓
Backend verifies and returns user data + token
  ↓
Redirect to marketplace
```

### 3. useZKLogin Hook (`/app/hooks/useZKLogin.ts`)
**Purpose**: Handle backend communication

**Signature Change**:
```typescript
// Before
login(address: string, email?: string, username?: string): Promise<boolean>

// After
login(jwt: string, address: string): Promise<boolean>
```

**Changes**:
- Now accepts JWT and address (both mandatory)
- Sends `{ jwt, address }` to backend endpoint `/auth/zklogin/callback`
- Backend verifies JWT and returns user data + token
- Updated logout to clear user salt

### 4. New Utility File (`/app/utils/zklogin.utils.ts`)
**Purpose**: Manage user salt for address derivation

**Functions**:
- `getUserSalt()`: Get or create persistent user salt from localStorage
- `generateRandomSalt()`: Generate random 16-byte salt as hex string
- `clearUserSalt()`: Clear salt on logout

**Why Persistent Salt?**
- User salt is used to derive the Sui address from JWT
- Same salt must be used every time to get the same address
- Stored in localStorage so it persists across browser sessions
- Cleared only on logout

### 5. Bug Fix (`/app/utils/crypto.utils.ts`)
- Fixed TypeScript error: cast `decrypted.buffer` to `ArrayBuffer`

## Address Format Comparison

### Before (Incorrect)
```
base64 format: "Ym9iOjEyMzQ1Ng=="
Sent to backend as-is
```

### After (Correct)
```
hex format: "0x1234567890abcdef1234567890abcdef"
Derived from JWT using jwtToAddress(jwt, userSalt)
Sent to backend for verification
```

## Backend Requirements

The backend `/auth/zklogin/callback` endpoint should now expect:

```json
{
  "jwt": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ...",
  "address": "0x1234567890abcdef1234567890abcdef"
}
```

**Backend should**:
1. Verify JWT signature with Google's public keys
2. Extract claims from JWT (sub, aud, iat, exp, etc.)
3. Optionally derive address independently to validate
4. Create or update user record
5. Return user data + authentication token

## Environment Variables Required

```env
NEXT_PUBLIC_ZKLOGIN_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_ZKLOGIN_REDIRECT_URL=http://localhost:3000/auth/callback
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.devnet.sui.io
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Security Considerations

1. **User Salt**: Persistent but not sensitive - used only to derive address
2. **Ephemeral Key**: Temporary, stored in sessionStorage, cleared after login
3. **JWT**: Verified by backend before creating user session
4. **Nonce**: Prevents replay attacks and ensures JWT is fresh
5. **State Parameter**: Should be stored and verified (currently not implemented - TODO)

## Testing Checklist

- [ ] User can click "Sign in with Google"
- [ ] Redirected to Google login
- [ ] After Google login, redirected back to callback page
- [ ] Address is derived in hex format (0x...)
- [ ] Backend receives JWT and address
- [ ] User is logged in and redirected to marketplace
- [ ] User salt persists across browser sessions
- [ ] Logout clears user salt
- [ ] Multiple logins with same Google account return same Sui address

## Related Files

- `/app/(auth)/login/page.tsx` - Login page with ZKLogin button
- `/app/(auth)/callback/page.tsx` - OAuth callback handler
- `/app/auth/callback/page.tsx` - Alternative callback route
- `/app/hooks/useZKLogin.ts` - ZKLogin hook
- `/app/utils/zklogin.utils.ts` - ZKLogin utilities
- `/app/utils/crypto.utils.ts` - Crypto utilities (fixed TypeScript error)

## References

- [Sui ZKLogin Documentation](https://docs.sui.io/guides/developer/cryptography/zklogin-integration)
- [@mysten/sui Package](https://www.npmjs.com/package/@mysten/sui)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
