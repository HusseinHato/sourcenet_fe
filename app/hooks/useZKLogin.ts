'use client';

import { useState, useCallback } from 'react';
import { useUserStore } from '@/app/(main)/store/userStore';
import { setAuthToken } from '@/app/utils/api.client';
import { User } from '@/app/types';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { genAddressSeed, getZkLoginSignature, generateNonce, getExtendedEphemeralPublicKey } from '@mysten/sui/zklogin';
import { jwtToAddress } from '@mysten/sui/zklogin';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { getUserSalt } from '@/app/utils/zklogin.utils';

export function useZKLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, setUser, logout: storeLogout } = useUserStore();

  // Derived address from user store or other sources could be added here if needed
  // For now, we rely on the user store's address
  const address = user?.address || null;

  /**
   * Login with ZKLogin - sends JWT and address to backend
   * @param jwt - JWT token from Google OAuth
   * @param address - Sui address derived from JWT (hex format 0x...)
   */
  const login = useCallback(async (jwt: string, address: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      if (!jwt || jwt.trim().length === 0) {
        throw new Error('JWT is required');
      }
      if (!address || address.trim().length === 0) {
        throw new Error('Address is required');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

      console.log('ZKLogin: Sending callback to backend', { apiUrl, address });

      console.log('ZKLogin: JWT', jwt);
      console.log('ZKLogin: Address', address);

      // Build request payload with JWT and address
      const payload = { jwt, address };

      const response = await fetch(`${apiUrl}/auth/zklogin/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('ZKLogin: Backend response', { status: response.status, ok: response.ok });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `ZKLogin failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      console.log('ZKLogin: Response data', { hasData: !!data.data, hasToken: !!data.data?.token });

      // Validate response data
      if (!data.data || !data.data.token) {
        throw new Error('Invalid response: missing token');
      }

      const user: User = {
        address: data.data.user.address,
        email: data.data.user.email || null,
        username: data.data.user.username,
        role: 'buyer',
        balance: 0,
        createdAt: new Date().toISOString(),
      };

      console.log('ZKLogin: User authenticated', { address: user.address, username: user.username });

      // Set auth token in both localStorage and API client
      setAuthToken(data.data.token);

      // Persist user data for session restoration
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      console.error('ZKLogin error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  const logout = useCallback(() => {
    storeLogout();
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('zklogin_jwt');
    localStorage.removeItem('zklogin_ephemeral_keypair');
    localStorage.removeItem('zklogin_randomness');
    localStorage.removeItem('zklogin_max_epoch');
    // NOTE: Do NOT clear zklogin_user_salt - it must persist across sessions
    // to ensure the same Sui address is derived for the same Google account
    setError(null);
    console.log('User logged out, session cleared');
  }, [storeLogout]);

  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const user: User = await response.json();
      setUser(user);
      return user;
    } catch (err) {
      return null;
    }
  }, [setUser]);

  /**
   * Execute a transaction using ZKLogin credentials
   * @param recipientAddress - Address to send funds to
   * @param amount - Amount of SUI to send
   * @param onSuccess - Callback function on success
   */
  const executeTransaction = useCallback(async (
    recipientAddress: string,
    amount: number,
    onSuccess: (digest: string) => Promise<void>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Initialize Sui Client
      const rpcUrl = process.env.NEXT_PUBLIC_SUI_RPC_URL || getFullnodeUrl('testnet');
      const client = new SuiClient({ url: rpcUrl });

      const jwt = localStorage.getItem('zklogin_jwt');
      // Use localStorage instead of sessionStorage to ensure consistency across tabs
      const ephemeralKeyPairStr = localStorage.getItem('zklogin_ephemeral_keypair');
      const randomness = localStorage.getItem('zklogin_randomness');
      const maxEpoch = localStorage.getItem('zklogin_max_epoch');
      const salt = getUserSalt();

      if (!jwt) throw new Error('Missing JWT. Please re-login.');
      if (!ephemeralKeyPairStr) throw new Error('Missing Ephemeral Key. Please re-login.');
      if (!randomness) throw new Error('Missing Randomness. Please re-login.');
      if (!maxEpoch) throw new Error('Missing Max Epoch. Please re-login.');

      // Reconstruct Keypair
      const parsedKeyPair = JSON.parse(ephemeralKeyPairStr);
      let secretKeyBytes: Uint8Array;

      if (Array.isArray(parsedKeyPair.secretKey) && typeof parsedKeyPair.secretKey[0] === 'string') {
        const bech32SecretKey = parsedKeyPair.secretKey.join('');
        const { secretKey } = decodeSuiPrivateKey(bech32SecretKey);
        secretKeyBytes = secretKey;
      } else if (typeof parsedKeyPair.secretKey === 'string') {
        const { secretKey } = decodeSuiPrivateKey(parsedKeyPair.secretKey);
        secretKeyBytes = secretKey;
      } else {
        secretKeyBytes = new Uint8Array(parsedKeyPair.secretKey);
      }

      const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(secretKeyBytes);

      // DIAGNOSTIC: Verify Nonce locally
      const decodedJwt = JSON.parse(atob(jwt.split('.')[1]));
      const maxEpochNum = Number(maxEpoch);

      const expectedNonce = generateNonce(
        ephemeralKeyPair.getPublicKey(),
        maxEpochNum,
        randomness
      );

      console.log('ZKLogin Diagnostic:', {
        jwtNonce: decodedJwt.nonce,
        computedNonce: expectedNonce,
        match: decodedJwt.nonce === expectedNonce,
        maxEpoch: maxEpochNum,
        randomness: randomness,
        ephemeralPublicKey: ephemeralKeyPair.getPublicKey().toBase64()
      });

      if (decodedJwt.nonce !== expectedNonce) {
        throw new Error(`Nonce mismatch! Local: ${expectedNonce}, JWT: ${decodedJwt.nonce}. Please re-login.`);
      }

      // 1. Generate ZK Proof
      const proverUrl = process.env.NEXT_PUBLIC_PROVER_URL || 'https://prover-dev.mystenlabs.com/v1';
      const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(ephemeralKeyPair.getPublicKey());

      const base64ToBigInt = (b64: string): string => {
        if (/^\d+$/.test(b64)) return b64;
        try {
          const bin = atob(b64);
          let hex = "0x";
          for (let i = 0; i < bin.length; i++) {
            hex += bin.charCodeAt(i).toString(16).padStart(2, "0");
          }
          return BigInt(hex).toString();
        } catch (e) {
          return b64;
        }
      };

      const extendedEphemeralPublicKeyBigInt = base64ToBigInt(extendedEphemeralPublicKey);

      console.log('Prover Inputs:', {
        extendedEphemeralPublicKey: extendedEphemeralPublicKey,
        extendedEphemeralPublicKeyBigInt: extendedEphemeralPublicKeyBigInt,
        maxEpoch: maxEpochNum,
        jwtRandomness: randomness
      });

      const proofResponse = await fetch(proverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jwt,
          extendedEphemeralPublicKey: extendedEphemeralPublicKeyBigInt,
          maxEpoch: maxEpochNum,
          jwtRandomness: randomness,
          salt,
          keyClaimName: "sub"
        })
      });

      if (!proofResponse.ok) {
        const errText = await proofResponse.text();
        console.error('Prover Error:', errText);
        throw new Error(`Prover failed: ${errText}`);
      }

      const zkProof = await proofResponse.json();

      // 2. Construct Transaction
      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(Number(amount) * 1_000_000_000)]);
      tx.transferObjects([coin], tx.pure.address(recipientAddress));

      // Derive address to ensure we set the correct sender
      const derivedAddress = jwtToAddress(jwt, BigInt(salt));
      tx.setSender(derivedAddress);

      // 3. Sign and Execute
      const { bytes, signature: userSignature } = await tx.sign({
        client,
        signer: ephemeralKeyPair
      });

      const addressSeed = genAddressSeed(
        BigInt(salt),
        "sub",
        decodedJwt.sub,
        decodedJwt.aud
      ).toString();

      const zkLoginSignature = getZkLoginSignature({
        inputs: {
          ...zkProof,
          addressSeed,
        },
        maxEpoch: maxEpochNum,
        userSignature,
      });

      const result = await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature: zkLoginSignature,
        options: {
          showEffects: true,
        },
      });

      if (result.effects?.status.status === 'success') {
        await onSuccess(result.digest);
      } else {
        throw new Error(`Transaction failed: ${result.effects?.status.error}`);
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      setError(message);
      console.error('Transaction error:', err);
      throw err; // Re-throw to let caller handle it
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    login,
    logout,
    getCurrentUser,
    executeTransaction,
    address
  };
}