# Authentication Persistence Implementation

## Overview
Users now stay logged in across page refreshes, browser restarts, and tab closures. The authentication session is automatically restored when the app loads.

## How It Works

### 1. Session Storage
When a user logs in, the following data is persisted to localStorage:
- **authToken**: JWT token for API authentication
- **user**: User profile data (address, username, email, role, balance, etc.)
- **zklogin_user_salt**: User salt for ZKLogin address derivation (persisted separately)

### 2. Session Restoration Flow
When the app loads:
1. `useAuthPersistence` hook runs in the root Providers component
2. Checks if authToken exists in localStorage
3. If token exists:
   - First tries to restore user from localStorage (fast path)
   - If localStorage user data is missing/invalid, fetches from backend `/auth/me`
   - Sets the user in Zustand store and API client
4. If token is invalid (401), clears all session data
5. If no token, user remains logged out

### 3. Session Logout
When user logs out:
- authToken is removed from localStorage
- user data is removed from localStorage
- zklogin_user_salt is cleared
- User store is reset to null
- User is redirected to login page

## Implementation Details

### Files Modified/Created

#### New Files
- **`/app/hooks/useAuthPersistence.ts`**: Main hook for session restoration
  - Runs on app load
  - Restores user from localStorage or backend
  - Handles token expiration (401 errors)

#### Modified Files
- **`/app/components/others/Providers.tsx`**: 
  - Added SessionRestorer component
  - Calls useAuthPersistence hook on app load

- **`/app/hooks/useZKLogin.ts`**:
  - Persists user data to localStorage on login
  - Clears user data on logout
  - Already had token persistence

### Data Flow

```
App Load
  ↓
Providers component renders
  ↓
SessionRestorer component runs
  ↓
useAuthPersistence hook executes
  ↓
Check localStorage for authToken
  ├─ Token exists?
  │  ├─ Yes: Try restore from localStorage
  │  │  ├─ User data found?
  │  │  │  ├─ Yes: Set user in store (fast path)
  │  │  │  └─ No: Fetch from backend /auth/me
  │  │  └─ Set user in store
  │  └─ No: User remains logged out
  └─ Done, app is ready
```

## Security Considerations

1. **Token Storage**: JWT is stored in localStorage (not httpOnly cookie)
   - Vulnerable to XSS attacks
   - Consider using httpOnly cookies in production
   - Implement Content Security Policy (CSP)

2. **User Salt**: Persistent in localStorage
   - Not sensitive data
   - Used only for address derivation
   - Cleared on logout

3. **Token Expiration**: 
   - Backend should set token expiration
   - API interceptor handles 401 responses
   - Expired tokens are cleared automatically

4. **CORS**: Ensure backend CORS is properly configured
   - Only allow requests from your domain
   - Set appropriate headers

## Testing

### Test Case 1: Login and Refresh
1. User logs in with ZKLogin
2. Refresh the page (Ctrl+R)
3. User should remain logged in
4. Console should show "Session restored from localStorage"

### Test Case 2: Close and Reopen Tab
1. User logs in with ZKLogin
2. Close the browser tab
3. Reopen the website
4. User should be logged in
5. Console should show "Session restored from localStorage"

### Test Case 3: Logout
1. User is logged in
2. Click Logout button
3. User should be redirected to login page
4. Console should show "User logged out, session cleared"
5. Refresh the page - user should remain logged out

### Test Case 4: Token Expiration
1. User is logged in
2. Manually delete authToken from localStorage (DevTools)
3. Try to make an API call
4. Should get 401 error
5. User should be redirected to login

### Test Case 5: Invalid Stored Data
1. User is logged in
2. Corrupt the stored user JSON in localStorage
3. Refresh the page
4. System should detect invalid data and regenerate from backend
5. User should remain logged in

## Browser DevTools Inspection

To inspect the stored session data:
1. Open DevTools (F12)
2. Go to Application → Local Storage
3. Look for these keys:
   - `authToken`: JWT token
   - `user`: User profile JSON
   - `zklogin_user_salt`: User salt for ZKLogin
   - `zklogin_ephemeral_keypair`: Ephemeral key (sessionStorage, cleared after login)
   - `zklogin_randomness`: Randomness value (sessionStorage)
   - `zklogin_max_epoch`: Max epoch (sessionStorage)

## Backend Requirements

The backend should:
1. Support `/auth/me` endpoint that returns current user data
2. Validate JWT tokens and return 401 for invalid/expired tokens
3. Set appropriate token expiration (e.g., 7 days)
4. Support token refresh if needed

Example `/auth/me` response:
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

## Troubleshooting

### User Not Staying Logged In
1. Check if authToken is in localStorage
2. Check if user data is in localStorage
3. Check browser console for errors
4. Verify backend `/auth/me` endpoint is working
5. Check CORS configuration

### Session Restored But User Data Missing
1. Check if user JSON in localStorage is valid
2. Verify backend `/auth/me` endpoint returns correct data
3. Check network tab for failed requests

### Token Expiration Issues
1. Verify token expiration time on backend
2. Check if 401 responses are handled correctly
3. Ensure API interceptor is clearing token on 401

## Future Enhancements

1. **Token Refresh**: Implement refresh token rotation
2. **HttpOnly Cookies**: Move to httpOnly cookies for better security
3. **Session Timeout**: Add idle timeout for security
4. **Multi-Tab Sync**: Sync session across multiple tabs using storage events
5. **Offline Support**: Cache user data for offline access

## Related Files

- `/app/hooks/useAuthPersistence.ts` - Session restoration hook
- `/app/hooks/useZKLogin.ts` - ZKLogin authentication
- `/app/components/others/Providers.tsx` - App providers with session restorer
- `/app/store/userStore.ts` - Zustand user store
- `/app/utils/api.client.ts` - API client with auth interceptor
- `/app/utils/zklogin.utils.ts` - ZKLogin utilities
