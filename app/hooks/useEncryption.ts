'use client';

import { useState, useCallback } from 'react';
import * as cryptoUtils from '@/app/utils/crypto.utils';
import { KeyPair } from '@/app/types';

export function useEncryption() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateKeyPair = useCallback(async (): Promise<KeyPair | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const keyPair = await cryptoUtils.generateKeyPair();
      return keyPair;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate key pair';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const computeFileHash = useCallback(async (file: File): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const hash = await cryptoUtils.computeFileHash(file);
      return hash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to compute file hash';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const encryptData = useCallback(
    async (
      data: ArrayBuffer,
      publicKey: string
    ): Promise<{ encryptedData: string; encryptedEphemeralKey: string; nonce: string; tag: string } | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const encrypted = await cryptoUtils.encryptData(data, publicKey);
        return encrypted;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to encrypt data';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const decryptData = useCallback(
    async (
      encryptedData: string,
      encryptedEphemeralKey: string,
      nonce: string,
      tag: string,
      privateKey: string
    ): Promise<ArrayBuffer | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const decrypted = await cryptoUtils.decryptData(
          encryptedData,
          encryptedEphemeralKey,
          nonce,
          tag,
          privateKey
        );
        return decrypted;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to decrypt data';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const verifyHash = useCallback((data: ArrayBuffer, expectedHash: string): boolean => {
    return cryptoUtils.verifyHash(data, expectedHash);
  }, []);

  return {
    isLoading,
    error,
    generateKeyPair,
    computeFileHash,
    encryptData,
    decryptData,
    verifyHash,
  };
}
