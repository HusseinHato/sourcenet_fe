'use client';

import { create } from 'zustand';
import { Purchase } from '@/app/types';

interface PurchaseStore {
  myPurchases: Purchase[];
  downloadedFiles: Record<string, { name: string; downloadedAt: string }>;
  isLoading: boolean;
  error: string | null;

  setPurchases: (purchases: Purchase[]) => void;
  addPurchase: (purchase: Purchase) => void;
  updatePurchase: (id: string, purchase: Partial<Purchase>) => void;
  addDownloadedFile: (purchaseId: string, fileName: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const usePurchaseStore = create<PurchaseStore>((set) => ({
  myPurchases: [],
  downloadedFiles: {},
  isLoading: false,
  error: null,

  setPurchases: (myPurchases) => set({ myPurchases }),

  addPurchase: (purchase) =>
    set((state) => ({
      myPurchases: [purchase, ...state.myPurchases],
    })),

  updatePurchase: (id, updates) =>
    set((state) => ({
      myPurchases: state.myPurchases.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  addDownloadedFile: (purchaseId, fileName) =>
    set((state) => ({
      downloadedFiles: {
        ...state.downloadedFiles,
        [purchaseId]: {
          name: fileName,
          downloadedAt: new Date().toISOString(),
        },
      },
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clear: () =>
    set({
      myPurchases: [],
      downloadedFiles: {},
      isLoading: false,
      error: null,
    }),
}));
