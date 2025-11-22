import { useState, useEffect } from 'react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { genAddressSeed, getZkLoginSignature, generateNonce, getExtendedEphemeralPublicKey, jwtToAddress } from '@mysten/sui/zklogin';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { getUserSalt } from '../utils/zklogin.utils';
import { useUserStore } from '../(main)/store/userStore';
import { api, setAuthToken } from '../utils/api.client';

export const useZKLogin = () => {
  const { user, setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [digest, setDigest] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize Sui Client
  const rpcUrl = process.env.NEXT_PUBLIC_SUI_RPC_URL || getFullnodeUrl('testnet');
  const client = new SuiClient({ url: rpcUrl });

  // dApp-kit wallet hooks
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  // Initialize address
  useEffect(() => {
    const initAddress = () => {
      const jwt = localStorage.getItem('zklogin_jwt');
      if (jwt) {
        const salt = getUserSalt();
        const derivedAddress = jwtToAddress(jwt, salt);
        setAddress(derivedAddress);
      } else if (currentAccount?.address) {
        setAddress(currentAccount.address);
      } else if (user?.address) {
        setAddress(user.address);
      }
    };
    initAddress();
  }, [user, currentAccount]);

  const login = async (jwt: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.login(jwt);
      if (response.data?.token) {
        setAuthToken(response.data.token);
      }
      if (response.data?.user) {
        setUser(response.data.user);
      }
      return true;
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || err.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const executeTransaction = async (
    recipientAddress: string,
    amountSui: number,
    onSuccess?: (digest: string) => void
  ) => {
    setIsLoading(true);
    setStatus({ type: 'info', message: 'Preparing transaction...' });
    setDigest(null);
    setError(null);

    try {
      const jwt = localStorage.getItem('zklogin_jwt');
      const ephemeralKeyPairStr = sessionStorage.getItem('zklogin_ephemeral_keypair');
      const randomness = sessionStorage.getItem('zklogin_randomness');
      const maxEpoch = sessionStorage.getItem('zklogin_max_epoch');
      const salt = getUserSalt();

      // 1. Handle Web3 Wallet (if connected and no ZK Login active)
      if (!jwt && currentAccount?.address) {
        setStatus({ type: 'info', message: 'Waiting for wallet approval...' });

        const tx = new Transaction();
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(Number(amountSui) * 1_000_000_000)]);
        tx.transferObjects([coin], tx.pure.address(recipientAddress));

        await new Promise<void>((resolve, reject) => {
          signAndExecuteTransaction(
            {
              transaction: tx as any,
            } as any,
            {
              onSuccess: async (result: any) => {
                try {
                  const isSuccess = result?.effects?.status?.status === 'success' ||
                    result?.status === 'success' ||
                    result?.digest;

                  if (isSuccess) {
                    const txDigest = result.digest || result?.digest;
                    setStatus({ type: 'success', message: 'Transaction successful!' });
                    setDigest(txDigest);
                    if (onSuccess) onSuccess(txDigest);
                    resolve();
                  } else {
                    const errorMsg = result?.effects?.status?.error || 'Transaction status unknown';
                    throw new Error(`Transaction failed: ${errorMsg}`);
                  }
                } catch (err) {
                  reject(err);
                }
              },
              onError: (err: any) => {
                console.error('Wallet transaction error:', err);
                reject(err);
              },
            }
          );
        });
        return;
      }

      // 2. Handle zkLogin
      if (!jwt) {
        throw new Error('Missing JWT. Please re-login.');
      }
      if (!ephemeralKeyPairStr) throw new Error('Missing Ephemeral Key. Please re-login.');
      if (!randomness) throw new Error('Missing Randomness. Please re-login.');
      if (!maxEpoch) throw new Error('Missing Max Epoch. Please re-login.');

      // Reconstruct Keypair
      const parsedKeyPair = JSON.parse(ephemeralKeyPairStr);
      if (!parsedKeyPair.secretKey) {
        throw new Error('Ephemeral private key missing. Please re-login.');
      }

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

      // Generate ZK Proof
      setStatus({ type: 'info', message: 'Generating ZK Proof (this may take a moment)...' });

      const proverUrl = process.env.NEXT_PUBLIC_PROVER_URL || 'https://prover-dev.mystenlabs.com/v1';
      const maxEpochNum = Number(maxEpoch);
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
          console.error('Error converting Base64 to BigInt:', e);
          return b64;
        }
      };

      const extendedEphemeralPublicKeyBigInt = base64ToBigInt(extendedEphemeralPublicKey);

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
        throw new Error(`Prover failed: ${errText}`);
      }

      const zkProof = await proofResponse.json();

      // Construct Transaction
      setStatus({ type: 'info', message: 'Building transaction...' });
      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(Number(amountSui) * 1_000_000_000)]);
      tx.transferObjects([coin], tx.pure.address(recipientAddress));

      // Determine sender address
      const derivedAddress = jwtToAddress(jwt, BigInt(salt));
      tx.setSender(derivedAddress);

      // Sign
      setStatus({ type: 'info', message: 'Signing and executing...' });
      const { bytes, signature: userSignature } = await tx.sign({
        client,
        signer: ephemeralKeyPair
      });

      // Decode JWT for address seed generation
      const decodedJwt = JSON.parse(atob(jwt.split('.')[1]));

      // Generate addressSeed
      // CRITICAL: Must match what the Prover used (which comes from the JWT aud)
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
        setStatus({ type: 'success', message: 'Transaction successful!' });
        setDigest(result.digest);
        if (onSuccess) onSuccess(result.digest);
      } else {
        throw new Error(`Transaction failed: ${result.effects?.status.error}`);
      }

    } catch (error: any) {
      console.error('Transaction error:', error);
      const errorMessage = error.message || 'Transaction failed';
      setStatus({ type: 'error', message: errorMessage });
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    executeTransaction,
    isLoading,
    status,
    digest,
    address,
    error
  };
};
