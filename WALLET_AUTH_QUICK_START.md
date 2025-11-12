# Wallet Authentication - Quick Start Guide

## What's New
Users can now sign in using their Sui wallets (Sui Wallet, Suiet, etc.) in addition to ZKLogin with Google.

## Installation

### 1. Install Dependencies
```bash
npm install
```

This installs `@mysten/dapp-kit` which provides wallet connection functionality.

### 2. Set Environment Variables
Add to `.env.local`:
```env
NEXT_PUBLIC_SUI_NETWORK=devnet
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Files Added/Modified

### New Files
- `/app/components/wallet/WalletProvider.tsx` - Wallet provider setup
- `/app/hooks/useWalletAuth.ts` - Wallet authentication hook
- `/app/(auth)/wallet-login/page.tsx` - Wallet login page
- `/WALLET_AUTH_SETUP.md` - Detailed documentation

### Modified Files
- `/app/components/others/Providers.tsx` - Added wallet providers
- `/app/(auth)/login/page.tsx` - Added wallet login link
- `/package.json` - Added @mysten/dapp-kit dependency

## User Flow

### Wallet Login Flow
```
User clicks "Sign in with Wallet"
    ↓
Redirected to /wallet-login
    ↓
Clicks "Connect Wallet"
    ↓
Selects wallet (Sui Wallet, Suiet, etc.)
    ↓
Wallet extension opens
    ↓
User approves connection
    ↓
Clicks "Sign In with Wallet"
    ↓
Message is signed by wallet
    ↓
Signature sent to backend
    ↓
Backend verifies and returns JWT
    ↓
User logged in and redirected to /marketplace
```

## Backend Integration

### Required Endpoint
**POST** `/auth/wallet/callback`

### Request
```json
{
  "address": "0x1234567890abcdef...",
  "signature": "signature_bytes",
  "publicKey": "public_key_bytes"
}
```

### Response
```json
{
  "data": {
    "token": "jwt_token",
    "user": {
      "address": "0x1234567890abcdef...",
      "username": "username",
      "email": "email@example.com",
      "role": "buyer",
      "balance": 100,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Backend Verification
Verify the signature using:
```typescript
import { verifyPersonalMessageSignature } from '@mysten/sui/verify';

const isValid = await verifyPersonalMessageSignature(
  message,
  signature,
  publicKey
);
```

## Testing

### Prerequisites
- Install a Sui wallet extension (Sui Wallet, Suiet, etc.)
- Have some test SUI tokens (optional, not needed for login)

### Test Steps
1. Go to `http://localhost:3000/login`
2. Click "Sign in with Wallet"
3. Click "Connect Wallet"
4. Select your wallet
5. Approve connection in wallet extension
6. Click "Sign In with Wallet"
7. Approve message signing in wallet
8. Should be redirected to marketplace

## Supported Wallets

All wallets following the Wallet Standard are supported:
- Sui Wallet (official)
- Suiet
- Ethos Wallet
- Others implementing Wallet Standard

## Key Features

✅ **Multiple Auth Methods**
- ZKLogin (Google)
- Wallet (Sui Wallet, Suiet, etc.)

✅ **Session Persistence**
- Users stay logged in across refreshes
- Works across browser restarts

✅ **Secure Authentication**
- Message signing proves wallet ownership
- Signature verified on backend
- Timestamp prevents replay attacks

✅ **User-Friendly**
- ConnectButton handles wallet selection
- Clear UI for both auth methods
- Supported wallets displayed

## Common Issues

### Wallet Not Connecting
- Ensure wallet extension is installed
- Check if wallet is enabled
- Try refreshing page
- Check browser console for errors

### Signature Verification Fails
- Verify backend uses correct verification
- Check message format matches
- Ensure public key is correct
- Verify timestamp is recent

### User Not Logged In After Signing
- Check if backend endpoint exists
- Verify JWT is returned correctly
- Check localStorage for authToken
- Check network tab for errors

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Set environment variables
3. ⏳ Implement backend `/auth/wallet/callback` endpoint
4. ⏳ Test wallet login flow
5. ⏳ Deploy to production

## Documentation

For detailed information, see:
- `WALLET_AUTH_SETUP.md` - Complete setup guide
- `AUTH_PERSISTENCE.md` - Session persistence
- `ZKLOGIN_ADDRESS_FORMAT_FIX.md` - ZKLogin details

## References

- [Sui dApp Kit Docs](https://sdk.mystenlabs.com/dapp-kit)
- [Sui TypeScript SDK](https://sdk.mystenlabs.com/typescript)
- [Wallet Standard](https://docs.sui.io/standards/wallet-standard)
- [Sui Docs](https://docs.sui.io/)

---

**Status**: Frontend Ready, Awaiting Backend Implementation
**Type**: Authentication Feature
**Priority**: High
