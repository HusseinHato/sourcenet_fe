'use client';

import { create } from 'zustand';
import { KeyPair } from '@/app/types';

interface EncryptionStore {
  buyerKeyPair: KeyPair | null;
  ephemeralSigner: string | null;
  isLoading: boolean;

  setBuyerKeyPair: (keyPair: KeyPair | null) => void;
  setEphemeralSigner: (signer: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearKeys: () => void;
}

export const useEncryptionStore = create<EncryptionStore>((set) => ({
  buyerKeyPair: null,
  ephemeralSigner: null,
  isLoading: false,

  setBuyerKeyPair: (buyerKeyPair) => set({ buyerKeyPair }),

  setEphemeralSigner: (ephemeralSigner) => set({ ephemeralSigner }),

  setLoading: (isLoading) => set({ isLoading }),

  clearKeys: () =>
    set({
      buyerKeyPair: null,
      ephemeralSigner: null,
    }),
}));
