# Sui Wallet Authentication Setup

## Overview
This document explains how to set up and use Sui wallet authentication in the DataMarket application. Users can now sign in using their Sui wallets (Sui Wallet, Suiet, etc.) instead of just ZKLogin.

## Installation

### 1. Install Dependencies
The required packages have been added to `package.json`:
- `@mysten/dapp-kit` - React hooks and components for wallet connection
- `@mysten/sui` - Sui TypeScript SDK (already installed)
- `@tanstack/react-query` - State management (already installed)

Install dependencies:
```bash
npm install
```

### 2. Environment Variables
Add to your `.env.local` file:
```env
NEXT_PUBLIC_SUI_NETWORK=devnet  # or testnet, mainnet
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Architecture

### Components

#### 1. **WalletProvider** (`/app/components/wallet/WalletProvider.tsx`)
Wraps the app with Sui dApp Kit providers:
- `QueryClientProvider` - Manages request state
- `SuiClientProvider` - Connects to Sui RPC nodes
- `WalletProvider` - Enables wallet connections

#### 2. **useWalletAuth Hook** (`/app/hooks/useWalletAuth.ts`)
Handles wallet authentication:
- `signInWithWallet()` - Signs message with wallet and authenticates
- `logoutWallet()` - Clears wallet session
- `account` - Current connected wallet account
- `isConnected` - Whether wallet is connected

#### 3. **Wallet Login Page** (`/app/(auth)/wallet-login/page.tsx`)
User interface for wallet login:
- ConnectButton - Allows users to connect their wallet
- Sign In button - Initiates authentication
- Supported wallets display

### Updated Providers (`/app/components/others/Providers.tsx`)
Now includes:
- SuiClientProvider with network configuration
- WalletProvider for wallet connections
- SessionRestorer for auth persistence

## How It Works

### Wallet Connection Flow

```
User visits /wallet-login
    ↓
Clicks "Connect Wallet" (ConnectButton)
    ↓
Selects wallet (Sui Wallet, Suiet, etc.)
    ↓
Wallet extension opens and approves connection
    ↓
User's address is displayed
    ↓
User clicks "Sign In with Wallet"
    ↓
Message is created with address and timestamp
    ↓
Wallet signs the message (user approves in wallet)
    ↓
Signature sent to backend: /auth/wallet/callback
    ↓
Backend verifies signature and address
    ↓
Backend returns JWT token and user data
    ↓
Token and user stored in localStorage
    ↓
User redirected to /marketplace
```

### Authentication Message
The message signed by the wallet contains:
```
Sign in to DataMarket
Address: 0x1234567890abcdef...
Timestamp: 1699876543210
```

This ensures:
- Proof of wallet ownership
- Prevents replay attacks (timestamp)
- Clear intent (message content)

## Backend Integration

### Required Endpoint: `/auth/wallet/callback`

**Method**: POST

**Request Body**:
```json
{
  "address": "0x1234567890abcdef...",
  "signature": "signature_bytes_here",
  "publicKey": "public_key_here"
}
```

**Response**:
```json
{
  "data": {
    "token": "jwt_token_here",
    "user": {
      "address": "0x1234567890abcdef...",
      "username": "user_name",
      "email": "user@example.com",
      "role": "buyer",
      "balance": 100,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Backend Verification Steps

1. Extract address and signature from request
2. Verify signature was created by the address
3. Verify message format and timestamp (not too old)
4. Create or update user in database
5. Generate JWT token
6. Return token and user data

### Signature Verification Example (Node.js)
```typescript
import { verifyPersonalMessageSignature } from '@mysten/sui/verify';

const isValid = await verifyPersonalMessageSignature(
  message,
  signature,
  publicKey
);
```

## Supported Wallets

The implementation supports all wallets that follow the Wallet Standard:
- **Sui Wallet** - Official Sui wallet
- **Suiet** - Popular Sui wallet
- **Ethos Wallet** - Community wallet
- **Other Wallet Standard Wallets** - Any wallet implementing the standard

Users can install these wallets as browser extensions and use them to sign in.

## Data Storage

### localStorage Keys
- `authToken` - JWT token (cleared on logout)
- `user` - User profile JSON (cleared on logout)
- `walletAddress` - Connected wallet address (cleared on logout)
- `zklogin_user_salt` - ZKLogin salt (persists across logout)

## Usage Examples

### Using the Wallet Auth Hook
```typescript
import { useWalletAuth } from '@/app/hooks/useWalletAuth';

function MyComponent() {
  const { account, signInWithWallet, logoutWallet, isConnected } = useWalletAuth();

  return (
    <div>
      {isConnected && <p>Connected: {account?.address}</p>}
      <button onClick={signInWithWallet}>Sign In</button>
      <button onClick={logoutWallet}>Logout</button>
    </div>
  );
}
```

### Using useCurrentAccount Hook
```typescript
import { useCurrentAccount } from '@mysten/dapp-kit';

function MyComponent() {
  const account = useCurrentAccount();

  if (!account) {
    return <p>No wallet connected</p>;
  }

  return <p>Connected to {account.address}</p>;
}
```

### Querying User Objects
```typescript
import { useSuiClientQuery, useCurrentAccount } from '@mysten/dapp-kit';

function UserObjects() {
  const account = useCurrentAccount();
  const { data } = useSuiClientQuery('getOwnedObjects', {
    owner: account?.address,
  });

  return (
    <ul>
      {data?.data.map((obj) => (
        <li key={obj.data?.objectId}>{obj.data?.objectId}</li>
      ))}
    </ul>
  );
}
```

## Testing

### Test Wallet Login
1. Go to `http://localhost:3000/wallet-login`
2. Click "Connect Wallet"
3. Select a wallet (must have extension installed)
4. Approve connection in wallet
5. Click "Sign In with Wallet"
6. Approve message signing in wallet
7. Should be redirected to marketplace

### Test Logout
1. Click Logout button
2. Should be redirected to login page
3. localStorage should be cleared (except zklogin_user_salt)

### Test Persistence
1. Login with wallet
2. Refresh page
3. User should remain logged in
4. Close and reopen tab
5. User should still be logged in

## Security Considerations

### Current Implementation
- Message signing proves wallet ownership
- Signature verification done on backend
- JWT token stored in localStorage
- Timestamp prevents old message replay

### Production Recommendations
1. **Use HTTPS Only** - Ensure all connections are encrypted
2. **Implement Token Expiration** - Set JWT expiration (e.g., 7 days)
3. **Use HttpOnly Cookies** - Move JWT to httpOnly cookies
4. **Implement Refresh Tokens** - Add token refresh mechanism
5. **Rate Limiting** - Limit login attempts
6. **CORS Configuration** - Restrict API access
7. **Content Security Policy** - Prevent XSS attacks

## Troubleshooting

### Wallet Not Connecting
- Ensure wallet extension is installed
- Check if wallet is enabled in browser
- Try refreshing the page
- Check browser console for errors

### Signature Verification Fails
- Verify backend is using correct verification method
- Check if message format matches exactly
- Ensure public key is correct
- Check timestamp is recent (not too old)

### User Not Staying Logged In
- Check if authToken is in localStorage
- Verify backend `/auth/me` endpoint works
- Check network tab for failed requests
- Clear browser cache and try again

## Related Files

- `/app/components/wallet/WalletProvider.tsx` - Wallet provider setup
- `/app/hooks/useWalletAuth.ts` - Wallet auth hook
- `/app/(auth)/wallet-login/page.tsx` - Wallet login page
- `/app/components/others/Providers.tsx` - Updated with wallet providers
- `/package.json` - Updated with dApp Kit dependency

## References

- [Sui dApp Kit Documentation](https://sdk.mystenlabs.com/dapp-kit)
- [Sui TypeScript SDK](https://sdk.mystenlabs.com/typescript)
- [Wallet Standard](https://docs.sui.io/standards/wallet-standard)
- [Sui Documentation](https://docs.sui.io/)

## Next Steps

1. **Install dependencies**: `npm install`
2. **Set environment variables** in `.env.local`
3. **Implement backend endpoint** `/auth/wallet/callback`
4. **Test wallet login** at `/wallet-login`
5. **Deploy** to production with security measures

---

**Status**: Ready for Backend Integration
**Type**: Feature Implementation
**Priority**: High
